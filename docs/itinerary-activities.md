# Lịch trình theo giờ và khám phá điểm đến

- Tour chọn tỉnh/thành (cấp 5 trong hệ thống hiện tại), thứ tự trong danh sách là thứ tự tuyến hành trình.
- Mỗi lịch khởi hành lưu lịch trình riêng. Trong từng ngày, admin tích địa điểm tham quan (cấp 6) trực thuộc một tỉnh/thành đã chọn trong tour và nhập giờ, tiêu đề, mô tả trải nghiệm.
- Hoạt động di chuyển, ăn uống, nghỉ ngơi không cần liên kết địa điểm. Các hoạt động được sắp theo giờ khi lưu.
- Trang chi tiết tour hiển thị tab ngày, timeline theo giờ và ảnh địa điểm của hoạt động đang chọn. Mục khám phá điểm đến lấy cùng dữ liệu của lịch khởi hành đang xem; chỉ hiển thị điểm tham quan được chọn.
- Mô tả chung và ảnh địa điểm lấy từ `locations.note` và `location_images`. Nội dung hoạt động là trải nghiệm riêng trong tour.
- Lịch trình cũ giữ nguyên nội dung; cần nhập các mốc giờ trong admin để hiển thị timeline đầy đủ. Không tự suy diễn giờ hoặc điểm tham quan từ nội dung cũ.
- Không thể xóa/đổi cấu trúc địa điểm đang dùng trong hoạt động, hoặc bỏ tỉnh/thành khỏi tuyến khi lịch trình còn sử dụng điểm tham quan của tỉnh/thành đó.

## Cài đặt và kiểm tra

`npm run db:itinerary` thêm bảng `itinerary_activities` mà không thay đổi các bản ghi lịch trình cũ. Script có thể chạy lại.

Chạy `npm run db:generate` để cập nhật Prisma Client, rồi build gói shared và khởi động lại API.

`npm run test:itinerary` kiểm tra lưu/đọc lại, thứ tự giờ, giới hạn cấp địa lý, không lẫn điểm giữa các chuyến, tương thích lịch trình cũ và bảo vệ các liên kết. Dữ liệu kiểm thử nằm trong transaction và luôn rollback.
