# Thư viện web

## Theo chức năng

| Thư mục | Nội dung |
| --- | --- |
| `auth/` | Đăng nhập, đăng ký, xác thực email và quản lý token |
| `account/` | Hồ sơ cá nhân, thống kê, danh sách booking và đánh giá của tài khoản |
| `booking/` | API đặt tour/thanh toán/voucher, hành khách, ngày sinh và tính giá |
| `tours/` | API danh sách/chi tiết tour và định dạng thông tin tour |
| `favorites/` | API và hook quản lý tour yêu thích |
| `home/` | API dữ liệu trang chủ và hook điều khiển banner |
| `navigation/` | Danh sách menu và hook lấy dữ liệu điểm đến |
| `search/` | Mức ngân sách và hook xử lý tìm tour |
| `recommendations/` | Gửi sự kiện phục vụ gợi ý tour |
| `chat/` | API, socket, hooks, sự kiện mở chat và định dạng tin nhắn |
| `vouchers/` | Kiểm tra hiệu lực và trạng thái khóa voucher |

`admin/` chia tiếp theo nghiệp vụ: `auth`, `banners`, `bookings`,
`catalogs`, `dashboard`, `flash-deals`, `locations`, `posts`,
`schedules`, `tours`, `users`, `vouchers`.
Trong mỗi nhóm, `api.ts` gửi request, `forms.ts` xử lý dữ liệu form;
`filters.ts`, `status.ts`, `hierarchy.ts`, `featured.ts` có nhiệm vụ ghi trong tên.

## Hạ tầng dùng chung

- `http/`: địa chỉ API, gửi request, xử lý JSON và upload.
- `utils/`: định dạng tiền, ngày giờ, ảnh, lịch và hộp thoại xác nhận.
- `hooks/`: hooks không gắn riêng với nghiệp vụ, hiện có `useCountdown`.
- `ui/`: xử lý tương tác giao diện dùng chung, như đóng popup khi bấm ngoài hoặc Escape.
- `notifications/`: context, hook và trạng thái thông báo ngắn; giao diện nằm ở `components/common`.

`http/config.ts` lấy địa chỉ API từ `NEXT_PUBLIC_API_BASE`, mặc định
`http://localhost:4000`. Các request công khai, có token và admin giữ
cách xử lý response riêng để phù hợp với các API hiện tại.

## Quy ước thêm code

1. Đặt code vào nhóm chức năng đang phụ trách. Chỉ đưa vào `utils/`,
   `hooks/`, `http/` khi nó dùng chung và không phụ thuộc nghiệp vụ cụ thể.
2. Import trực tiếp từ file, ví dụ `@/lib/booking/travelers` hoặc
   `@/lib/utils/currency`. Không tạo `index.ts` gom mọi export hoặc file
   chuyển tiếp chỉ để giữ đường dẫn cũ.
3. Kiểu dữ liệu/hằng số dùng chung giữa web và API được import trực tiếp
   từ package `shared`.
4. Tách hàm tính toán/xử lý form khỏi hàm gửi request. Hook đặt cùng nhóm
   chức năng sử dụng nó.

Kiểm tra sau khi thay đổi:

```sh
npm run typecheck --workspace=web
npm run test:lib --workspace=web
```

Các kiểm thử trong `apps/web/tests/lib.test.ts` kiểm tra lịch, dữ liệu
hành khách, tính giá, ngày sinh và hợp đồng request sau khi tách module.
