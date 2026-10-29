# API

## Chạy phát triển

`npm run dev --workspace=api` theo dõi `src` bằng TypeScript, chờ lần biên dịch
đầu tiên thành công rồi khởi động API. Khi sửa mã nguồn, TypeScript cập nhật
`dist` và Node tự nạp lại máy chủ. Không cần build thủ công sau mỗi lần sửa.
Nếu đang dùng tiến trình dev cũ, khởi động lại một lần để dùng cơ chế này.

## Cấu trúc

```text
src/
  main.ts                    # Nạp môi trường, gọi bootstrap
  bootstrap.ts               # Tạo ứng dụng, CORS, validation, shutdown
  app.module.ts              # Đăng ký các module
  config/                    # Môi trường và cấu hình JWT dùng chung
  common/
    auth/                    # Tra user từ account, giữ thông báo lỗi của từng luồng
    utils/                   # Tiện ích số và ngày
    validation/              # Kiểm tra payload và chuẩn hóa giá
  infrastructure/
    database/                # Prisma, MongoDB và vòng đời kết nối
    mail/                    # Gửi email và dựng nội dung email
    security/                # JwtModule dùng chung
    storage/                 # Cấu hình Cloudinary và upload buffer
  modules/
    banners/
      banners.module.ts
      banners-admin.controller.ts
      banners-public.controller.ts
      banners.service.ts
```

Các nhóm chức năng gồm `auth`, `banners`, `bookings`, `catalogs`, `chat`,
`dashboard`, `favorites`, `featured-tours`, `flash-deals`, `locations`,
`payment`, `posts`, `reviews`, `schedules`, `tours`, `users`, `vouchers`.

File controller, service, helper, mapper, guard, strategy và DTO đặt trực tiếp
trong thư mục của chức năng. Không tạo thêm thư mục con chỉ để phân loại file;
dùng hậu tố tên file để nhận biết vai trò.

- `tours` quản lý tour; `schedules` quản lý lịch khởi hành, giá, lịch trình,
  khách sạn của lịch và email đổi lịch; `catalogs` đọc danh mục khách sạn,
  loại phòng và phương tiện. Đường dẫn HTTP cũ được giữ nguyên.
- Controller quản trị dùng `AdminAuthGuard`; endpoint đăng nhập admin vẫn
  công khai, endpoint xem tài khoản admin vẫn kiểm tra quyền trong handler.
- Đăng ký service tại module sở hữu. `DatabaseModule` là global module duy
  nhất cung cấp Prisma cho các chức năng; không thêm Prisma vào providers
  của từng module. PostgreSQL và MongoDB được khởi tạo/đóng bằng lifecycle
  của Nest, trước khi ứng dụng bắt đầu nhận request.
- Các module cần gửi email hoặc upload phải import `MailModule` hoặc
  `CloudinaryModule`; không tự cấu hình lại client. Controller giữ tên thư mục
  upload, giới hạn file và thông báo lỗi của endpoint.
- Auth và chat dùng cùng `SecurityModule`. Secret và thời hạn JWT nằm tại
  `config/jwt.ts`, giữ cách tính thời hạn token của luồng đăng nhập.
- Chỉ đưa helper dùng chung vào `common/`. Mapper lịch khởi hành, dịch vụ bổ
  sung booking và chuẩn hóa tour nằm cùng nhóm nghiệp vụ.
- Các kiểu dữ liệu/hợp đồng nằm trong `packages/shared/src`, import từ
  `shared`. DTO có decorator kiểm tra dữ liệu nằm tại `modules/auth/auth.dto.ts`.
- Interface rỗng mở rộng `PrismaService` được giữ cạnh class proxy trong
  `infrastructure/database/prisma.service.ts` để giữ đúng kiểu Prisma và
  metadata dependency injection của Nest.
- Các route alias dashboard và hai cách gọi xóa lịch khởi hành là tương thích
  đang được hỗ trợ; không bỏ một route chỉ vì handler có cùng nội dung.

## Kiểm tra

Chạy từ gốc repository:

```sh
npm run build --workspace=shared
npm run typecheck
```

Build API xóa `dist/` trước khi biên dịch để tránh giữ JavaScript/declaration
cũ của các file đã di chuyển hoặc bị xóa.

## Human support chat

`ChatModule` owns the authenticated `/chat` HTTP API and `/chat` Socket.IO
namespace. Both customer and staff screens reuse the same message timeline,
composer, connection hook and request helper. Contracts live in shared `chat/`;
staff workspace props live in shared `admin/chat/`.

- Customers can read and write only their own conversations. Every HTTP request,
  socket event and broadcast recipient is checked against current account/role
  data. Staff can inspect the queue; only the assigned staff member can reply.
- Claim and transfer serialize on the conversation row. Statuses are `WAITING`,
  `IN_PROGRESS`, `CLOSED`. A new customer message reopens the existing conversation;
  resolving never deletes history. Unavailable assignees return to the queue.
- `client_message_id` makes retries idempotent. Messages use cursor pagination
  (`before` / `after`), including catch-up after reconnect. Read receipts apply
  only through the last message visible at the bottom of an active screen.
- Context cards derive tour/booking details on the server; booking ownership is
  checked against the customer. Image uploads accept JPEG/PNG/GIF/WebP up to 5 MB.
- Configure the existing `JWT_SECRET`, `CORS_ORIGINS` and `CLOUDINARY_*` settings.
  Apply `packages/database/prisma/migrations/20261021_human_support_chat/migration.sql`
  to an existing database before deploying this API, then regenerate Prisma.
  The migration adds fields/indexes and normalizes legacy `OPEN` conversations
  to `WAITING`, preserving messages. New databases use the Prisma schema.
