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
- Thời gian đón khách phải sớm hơn thời gian khởi hành của đợt. Giao diện và API đều kiểm tra khi tạo/sửa điểm đón hoặc đổi ngày giờ khởi hành, kể cả khi chỉ đổi ngày giờ mà giữ nguyên điểm đón.
- Lịch khởi hành đang trong thời gian chốt khách không thể chỉnh sửa. Kiểm tra dựa trên ngày giờ đã lưu, không dựa trên ngày giờ mới trong yêu cầu cập nhật.
- Phương tiện từng ngày là tùy chọn. Chọn phương tiện lưu vào `tour_schedule_transports` với `transport_role = main`, `day_from = day_to = ngày được chọn`. Chọn “Không gán phương tiện” gửi `transport_id = null` và chỉ gỡ lựa chọn chính của ngày đó; bỏ hẳn trường này trong payload thì giữ dữ liệu đang có. Những vai trò bổ sung như xe trung chuyển được giữ riêng.
- Khi mở lại, các phân bổ phương tiện theo khoảng ngày cũng được khôi phục; lựa chọn cho một ngày cụ thể ưu tiên hơn khoảng ngày rộng. Không cần thêm bảng hoặc cột mới.

## Mẫu lịch trình của tour

- Mỗi tour có một mẫu trong `tour_schedule_templates`, mở từ thao tác “Mẫu lịch trình” của quản lý tour. Mẫu lưu điểm đón, danh sách điểm tham quan và các ngày gồm hoạt động, khách sạn, loại phòng, phương tiện tùy chọn. Mẫu không có ngày khởi hành cụ thể, booking hoặc phân công nhân sự.
- Điểm đón mẫu lưu `day_offset` (-1 là ngày trước khởi hành, 0 là ngày khởi hành) và giờ `HH:mm`. Khi tạo chuyến, chọn ngày khởi hành sẽ tính ngày đón tương ứng, giữ nguyên giờ đón. Nếu admin sửa riêng ngày giờ đón của điểm đó, giá trị riêng được giữ lại.
- Giao diện điểm đón mẫu dùng cùng `DateTimeInput` gộp ngày và giờ như chuyến thật. `reference_date` là ngày tham chiếu để hiển thị và khôi phục lịch mẫu; khi đổi ngày tham chiếu, các điểm đón dịch theo. Chuyến mới dùng ngày khởi hành thực tế, không lấy ngày tham chiếu làm ngày khởi hành.
- Trang thêm chuyến tự điền mẫu hiện có vào form để admin chỉnh sửa trực tiếp. Khi lưu, dữ liệu được ghi vào các bảng của chuyến như bình thường; không có liên kết cập nhật trực tiếp từ mẫu tới chuyến. Sửa mẫu hoặc chuyến không làm thay đổi bên còn lại.
- Mẫu không thay thế giá, số chỗ, ảnh, trạng thái hay tiện ích của chuyến. Các ID địa điểm, phương tiện, khách sạn và loại phòng được kiểm tra khi lưu mẫu.
- `npm run db:schedule-templates` thêm bảng mẫu mà không đổi các chuyến đang có. `npm run test:schedule-templates` kiểm tra lưu/đọc, bản sao độc lập và dữ liệu không hợp lệ; toàn bộ dữ liệu kiểm thử được rollback.

## Cài đặt và kiểm tra

- Khi lưu mẫu hoặc chuyến, giao diện kiểm tra tất cả ngày: tiêu đề, bữa ăn, nội dung chung hoặc hoạt động có giờ/tiêu đề; khách sạn và loại phòng phải đi cùng nhau nếu chọn. Phương tiện không bắt buộc. Ngày còn thiếu sẽ mở popup “Xác nhận” / “Hủy”.
- “Xác nhận” lưu phần đã nhập rồi về `/admin/tours` (mẫu) hoặc `/admin/schedules` (chuyến); “Hủy” không gửi yêu cầu lưu và giữ nguyên dữ liệu trên trang. Lưu lỗi không điều hướng.
- `allow_incomplete_itinerary` chỉ cho phép thiếu thông tin lịch trình, không bỏ qua kiểm tra ID dịch vụ, giờ sai định dạng hay thông tin cơ bản/điểm đón. Mẫu giữ nội dung nhập dở trong dữ liệu mẫu; chuyến lưu bản nhập dở trong `tour_itineraries.draft_data`, khôi phục nguyên các ô còn trống ở admin. Chỉ hoạt động có giờ và tiêu đề hợp lệ được ghi vào bảng hoạt động chính. Khi hoàn tất và lưu bình thường, bản nhập dở được xóa.
- `npm run db:itinerary-drafts` bổ sung cột lưu phần nhập dở, giữ nguyên nội dung lịch trình đang có.

`npm run db:itinerary` thêm bảng `itinerary_activities` mà không thay đổi các bản ghi lịch trình cũ. Script có thể chạy lại.

`npm run db:schedule-attractions` thêm bảng chọn điểm độc lập. Lần tạo bảng đầu tiên sao chép các liên kết địa điểm cũ từ hoạt động, không sửa nội dung ngày. Chạy lại không tự thêm lại các điểm đã bỏ chọn.

Chạy `npm run db:generate` để cập nhật Prisma Client, rồi build gói shared và khởi động lại API.

`npm run test:itinerary` kiểm tra lưu/đọc lại danh sách độc lập với ngày và giờ, xóa lựa chọn, thứ tự giờ, giới hạn cấp địa lý, không lẫn điểm giữa các chuyến, tương thích lịch trình cũ và bảo vệ các liên kết. Dữ liệu kiểm thử nằm trong transaction và luôn rollback.
