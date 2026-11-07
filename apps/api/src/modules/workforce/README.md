# Phân công và chốt nhân sự

Quản lý miền dùng chung menu, trang danh sách và trang chi tiết với admin. Các API nội dung dùng `AdminAuthGuard` cho phép quản lý xem bằng GET/HEAD; thêm, sửa, xóa và upload vẫn chỉ dành cho admin. Thao tác bị chặn trả HTTP 403 với thông báo “Bạn không có quyền quản lý nội dung này.” Nhân viên dẫn tour/trực page không được cấp quyền xem toàn bộ trang quản trị theo cơ chế này.

Trong phần nhân sự và điều hành, quản lý có thể xem và lọc tất cả miền. Quyền ghi vẫn kiểm tra riêng tại API: chỉ được phân công/hủy ca trong miền được cấp và chỉnh hồ sơ nhân viên thuộc hoàn toàn phạm vi mình quản lý; không được sửa admin/quản lý khác hoặc tự cấp thêm quyền. Trang hiển thị nội dung ngoài phạm vi ở chế độ xem. Dùng `npm run test:admin-access` và `npm run test:workforce` để kiểm tra quyền xem chung và quyền thao tác theo miền.

- Miền điều hành được suy ra từ các cấp cha của nơi xuất phát, theo các nút `mien-bac`, `mien-trung`, `mien-nam`. Chưa tìm được miền thì admin cần chọn trước khi phân công. Khi admin xác nhận miền, thay đổi nơi xuất phát không ghi đè lựa chọn đó.
- Hệ thống tự chốt ngay khi đủ số người tối thiểu, có cả vai trò trưởng đoàn và hướng dẫn viên, mọi phân công đều hợp lệ và tất cả đã nhận chuyến. Một người có thể kiêm nhiệm nếu được cấp đủ vai trò.
- Hạn hoàn thiện là 24 giờ trước giờ khởi hành. Sau khi chốt hoặc đến hạn, quản lý không thể sửa phân công. Chuyến thiếu người/xác nhận vẫn được cảnh báo, không công bố danh sách chưa hoàn chỉnh.
- Admin được sửa ngoại lệ trước khi chuyến khởi hành, bắt buộc ghi lý do. Admin có thể đổi miền bất kỳ lúc nào; nếu đã chốt hoặc quá hạn thì cũng cần lý do. Mọi thay đổi được ghi vào `workforce_events`.
- Sửa nhân sự, vai trò hoặc giờ điều động yêu cầu người bị thay đổi xác nhận lại. Bản công bố trước vẫn được giữ để khách theo dõi, kèm trạng thái đang cập nhật. Khi đội ngũ hợp lệ và nhận đủ chuyến, hệ thống chốt lại, chỉ tăng phiên bản nếu miền hoặc thông tin liên hệ công bố thay đổi.
- `crew_snapshot` chỉ gồm miền, tên, vai trò và số điện thoại. Ghi chú điều động, lý do từ chối và thông tin hồ sơ nội bộ không được gửi cho khách. Không cho đổi ngày giờ lịch khởi hành sau khi nhân sự đã được công bố.
- Thông báo trong tài khoản được tạo cho từng đơn `paid`, `confirmed`, `completed`, có liên kết chi tiết đặt tour. Khóa duy nhất `crew:<booking_id>:<revision>` ngăn gửi trùng. Khách chưa thanh toán không nhận danh sách liên hệ. Đây là thông báo trong ứng dụng, không gửi email/SMS.
- `CrewFinalizationService` kiểm tra khi API khởi động và mỗi phút để chốt các chuyến đã đủ điều kiện, đồng thời bổ sung thông báo cho đơn được thanh toán sau lần chốt. Xác nhận cuối cùng của nhân viên kích hoạt chốt ngay trong cùng giao dịch.

Áp dụng cấu trúc DB bằng `npm run db:crew-finalization`, sau đó tạo lại Prisma client và build các package. Migration giữ nguyên miền đã chọn trước đây, chỉ suy ra miền cho các lịch chưa có miền.

Kiểm tra bằng `npm run test:crew-finalization` và `npm run test:workforce`. Các bộ kiểm thử sử dụng giao dịch hoàn tác, không lưu khách hàng hay thông báo kiểm thử.
