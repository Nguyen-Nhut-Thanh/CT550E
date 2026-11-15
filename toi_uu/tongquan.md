Bạn là Senior NestJS, TypeScript & PostgreSQL Architect. Hãy thực hiện tối ưu hiệu năng, sửa lỗi logic, dọn dẹp code trùng lặp (DRY) và chuẩn hóa toàn bộ codebase backend (thư mục `src/`, đối chiếu với `prisma/schema.prisma`), đảm bảo giữ nguyên 100% logic nghiệp vụ đúng và contract JSON response hiện tại cho Frontend.

Hãy thực hiện tuần tự theo 5 giai đoạn sau và kiểm tra build (`tsc --noEmit`) sau mỗi giai đoạn:

### GIAI ĐOẠN 1: Kiến trúc chung, Bảo mật, Encoding & DRY

1. **Encoding & Bảo mật lỗi nội bộ:**
   - Khôi phục toàn bộ chuỗi thông báo lỗi/log tiếng Việt bị lỗi encoding (mất dấu/mojibake) về chuẩn UTF-8 tiếng Việt có dấu tự nhiên.
   - Tại `SchedulesAdminService` (`createSchedule`, `updateSchedule`) và các service khác: tuyệt đối không trả trực tiếp `error.message` / `prismaError.message` của database về client qua `BadRequestException` để tránh lộ schema; chỉ log đầy đủ qua `this.logger.error` và trả thông báo thân thiện cho client.
2. **Tái sử dụng code (DRY) & Chuẩn hóa Type:**
   - Tạo decorator `@UseImageUpload(fieldName = 'file')` trong `common/decorators/` đóng gói `FileInterceptor` (`memoryStorage()`, giới hạn 5MB, chỉ nhận `image/jpeg`, `image/png`, `image/webp`). Thay thế toàn bộ cấu hình lặp ở `SchedulesAdminController`, `ReviewsController`, `PostsAdminController`, `LocationsAdminController`, `BannersController`.
   - Chuẩn hóa toàn bộ route param `:id` / `:scheduleId` sang dùng `ParseIntPipe` thay cho ép kiểu thủ công `Number(id)`.
   - Tạo interface `AuthenticatedRequest` và `StaffRequest` chuẩn trong `common/auth/` để thay thế toàn bộ `@Req() req: any`.
   - Xóa endpoint chết `@Post('staff')` ở `UsersAdminController` (đã chuyển sang `WorkforceController`).
   - Bỏ `@Global()` ở `WorkforceModule` và khai báo `imports: [WorkforceModule]` tường minh tại các module sử dụng (`MembershipModule`, `ChatModule`, v.v.).

### GIAI ĐOẠN 2: Tối ưu Query hiệu năng cao (`tours`, `locations`, `dashboard`)

1. **Module `tours` (`public-tour.mapper.ts`, `tours-public.service.ts`):**
   - Tách logic tính giá sau khuyến mãi (Flash Deal vs Schedule Promotion) đang bị lặp ở `formatTourCard` và `publicDetail` thành một pure function duy nhất `calculateSchedulePricing(schedule, now)` trong `public-tour.mapper.ts`.
   - Tối ưu `ToursPublicService.publicList`: đẩy điều kiện lọc lịch khởi hành còn chỗ (`quota > booked_count` và `start_date >= now + cut_off_hours`), sắp xếp (`bestseller`, `nearest`, `updated_at`) và phân trang (`take`, `skip`) xuống tầng database (dùng `Prisma.$queryRaw` lấy danh sách `tour_id` của trang hiện tại kèm `COUNT(*) OVER()`), sau đó mới query chi tiết cho đúng các `tour_id` đó thay vì load toàn bộ tour lên RAM.
2. **Module `locations` (`locations-public.service.ts`):**
   - Sửa lỗi N+1 query trong `getFeaturedDestinations()`: query toàn bộ địa điểm con (`parent_id: { in: tabIds }`, `is_featured: true`) trong 1 lần gọi Prisma duy nhất rồi gom nhóm theo `parent_id` bằng `Map` trên memory.
3. **Module `dashboard` (`dashboard.service.ts`):**
   - Tối ưu `getComprehensiveAnalytics()`: thay thế việc load toàn bộ `schedule_crew`, toàn bộ `bookings` lịch sử (`vipBookings`) và toàn bộ `tours` lên Node.js bằng các truy vấn tổng hợp trực tiếp từ DB (`groupBy` theo `user_id` lấy top 10 VIP, `groupBy` theo `user_id` trên `schedule_crew` lấy top 15 nhân sự, `groupBy` theo `tour_id` lấy top 10 tour).
   - Thay thế `getComprehensiveExcel` (đang xuất XML giả đuôi `.xls`) bằng thư viện `exceljs` để xuất file `.xlsx` chuẩn nhị phân.

