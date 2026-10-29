# Hạng thành viên và voucher

- Người dùng: `/account/membership`, `/account/wallet`, `/account/notifications`.
- Quản trị: `/admin/marketing/membership` (mốc hạng, loại ưu đãi, mức giảm, điều kiện đơn và thống kê).
- Khởi tạo database hiện hữu: `npm run db:membership`. Script chỉ thêm schema mới trong một transaction và không sửa booking/voucher hiện có. Chạy lại sẽ kiểm tra và bỏ qua nếu đã cài đầy đủ. Repository hiện có các migration SQL được áp dụng trực tiếp; với môi trường dùng Prisma Migrate, áp dụng migration `202610290001_membership_rewards` theo quy trình của môi trường, không chạy đồng thời cả hai cách.
- Tạo Prisma Client: `npm run db:generate`; khởi động web/API: `npm run dev`.

## Quy tắc

Chi tiêu bằng tổng khoản thanh toán `completed`, trừ các khoản `refunded`, tối đa bằng `booking.total_amount` (đã trừ voucher). Chỉ tính booking `paid`, `confirmed`, `completed` và sau hết ngày kết thúc tour tại Việt Nam. Thời điểm ghi nhận là thời điểm muộn hơn giữa hết ngày tour và khoản thanh toán thành công cuối cùng. Booking hủy không được tính. Phụ thu và dịch vụ đã thanh toán nằm trong tổng chi tiêu; voucher chỉ giảm trên tiền hành khách, trước phụ thu và dịch vụ.

Chu kỳ đầu bắt đầu từ lần ghi nhận đầu tiên. Mốc này giữ nguyên khi hoàn tiền/hủy tour. Chu kỳ 12 tháng theo ngày tại Việt Nam, gồm ngày bắt đầu và không gồm thời điểm bắt đầu kỳ kế tiếp. Ngày 29/02 chuyển thành 28/02 ở năm thường và trở lại 29/02 ở năm nhuận.

Hạng hiện tại là mức cao hơn giữa hạng kiếm được trong kỳ trước và hạng theo chi tiêu kỳ hiện tại. Khi sang kỳ mới, chi tiêu bằng 0; chỉ mang theo hạng kiếm được từ chi tiêu kỳ vừa kết thúc. Vì vậy một kỳ không chi tiêu không thể giữ hạng mãi. Hủy/hoàn tiền sẽ tính lại chi tiêu và hạng tương ứng. Cấu hình admin mới được dùng trong lần xét tiếp theo, bao gồm tính lại lịch sử; điều kiện voucher đã cấp không thay đổi.

Mỗi hạng đạt/giữ được có tối đa một voucher trong mỗi kỳ. Khi nhảy nhiều hạng cùng lúc, chỉ cấp voucher theo hạng cao nhất ở lần xét đó. Mặc định voucher dùng một lần, hạn 90 ngày từ ngày cấp, gắn với `owner_user_id`. `reward_key` duy nhất và advisory lock theo user ngăn cấp trùng giữa nhiều API process. Voucher được giữ lượt trong transaction tạo booking; duyệt hủy đơn sẽ trả lượt, giữ nguyên hạn dùng. Mỗi đơn chỉ dùng một mã. Khi xuống hạng không thu hồi voucher cũ.

API chạy đối soát khi khởi động, mỗi giờ, khi mở thông tin thành viên hoặc kiểm tra voucher lúc đặt tour. Cần giữ tiến trình API hoạt động để xét hạng và tạo thông báo khi khách offline. Thông báo trong tài khoản gồm quà hạng, xét kỳ mới và nhắc giữ hạng trong 30/7 ngày cuối; chưa gửi email/SMS. Ràng buộc duy nhất theo sự kiện ngăn gửi lặp. Đồng bộ bù các kỳ đã qua, không cấp lại quà cho các kỳ đã hết.

