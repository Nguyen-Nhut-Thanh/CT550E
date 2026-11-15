Hãy đóng vai một Senior Full-Stack TypeScript Engineer. Tôi cần bạn kiểm tra và refactor dự án Monorepo du lịch (JourniTrip - gồm `packages/shared`, `packages/database`, `apps/api`, `apps/web`).

Nguyên tắc thực hiện:

- Không làm thay đổi các luồng nghiệp vụ đang chạy đúng (như VNPay IPN, Workforce locking, Membership cycle, Chat socket).
- Đảm bảo sau khi sửa xong, lệnh `npm run build` và `npm run typecheck` trên toàn bộ workspace không phát sinh lỗi.
- Thực hiện tuần tự theo 5 nhóm công việc dưới đây:

### 1. Sửa các lỗi Logic (Bugs) nghiêm trọng

1. **Lỗi hàm tạo slug tiếng Việt:**
   - Trong `packages/shared/src/common/strings.ts` (`slugify`), `apps/web/lib/admin/locations/hierarchy.ts` (`slugifyLocationName`), và `apps/web/lib/admin/schedules/tour-schedules.ts` (`normalizeScheduleSearch`): sửa `.replace(/[ ]/g, "d")` (hoặc regex bị lỗi khoảng trắng) thành `.replace(/[đĐ]/g, "d")`.
   - Trong `apps/api/src/modules/locations/locations-admin.service.ts`: bỏ hàm `createSlug()` tự viết sơ sài, chuyển sang dùng `slugify` từ `shared`.
2. **Lỗi thống kê trong `apps/api/src/modules/dashboard/dashboard.service.ts` (`getComprehensiveAnalytics`):**
   - Sửa điều kiện lọc `vnpayPaymentsAgg` từ `status: 'success'` thành `method: 'vnpay', status: 'completed'` (vì `payment.service.ts` lưu giao dịch thành công là `'completed'`).
   - Đổi truy vấn đếm nhân sự từ bảng cũ `this.prisma.staff_profiles` sang bảng mới `this.prisma.employee_profiles` (lọc `status: 'active'`).
   - Bổ sung hạng `platinum: 'Bạch Kim'` vào `tierLabels`.
   - Tính giá trị thực cho `marketing.vouchers.totalDiscountAmount` bằng cách `aggregate` tổng `discount_amount` từ bảng `bookings` (các đơn có `voucher_id != null` và `status` thuộc nhóm thành công) thay vì gán cứng bằng `0`.
3. **Đồng bộ thời gian giữ chỗ đơn hàng `pending`:**
   - Trong `apps/api/src/modules/schedules/schedules-admin.service.ts` (`getScheduleManifest`), đang đặt `HOLDING_HOURS = 12`, trong khi `payment.service.ts` và `apps/web/lib/account/booking-status.ts` dùng 15 phút. Hãy tạo hằng số dùng chung trong `packages/shared` (15 phút) và đồng bộ ở cả 3 nơi.
4. **Đồng bộ bộ lọc `tour_type` ("outbound" vs "international"):**
   - Trong `apps/api/src/modules/tours/tours-public.service.ts` (`publicList`): khi `params.tour_type` là `'outbound'` hoặc `'international'`, hãy lọc `where.tour_type = { in: ['outbound', 'international'] }` để tránh bị rỗng dữ liệu khi Frontend truyền `type=international` từ `TourFilterSidebar.tsx` hoặc `InternationalToursSection.tsx`.
5. **Sửa đường dẫn chi tiết Tour bị lệch định dạng:**
   - Trong `apps/api/src/modules/flash-deals/flash-deals.service.ts` và `apps/api/src/modules/featured-tours/featured-tours.service.ts`, sửa trường `link` từ `` `/tours/${tour.tour_id}-${slug}` `` thành `` `/tours/${tour.tour_id}` `` để khớp với `ParseIntPipe` của API và route `app/tours/[id]/page.tsx`.
6. **Sửa lỗi phân quyền & lỗ hổng nghiệp vụ trong `apps/api/src/modules/reviews/`:**
   - Trong `reviews.controller.ts` và `reviews.service.ts`:
     - Endpoint `POST reviews/:reviewId/reply` (`createReply`): chỉ cho phép Admin hoặc Nhân viên (`is_staff === true`) phản hồi đánh giá, vì UI đang hiển thị nhãn "JourniTrip CSKH".
     - Trong `createReview`: kiểm tra chặt chẽ `userId` phải có ít nhất một booking thuộc `tourId` (hoặc `dto.booking_id` phải thuộc về chính `userId` và `tourId` đó) với trạng thái đã thanh toán/hoàn thành trước khi cho phép tạo review.
     - Trong `toggleLikeReview`: bọc thao tác thêm/xóa `review_likes` và cập nhật `likes_count` vào trong `this.prisma.$transaction` để chống race condition khi người dùng bấm liên tục.
7. **Bổ sung validation cho `apps/api/src/modules/flash-deals/flash-deals.service.ts`:**
   - Kiểm tra `discount_type` chỉ nhận `'percentage'` hoặc `'fixed_amount'` / `'fixed'`.
   - Kiểm tra `discount_value > 0`, nếu là `'percentage'` thì `<= 100`, nếu là giảm tiền mặt thì phải nhỏ hơn giá gốc của lịch trình (`schedule.price`).

### 2. Bảo mật & Kiểm soát Upload File

