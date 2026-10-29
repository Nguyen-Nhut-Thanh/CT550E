# Shared

Kiểu dữ liệu, hợp đồng API, dữ liệu form, props và hằng số dùng trong ứng dụng.
Code web/API tiếp tục import từ điểm vào công khai `shared`:

```ts
import type { BookingPayload, PublicTourDetail } from "shared";
import { BOOKING_EXTRAS } from "shared";
```

## Cấu trúc

| Thư mục | Phạm vi |
| --- | --- |
| `account/` | Hồ sơ, booking/đánh giá của tài khoản, props và bộ nhớ đệm |
| `auth/` | Đăng nhập, JWT, kiểu request backend và giao diện xác thực |
| `banners/` | Dữ liệu banner |
| `blog/` | Dữ liệu và props bài viết công khai |
| `booking/` | Hành khách, tính giá, payload đặt tour, dịch vụ bổ sung và props |
| `chat/` | Tin nhắn, hội thoại, sự kiện socket, dữ liệu hiển thị và props |
| `favorites/` | Dữ liệu và kết quả thao tác tour yêu thích |
| `home/` | Dữ liệu trang chủ, banner slider, điểm đến/tour nổi bật và flash deal |
| `locations/` | Dữ liệu địa điểm, tọa độ và hằng số phân cấp |
| `navigation/` | Dữ liệu menu và điểm đến trong menu |
| `recommendations/` | Payload sự kiện gợi ý tour |
| `reviews/` | Payload đánh giá/phản hồi và dữ liệu giao diện đánh giá tour |
| `search/` | Dữ liệu và props tìm kiếm |
| `tours/` | Dữ liệu tour, hợp đồng API, bản ghi backend, bản đồ, chính sách và props |
| `vouchers/` | Dữ liệu voucher, kết quả kiểm tra và payload API |
| `common/` | Kiểu HTTP, lịch, upload, UI dùng chung và tiện ích chuỗi |

`admin/` chia theo nghiệp vụ: `auth`, `banners`, `bookings`, `chat`,
`dashboard`, `flash-deals`, `locations`, `posts`, `reviews`, `schedules`,
`tours`, `users`, `vouchers`; props quản trị dùng chung nằm ở `admin/common/`.

Trong mỗi nhóm, chỉ tạo những file cần thiết:

- `models.ts`: dữ liệu nghiệp vụ và dữ liệu hiển thị.
- `contracts.ts`: payload, query, response hoặc sự kiện trao đổi qua API/socket.
- `forms.ts`: trạng thái form và bộ lọc của giao diện quản trị.
- `props.ts`: hợp đồng của component và tham số hook.
- `records.ts` / `server.ts`: kiểu bản ghi hoặc request chỉ dành cho backend.
- `constants.ts`: hằng số chạy thật; `tours/policies.ts` chứa cả hằng số chính sách
  và các kiểu được suy ra từ nó.

## Quy ước

1. Tìm kiểu sẵn có trong đúng nhóm chức năng trước khi tạo kiểu mới. Dùng `Pick`,
   `Omit`, `Partial` hoặc generic khi các biến thể có chung cấu trúc. Giữ nguyên
   ý nghĩa trường bắt buộc/tùy chọn, `null`, ngày dạng chuỗi và `Date`.
2. Phân biệt dữ liệu API với trạng thái form và props. Không gộp các cấu trúc
   khác nhau chỉ vì tên gần giống nhau; kiểu mới nên có tên rõ chức năng.
3. Các module trong `src/` import trực tiếp bằng đường dẫn tương đối và dùng
   `import type` cho phụ thuộc kiểu. Không import ngược qua `src/index.ts`,
   từ `apps/`, hoặc qua các file `index.ts` trung gian.
4. `src/index.ts` là điểm vào công khai duy nhất, liệt kê rõ `export type` và
   `export` cho hằng số/hàm. Không để props React hoặc kiểu Express tạo phụ
   thuộc JavaScript khi nạp package.
5. `common/browser.ts` mở rộng `Window` cho Google Maps và được nạp qua điểm vào
   package. Đây là khai báo toàn cục dùng ngầm, không xóa chỉ vì không có named import.
6. DTO có decorator kiểm tra dữ liệu vẫn nằm trong API vì chúng thực thi lúc chạy.

## Kiểm tra

Build shared trước khi kiểm tra web/API vì package xuất bản khai báo trong `dist/`:

```sh
npm run build --workspace=shared
npm run typecheck
```