### GIAI ĐOẠN 3: Xử lý lỗi logic & Transaction (`vouchers`, `reviews`, `membership`, `schedules`)

1. **Module `vouchers` (`vouchers.service.ts`):**
   - Thay thế cơ chế đọc/ghi file JSON (`fs.readFileSync`/`writeFileSync`) trong `getHomeVoucherConfig` và `updateHomeVoucherConfig` bằng việc lưu vào bảng cấu hình trong database (JSONB) để đảm bảo an toàn khi deploy nhiều instance/stateless container.
   - Tách hàm `notifyAudience()` ra khỏi `$transaction` của `create()` và `update()` để chạy bất đồng bộ sau khi commit voucher, tránh timeout và rollback khi số lượng user lớn.
   - Trong `validatePublicVoucher`: nếu có truyền `tourId` nhưng không tìm thấy tour trong DB (`!tour`), ném `BadRequestException('Tour không tồn tại.')` thay vì bỏ qua.
2. **Module `reviews` (`reviews.service.ts`):**
   - Gom logic map object `review` và `review_replies` đang bị lặp lại 4 lần thành helper `mapReviewResponse(review, currentUserId?)` với type Prisma đầy đủ (xóa `any`).
   - Cho phép `recalculateTourRating(tourId, tx?)` nhận optional `Prisma.TransactionClient` và dùng chung ở cả `updateMyReview` lẫn `adminUpdateReviewStatus`.
3. **Module `membership` (`membership.controller.ts`, `membership.service.ts`):**
   - Tối ưu `MembershipController.validate` để tránh gọi trùng lặp transaction nặng `syncUser` và query user/membership 2 lần liên tiếp trong cùng 1 request kiểm tra voucher.
4. **Module `schedules` (`schedules-admin.service.ts`):**
   - Trong `updateSchedule`: gộp toàn bộ bước đọc và validate điều kiện vào bên trong `$transaction` ngay sau dòng `SELECT ... FOR UPDATE` để tránh stale read và bỏ query thừa bên ngoài transaction.

### GIAI ĐOẠN 4: Rà soát các module lõi còn lại (`bookings`, `auth`, `chat`, `banners`, `catalogs`)

1. **Module `bookings`:**
   - Đảm bảo luồng tạo booking và hủy/hoàn tiền đều nằm trong `$transaction`, khóa dòng (`SELECT ... FOR UPDATE`) trên `tour_schedules` theo thứ tự khóa nhất quán với `PaymentService` và `SchedulesAdminService` để chống overbooking và deadlock.
   - Đảm bảo job/logic nhả ghế đơn `pending` quá hạn 15 phút không trừ âm `booked_count` và không xung đột nếu user vừa thanh toán thành công.
   - Tính toán lại 100% giá vé, phụ thu, ưu đãi hạng thành viên và voucher ở Backend từ dữ liệu DB, không tin tưởng số tiền từ client.
2. **Module `auth`:**
   - Đảm bảo `JwtAuthGuard` và `AdminAuthGuard` kiểm tra trạng thái hoạt động của tài khoản (`status === 1`) và từ chối ngay nếu tài khoản bị khóa giữa chừng; chuẩn hóa `request.user` khớp `AuthenticatedRequest`.
3. **Module `chat`:**
   - Siết chặt phân quyền hội thoại (khách hàng chỉ truy cập `conversation` của chính mình; nhân viên phải qua `WorkforceAccessService.customer()`), phân trang tin nhắn/hội thoại bằng cursor/limit.
4. **Module `banners` & `catalogs`:**
   - Áp dụng `@UseImageUpload()`, `ParseIntPipe`, bỏ `any`, kiểm tra chặt điều kiện `status = 1` và thời gian hiệu lực cho các API public.

### GIAI ĐOẠN 5: Chuẩn hóa Validation với Zod

1. Tạo `ZodValidationPipe` trong `common/pipes/zod-validation.pipe.ts` để validate body/query và ném `BadRequestException` với thông báo lỗi tiếng Việt rõ ràng.
2. Chuyển đổi các hàm validate thủ công lặp lại (`typeof`, regex ngày giờ, độ dài chuỗi, số nguyên) sang Zod schema tại `WorkforceService`, `VouchersService`, `PostsService`, `SchedulesAdminService`, `ToursAdminService`, `BookingsService` mà vẫn giữ nguyên các thông báo lỗi nghiệp vụ.
