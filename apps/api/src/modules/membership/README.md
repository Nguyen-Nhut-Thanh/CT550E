# Hạng thành viên và voucher

- Người dùng: `/account/membership`, `/account/wallet`, `/account/notifications`.
- Quản trị: `/admin/marketing/membership` (cấu hình quyền lợi, xem trước thẻ, bảng so sánh, tìm/lọc hội viên, hồ sơ và xuất CSV). Không có mô phỏng chi tiêu hoặc Flash Deal sớm.
- Cập nhật quyền lợi: `npm run db:membership-benefits` thêm cột JSON `bookings.membership_snapshot`, bảo toàn dữ liệu cũ. Môi trường Prisma Migrate dùng migration `202611030001_membership_benefits` thay cho script. Sau đó chạy `npm run db:generate` và build `shared`, `database`.
- Khởi tạo database hiện hữu: `npm run db:membership`. Script chỉ thêm schema mới trong một transaction và không sửa booking/voucher hiện có. Chạy lại sẽ kiểm tra và bỏ qua nếu đã cài đầy đủ. Repository hiện có các migration SQL được áp dụng trực tiếp; với môi trường dùng Prisma Migrate, áp dụng migration `202610290001_membership_rewards` theo quy trình của môi trường, không chạy đồng thời cả hai cách.
- Tạo Prisma Client: `npm run db:generate`; khởi động web/API: `npm run dev`.

## Quy tắc

Chi tiêu bằng tổng khoản thanh toán `completed`, trừ các khoản `refunded`, tối đa bằng `booking.total_amount` (đã trừ voucher). Chỉ tính booking `paid`, `confirmed`, `completed` và sau hết ngày kết thúc tour tại Việt Nam. Thời điểm ghi nhận là thời điểm muộn hơn giữa hết ngày tour và khoản thanh toán thành công cuối cùng. Booking hủy không được tính. Phụ thu và dịch vụ đã thanh toán nằm trong tổng chi tiêu; voucher chỉ giảm trên tiền hành khách, trước phụ thu và dịch vụ.

Chu kỳ đầu bắt đầu từ lần ghi nhận đầu tiên. Mốc này giữ nguyên khi hoàn tiền/hủy tour. Chu kỳ 12 tháng theo ngày tại Việt Nam, gồm ngày bắt đầu và không gồm thời điểm bắt đầu kỳ kế tiếp. Ngày 29/02 chuyển thành 28/02 ở năm thường và trở lại 29/02 ở năm nhuận.

Hạng hiện tại là mức cao hơn giữa hạng kiếm được trong kỳ trước và hạng theo chi tiêu kỳ hiện tại. Khi sang kỳ mới, chi tiêu bằng 0; chỉ mang theo hạng kiếm được từ chi tiêu kỳ vừa kết thúc. Vì vậy một kỳ không chi tiêu không thể giữ hạng mãi. Hủy/hoàn tiền sẽ tính lại chi tiêu và hạng tương ứng. Cấu hình admin mới được dùng trong lần xét tiếp theo, bao gồm tính lại lịch sử; điều kiện voucher đã cấp không thay đổi.

Quyền lợi mặc định (Member / Silver / Gold / Platinum / Diamond): giảm tiền tour 0/2/3/5/7%; hệ số điểm 1/1,2/1,5/2/3; voucher sinh nhật 50/100/200/300/500 nghìn; giảm dịch vụ bổ sung 0/5/10/15/20%. Gold trở lên được đánh dấu ưu tiên xử lý giữ chỗ trong danh sách booking; không đặt vượt sức chứa. Mốc chi tiêu giữ nguyên 0/5/15/30/60 triệu.

Mỗi đơn dùng một voucher, trừ trên tiền hành khách trước. Giảm giá theo hạng được tính trên phần tiền hành khách còn lại sau voucher; dịch vụ giảm riêng, không giảm phụ thu phòng đơn. Máy chủ tính lại giá và lưu `membership_snapshot` gồm hạng, hệ số điểm, mức giảm và các khoản giảm thực tế. Ví dụ tiền tour 10 triệu, voucher 500 nghìn, giảm theo hạng 5% thì tiền tour còn 9.025.000đ.

Điểm thưởng kỳ hiện tại là tổng điểm mỗi booking đủ điều kiện: floor(thực trả × hệ số lúc đặt / 100.000). Booking cũ không có snapshot dùng hệ số 1. Hủy/hoàn tiền điều chỉnh điểm theo khoản thực trả còn lại. Điểm thưởng không ảnh hưởng mốc xét hạng. Thay đổi hệ số cấu hình không làm đổi hệ số booking đã đặt.

Voucher sinh nhật cấp một lần mỗi năm cho người có `users.birthday`, dùng một lần trong tháng sinh nhật theo múi giờ Việt Nam, hết hạn cuối ngày cuối tháng. `reward_key=birthday:userId:năm` và khóa theo user ngăn cấp trùng. Điều kiện được chốt tại lần cấp đầu tiên; đổi hạng hoặc đổi cấu hình không sửa voucher đã cấp. Ngừng cấp voucher quà lên hạng mới; voucher cũ tiếp tục dùng theo điều kiện và hạn ban đầu. Voucher được giữ lượt trong transaction tạo booking; duyệt hủy đơn trả lượt nhưng giữ nguyên hạn dùng.

API đối soát khi khởi động, mỗi giờ, khi mở thông tin thành viên, kiểm tra voucher hoặc tạo booking. Quét cả người có ngày sinh chưa có booking để cấp quà hạng Member. Thông báo trong tài khoản gồm quà sinh nhật, xét kỳ mới và nhắc giữ hạng trong 30/7 ngày cuối; chưa gửi email/SMS. Không cấp bù voucher sinh nhật cho các tháng đã hết.

Kiểm thử: `npm run test:membership`; thêm `-- --database` để kiểm tra cấp quà, chống trùng, tìm/lọc hội viên và tạo booking thật trong một transaction luôn rollback. Email được thay bằng stub trong kiểm thử.

