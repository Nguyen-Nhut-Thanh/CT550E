# Voucher theo nhóm khách hàng

`eligible_tiers` lưu danh sách mã hạng được áp dụng. Mảng rỗng là tất cả hạng; voucher cá nhân vẫn kiểm tra `owner_user_id` độc lập. Chọn Vàng chỉ áp dụng đúng Vàng; muốn cả Bạch kim và Kim cương thì chọn thêm các hạng đó. Voucher cũ được mặc định mảng rỗng, không thay đổi quyền sở hữu hoặc điều kiện cũ.

Trong khung Thời gian & số lượng, dropdown Đối tượng áp dụng cho tích nhiều hạng. Tất cả khách hàng khóa các lựa chọn hạng; bỏ tích Tất cả để chọn riêng. Không thể lưu nếu chưa tích lựa chọn nào. Form gửi ngày giờ ISO có múi giờ, đảm bảo thời gian hiển thị và thời gian lưu nhất quán.

Khi tạo voucher hoạt động, hệ thống lưu voucher và thông báo trong cùng transaction. Người nhận là khách có tài khoản đang hoạt động, không phải nhân viên, thuộc các hạng đã chọn theo `memberships.tier` đang được hệ thống ghi nhận. Người chưa có bản ghi membership được xem là Member. Nhận thông báo không giữ riêng lượt dùng: số lượng vẫn là tổng lượt dùng chung của mã.

Voucher tạm dừng chưa gửi thông báo. Kích hoạt bằng API update sẽ gửi; khóa duy nhất `voucher:voucherId:userId` cùng `skipDuplicates` ngăn gửi lại cho người đã nhận khi kích hoạt nhiều lần. Việc chọn nhóm và gửi được xử lý ở máy chủ; client không được tự truyền danh sách người nhận. Không gửi email hoặc SMS.

Menu ba chấm hỗ trợ khóa/mở bằng cập nhật riêng `status` (0/1). Mã đã dùng một phần vẫn có thể khóa/mở nếu còn hạn và còn lượt; không đổi điều kiện hoặc xóa lịch sử. Mở lại không gửi trùng thông báo cho người đã nhận. Máy chủ khóa bản ghi khi đổi trạng thái và từ chối mở mã hết hạn/hết lượt. Trạng thái hiển thị phân biệt Hoạt động, Tạm khóa, Sắp có hiệu lực, Hết hạn và Hết lượt; việc đã có lượt sử dụng không đồng nghĩa mã đang tạm khóa.

Xóa voucher chỉ phụ thuộc số lượt sử dụng: `used_count = 0` được xóa dù đang khóa hoặc hết hạn; đã có lượt dùng thì nút xóa bị vô hiệu hóa và API từ chối xóa.

Thông báo lưu `voucher_id`, dẫn tới Ví voucher & ưu đãi. Ví bao gồm mã cá nhân và mã chung phù hợp với hạng hiện tại. Mã có hiệu lực trong tương lai nằm ở Sắp có hiệu lực. Người đổi hạng có thể thấy hoặc mất quyền dùng mã theo nhóm; thông báo cũ không thay thế điều kiện dùng mã.

Kiểm tra mã ở API validate và kiểm tra lại lúc tạo booking. Hạng được đồng bộ trước khi kiểm tra tại các endpoint khách hàng/nhân viên. Trừ lượt bằng update có điều kiện trên hạn dùng, trạng thái, người sở hữu và hạng để chặn thay đổi điều kiện giữa lúc kiểm tra và thanh toán. Thứ tự tính tiền giữ nguyên: voucher trước, giảm theo hạng trên tiền tour còn lại, giảm dịch vụ riêng.

Áp dụng DB hiện hữu: `npm run db:voucher-audiences`, sau đó `npm run db:generate`. Môi trường Prisma Migrate dùng migration `202611030002_voucher_audiences` thay cho script. Kiểm thử: `npm run test:voucher-audiences`; thêm `-- --database` kiểm tra DB trong transaction luôn rollback, bao gồm cả thông báo thử.