2. **Giới hạn dung lượng và định dạng file upload ở Backend:**
   - Tại `SchedulesAdminController` (`uploadScheduleImage`), `LocationsAdminController` (`uploadLocationImage`), và `ReviewsController` (`uploadReviewImage`): bổ sung cấu hình Multer `limits: { fileSize: 5 * 1024 * 1024, files: 1 }` và `fileFilter` chỉ cho phép `['image/jpeg', 'image/png', 'image/webp']` giống như đã làm ở `PostsAdminController`.
3. **Sửa cấu hình rewrite Socket.IO:**
   - Trong `apps/web/next.config.ts`, kiểm tra và đảm bảo rewrite cho `/api/socket.io/:path*` giữ nguyên đầy đủ subpath/query khi chuyển tiếp sang `${apiOrigin}/socket.io/:path*`.

### 3. Khử trùng lặp code (DRY & Refactoring)

1. **Gom logic tính giá khuyến mãi (Flash Deal & Schedule Promotion):**
   - Tách logic tính `salePrice` / `effectivePrice` từ `flash_deals` và `schedule_promotions` (đang bị lặp ở `public-tour.mapper.ts`, `tours-public.service.ts`, và `flash-deals.service.ts`) thành một hàm helper dùng chung và thống nhất quy tắc làm tròn giá ở mọi trang.
2. **Gom câu truy vấn thống kê Best Seller:**
   - Tách câu SQL `SELECT ts.tour_id, COUNT(b.booking_id)...` đang bị viết lặp giữa `tours-public.service.ts` và `featured-tours.service.ts` thành một phương thức/helper dùng chung.
3. **Chuẩn hóa tầng gọi API & Upload ở Frontend (`apps/web/lib/http/`):**
   - Gom các hàm `fetch` tự viết lẻ tẻ (`authFetch` trong `lib/account/reviewsApi.ts`, `requestAdminUsers` trong `lib/admin/users/api.ts`) về dùng chung các hàm chuẩn trong `apps/web/lib/http/`.
   - Gom 4 hàm upload ảnh (`uploadUserAvatar`, `uploadReviewImage`, `uploadAdminBannerImage`, `uploadFeaturedLocationImage`) về dùng chung `uploadAuthenticatedFile` trong `apps/web/lib/http/uploadApi.ts`.
4. **Dọn dẹp các hàm tiện ích (Utils) trùng lặp:**
   - Xóa hàm `cleanVND` và `formatDate` khai báo trùng trong `HomeVoucherCard.tsx` và `HomeVoucherDetailModal.tsx`, chuyển sang import từ `@/lib/utils/currency` và `@/lib/utils/dateTime`.
   - Gom các hàm validation đầu vào (`text`, `id`, `object`) đang copy-paste giữa `workforce.service.ts`, `schedule-template.ts`, và `article-input.ts` vào `apps/api/src/common/validation/payload.ts`.

### 4. Tối ưu Hiệu năng (Performance & Database)

1. **Tối ưu `CrewFinalizationService.sweep()` (`apps/api/src/modules/workforce/`):**
   - Trong `finalizeCrewIfReady`, nếu lịch trình đã có `crew_locked_at` và `crew_snapshot` không thay đổi, không cần chạy lại `notifyCrewCustomers` mỗi 60 giây trong background job.
2. **Tối ưu truy vấn Dashboard & Danh sách:**
   - Trong `dashboard.service.ts` (`getStats`), tối ưu phần tính `topTours` bằng query tổng hợp (`groupBy` hoặc SQL) thay vì tải toàn bộ `tours -> tour_schedules -> bookings` lên RAM.
   - Trong `posts.service.ts` (`createPost`) và `locations-admin.service.ts` (`makeUniqueSlug`), thay vòng lặp `while (await prisma...findUnique)` bằng một truy vấn tìm các slug có cùng tiền tố (`startsWith`) để xử lý hậu tố trong bộ nhớ.
3. **Bổ sung Index trong `packages/database/prisma/schema.prisma`:**
   - Thêm `@@index([status, created_at])` vào bảng `bookings`.
   - Thêm `@@index([status, tour_type])` vào bảng `tours`.
   - Dọn dẹp cột khóa ngoại thừa `usersUser_id` trong bảng `posts`.
4. **Tối ưu Frontend React (`apps/web`):**
   - Cache kết quả `/locations/nav` trong `useNavLocationData.ts` ở mức module để `Header` và `TourFilterSidebar` không gọi trùng API khi chuyển trang.
   - Dọn dẹp các `setTimeout` khi unmount hoặc khi đóng toast sớm trong `toast-store.ts`, `HomeVoucherCard.tsx`, `HomeVoucherDetailModal.tsx`, `TourDetailHero.tsx`.
   - Trong `useHeroBannerSlider.ts`: thay thế việc thao tác DOM trực tiếp (`container.appendChild` / `container.prepend`) bằng việc xoay vòng mảng state trong React để tránh xung đột với Virtual DOM.

### 5. Dọn dẹp Dependencies & Type-safety

- Đồng bộ phiên bản `lucide-react` giữa root `package.json` và `apps/web/package.json` (bỏ các package cài thừa ở root nếu không dùng).
- Thay các kiểu `any` ở `packages/shared` (`totalAmount`, `discount_value`) bằng union type chặt chẽ (`number | string`).
- Chuẩn hóa trường `user` vs `users` và `replies` vs `review_replies` trong `TourReview` (`packages/shared/src/tours/models.ts` và `tours-public.service.ts`).


