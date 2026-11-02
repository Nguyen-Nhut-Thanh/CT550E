# Lịch trình theo giờ và khám phá điểm đến

- Tour chọn tỉnh/thành (cấp 5 trong hệ thống hiện tại), thứ tự trong danh sách là thứ tự tuyến hành trình.
- Mỗi lịch khởi hành lưu danh sách điểm tham quan riêng trong `tour_schedule_attractions` (`tour_schedule_id`, `location_id`, `sort_order`). Thẻ “Điểm tham quan” hiện các tỉnh/thành của tour theo thứ tự tuyến; bấm tỉnh/thành để tích địa điểm cấp 6 trực thuộc. Không gắn lựa chọn này với ngày hay giờ.
- Trong “Lịch trình & Dịch vụ”, mỗi dòng có cột thời gian và nội dung để nhập giờ, tiêu đề, mô tả trải nghiệm. Những dòng này lưu riêng tại `itinerary_activities`, liên kết tới ngày qua `tour_itinerary_id`. Cột `time` đã có sẵn, kiểu `varchar(5)` và giá trị 24 giờ `HH:mm`, ví dụ `08:30`; giao diện AM/PM chỉ đổi cách hiển thị.
- Chọn/bỏ điểm tham quan không thêm/xóa hoạt động trong ngày. Hoạt động cũ có `location_id` vẫn được giữ nguyên, nhưng không quyết định danh sách điểm tham quan của chuyến.
- Hoạt động di chuyển, ăn uống, nghỉ ngơi không cần liên kết địa điểm. Các hoạt động được sắp theo giờ khi lưu.
- Trang chi tiết tour hiển thị tab ngày và timeline theo giờ. Mục khám phá điểm đến lấy `tour_schedule_attractions` của lịch khởi hành đang xem; địa điểm vẫn hiển thị khi chưa có lịch trình ngày hay mốc giờ.
- Mô tả chung và ảnh địa điểm lấy từ `locations.note` và `location_images`. Nội dung hoạt động là trải nghiệm riêng trong tour.
- Lịch trình cũ giữ nguyên nội dung; cần nhập các mốc giờ trong admin để hiển thị timeline đầy đủ. Không tự suy diễn giờ hoặc điểm tham quan từ nội dung cũ.
- Không thể xóa/đổi cấu trúc địa điểm đang được chọn hoặc dùng trong hoạt động, hoặc bỏ tỉnh/thành khỏi tuyến khi chuyến còn sử dụng điểm tham quan của tỉnh/thành đó.
- Điểm đón đã có bảng riêng `schedule_pickup_points`, liên kết từng lịch khởi hành qua `tour_schedule_id`: tên, địa chỉ, `pickup_at`, ghi chú và thứ tự. `pickup_at` lưu cả ngày và giờ, khác với giờ hoạt động trong ngày. Khách sạn và loại phòng lưu tại `tour_schedule_hotels`, gắn ngày bằng `day_from`/`day_to`.

## Cài đặt và kiểm tra

`npm run db:itinerary` thêm bảng `itinerary_activities` mà không thay đổi các bản ghi lịch trình cũ. Script có thể chạy lại.

`npm run db:schedule-attractions` thêm bảng chọn điểm độc lập. Lần tạo bảng đầu tiên sao chép các liên kết địa điểm cũ từ hoạt động, không sửa nội dung ngày. Chạy lại không tự thêm lại các điểm đã bỏ chọn.

Chạy `npm run db:generate` để cập nhật Prisma Client, rồi build gói shared và khởi động lại API.

`npm run test:itinerary` kiểm tra lưu/đọc lại danh sách độc lập với ngày và giờ, xóa lựa chọn, thứ tự giờ, giới hạn cấp địa lý, không lẫn điểm giữa các chuyến, tương thích lịch trình cũ và bảo vệ các liên kết. Dữ liệu kiểm thử nằm trong transaction và luôn rollback.
