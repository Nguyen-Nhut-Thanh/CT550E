# Chạy web

`npm run dev --workspace=web` chạy ở cổng 3000 bằng Turbopack để giảm thời gian
biên dịch khi mở một trang mới. Sau khi thay đổi lệnh dev cần dừng và chạy lại
tiến trình web đang dùng. API vẫn chạy riêng ở cổng 4000.

Trong chế độ dev, lần mở trang đầu tiên vẫn có thể mất thời gian biên dịch.
Next.js cũng tắt tải trước trang trong chế độ này. Không dùng thời gian mở trang
mới ở dev để kết luận tốc độ của bản chạy cho khách hàng.

Để kiểm tra bản production, giữ API đang chạy, dừng web dev ở cổng 3000 rồi chạy:

```powershell
npm run build --workspace=web
npm run start --workspace=web
```

Production dùng các trang đã được biên dịch khi build và cho phép Next.js tải
trước liên kết. Khi cần đối chiếu trình biên dịch cũ, dùng
`npm run dev:webpack --workspace=web`.

`NavigationPending` chỉ hiện sau 200ms chờ chuyển trang để tránh nháy thanh xanh; `loading.tsx`
hiển thị trạng thái chờ trong khi tải nội dung. Dữ liệu API vẫn được kiểm tra
theo từng trang để các thao tác quản trị hiển thị dữ liệu mới.

Menu quản trị tải trước trang khi rê chuột hoặc focus liên kết. Trang admin không
gọi API menu địa điểm công khai; chat khách hàng được tách tải thành gói riêng.
Thanh tiến trình chỉ là phản hồi trạng thái, không cố ý trì hoãn điều hướng.
