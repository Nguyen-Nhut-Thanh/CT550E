# Public assets

Ảnh được phục vụ từ `/images/...` (không thêm `public` vào URL).

| Thư mục | Nội dung |
| --- | --- |
| `images/home/` | Trang chủ: giới thiệu, lý do lựa chọn, biểu tượng dịch vụ |
| `images/blog/` | Bài viết, bài nổi bật, bài liên quan và banner quảng bá |
| `images/about/` | Trang giới thiệu; ảnh `reference-*` được giữ làm tư liệu, chưa dùng trong giao diện |
| `images/tours/` | Trang tour và lịch trình |
| `images/booking/` | Trang đặt tour: vé, hướng dẫn viên, bảo hiểm, chụp ảnh |
| `images/account/` | Trang tài khoản: avatar mặc định và biểu tượng |
| `images/shared/` | Ảnh dùng chung: ảnh tour mặc định, ảnh bìa, footer và quốc kỳ |

## Quy ước

- Tên file viết thường, dùng dấu gạch ngang, mô tả nội dung hoặc vị trí sử dụng.
- Ảnh riêng của trang đặt trong thư mục trang đó; ảnh dùng chung đặt trong `shared/`.
- Các bài blog mẫu đặt tên theo bài đang sử dụng ảnh, không xác nhận địa điểm thực tế trong ảnh.
- `images/sources.json` lưu URL nguồn, đường dẫn local, định dạng và dung lượng của 19 ảnh tải về.
- Khi đổi tên hoặc di chuyển ảnh, cập nhật cả mã TSX/TS, CSS và `sources.json`.
