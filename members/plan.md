# ĐẶC TẢ HỆ THỐNG MEMBERSHIP & ĐẶC QUYỀN VIP NÂNG CAO (JOURNTRIP)

## 1. TỔNG QUAN 5 CẤP BẬC THÀNH VIÊN & BẢNG QUYỀN LỢI NÂNG CẤP

Hệ thống gồm 5 hạng, tự động nâng cấp real-time dựa trên tổng chi tiêu thực tế của các tour đã hoàn thành trong chu kỳ 12 tháng:

| Tiêu chí & Đặc quyền | 🥉 Đồng (Bronze) | 🥈 Bạc (Silver) | 🥇 Vàng (Gold) | 💎 Bạch Kim (Platinum) | 👑 Kim Cương (Diamond) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chi tiêu tích lũy / 12 tháng** | 0đ | Từ 5.000.000đ | Từ 15.000.000đ | Từ 30.000.000đ | Từ 60.000.000đ |
| **Giảm trực tiếp giá vé tour** | — | Giảm 2% | Giảm 3% | Giảm 5% | Giảm 7% |
| **Hệ số nhân điểm thưởng** | ×1.0 | ×1.2 | ×1.5 | ×2.0 | ×3.0 |
| **Giảm giá dịch vụ đi kèm** | — | Giảm 5% | Giảm 10% | Giảm 15% | Giảm 20% |
| **Voucher quà tặng Sinh nhật** | 50.000đ | 100.000đ | 200.000đ | 300.000đ | 500.000đ + Quà tại điểm đến |
| **Gói Voucher thăng hạng** | — | 100k (đơn từ 2tr) | 3% max 200k (đơn 3tr) | 5% max 400k (đơn 5tr) | 7% max 700k (đơn 7tr) |
| **Ưu tiên giữ chỗ & Hỗ trợ** | Tiêu chuẩn | Tiêu chuẩn | Ưu tiên hàng đợi | Kênh VIP riêng | Chuyên viên 1-1 |
| **Đặc quyền Linh hoạt (Trip Shield)** | — | — | Đổi ngày miễn phí 1 lần/năm (trước 7 ngày) | Hoàn/hủy linh hoạt trước 72h (hoàn về ví điểm) | Hoàn/hủy linh hoạt + Bảo hiểm trễ chuyến |
| **Nâng hạng & Tiện ích VIP** | — | — | Ưu tiên chọn ghế đầu | 1 lượt nâng hạng phòng/năm + Xe đón sân bay 1 chiều | Nâng hạng phòng tự động + Phòng chờ thương gia / Fast-track |
| **Đặc quyền Nhóm & Mở bán sớm** | — | — | Mở bán tour mới sớm 24h | Chia sẻ % giảm giá cho tối đa 2 người đi cùng + Mở bán sớm 48h | Chia sẻ % giảm giá cho tối đa 3 người đi cùng + Tặng 1 thẻ Bạc cho bạn bè |

---

## 2. CƠ CHẾ VẬN HÀNH & TÍCH LŨY (CORE BUSINESS LOGIC)

### A. Chu kỳ xét hạng 12 tháng (Anniversary Cycle)
- **Mốc bắt đầu:** Tính từ ngày hoàn thành chuyến đi đầu tiên.
- **Thăng hạng tức thì (Real-time Upgrade):** Ngay khi trạng thái đơn hàng chuyển sang `COMPLETED` (qua ngày cuối cùng của tour và đã thanh toán đủ) và tổng chi tiêu chạm mốc mới, hệ thống tự động nâng hạng ngay lập tức và cấp Voucher thăng hạng vào `/account/wallet`.
- **Gia hạn & Hạ hạng:** Hết 12 tháng, nếu tổng chi tiêu kỳ đạt mức duy trì của hạng hiện tại -> giữ nguyên hạng cho 12 tháng tiếp theo và reset chi tiêu kỳ về `0đ`. Nếu không đạt -> điều chỉnh về hạng tương ứng với mức chi tiêu đã đạt. Gửi thông báo nhắc giữ hạng tự động trước **30 ngày** và **7 ngày**.

### B. Hệ sinh thái Điểm thưởng (JourniTrip Points: Tích & Tiêu)
- **Tích điểm:** Mỗi `100.000đ` thực trả của tour hoàn thành = `1 điểm cơ bản × Hệ số hạng`.
- **Tiêu điểm (Points + Cash):** Cho phép khách dùng điểm để trừ trực tiếp tiền khi đặt tour (`1 điểm = 1.000đ`, tối đa 30% giá trị đơn hàng) hoặc đổi quà/voucher trải nghiệm (bữa tối lãng mạn, vé VIP không xếp hàng, gói chụp ảnh) tại **Sàn đổi quà**.

### C. Thứ tự áp dụng Chiết khấu Thông minh (4 Lớp khi Checkout)
1. **Lớp 1 - Trừ Voucher:** Áp dụng Voucher thành viên hoặc Voucher sinh nhật được chọn.
2. **Lớp 2 - Giảm giá theo hạng tour:** Chiết khấu % theo hạng (2% – 7%) trên số tiền vé tour còn lại (áp dụng cho cả chính chủ và người đi cùng nếu thuộc quyền lợi Platinum/Diamond).
3. **Lớp 3 - Giảm giá dịch vụ đi kèm:** Chiết khấu % dịch vụ (5% – 20%) cho xe riêng, nâng hạng phòng, tiện ích thêm (không áp dụng cho phụ thu phòng đơn).
4. **Lớp 4 - Quy đổi Điểm thưởng:** Trừ số tiền tương ứng với số điểm khách chọn sử dụng.

---

## 3. CƠ CHẾ TOUR ĐẶC QUYỀN 2 TẦNG (DATABASE & PRODUCT LOGIC)

Mở rộng schema bảng `Tours` và `Schedules` với các trường metadata để hỗ trợ 2 tầng đặc quyền:

1. **Tầng 1 — Bật đặc quyền tự động trên Tour thường (`vip_included_perks`):**
   - Mọi user đều thấy và đặt được tour.
   - Khi user hạng `GOLD`, `PLATINUM`, hoặc `DIAMOND` xem chi tiết tour hoặc checkout, hệ thống tự động hiển thị badge **"Quyền lợi hội viên của bạn"** và đính kèm miễn phí các tiện ích tương ứng (ví dụ: *Tặng xe đón sân bay, Miễn phí nâng hạng phòng View biển*) vào hóa đơn/booking metadata.
2. **Tầng 2 — Tour Đặc Quyền Độc Quyền (`min_membership_tier` & `early_access_until`):**
   - **Member-Exclusive Tours:** Các tour thiết kế riêng/đoàn nhỏ giới hạn hoặc tour trợ giá sâu có gắn cờ `min_membership_tier` (ví dụ: `GOLD` hoặc `PLATINUM`). Khách hạng thấp hơn vẫn nhìn thấy thẻ tour trên giao diện (kèm huy hiệu ổ khóa *"Đặc quyền từ hạng Vàng"*), khi bấm vào sẽ hiển thị modal giải thích quyền lợi và số tiền cần chi tiêu thêm để mở khóa.
   - **Early Access:** Cho phép ẩn nút đặt tour với hạng thường trong khung giờ mở bán sớm (24h–48h đầu tiên) và chỉ mở nút "Đặt ngay" cho hạng Platinum/Diamond.

---

## 4. GAMIFICATION & CÁ NHÂN HÓA

- **Hệ thống Huy hiệu (Travel Badges):** Cấp huy hiệu tự động dựa trên hành vi khám phá (ví dụ: *Chinh phục 3 vùng miền, Tín đồ biển đảo, Người mở hàng đầu năm*). Hoàn thành huy hiệu nhận thêm điểm thưởng hoặc voucher bí mật.
- **Quà tặng Sinh nhật nâng cấp:** Tự động phát voucher vào ngày 01 của tháng sinh nhật. Nếu khách khởi hành tour trong tháng sinh nhật: tự động gắn cờ `BIRTHDAY_CELEBRATION` cho điều hành tour (tặng bánh/hoa tại khách sạn) + nhân đôi (`x2`) điểm thưởng cho chuyến đi đó.

---

## 5. YÊU CẦU GIAO DIỆN (UI/UX)

### Phía Khách hàng:
1. **`/account/membership`:**
   - **Thẻ thành viên điện tử 3D:** Đổi hiệu ứng chất liệu/ánh sáng theo hạng (Đồng -> Bạc xám -> Vàng kim -> Bạch kim tím -> Kim cương xanh).
   - **Đồng hồ tiến độ & Smart Retention Nudge:** Thanh tiến độ chi tiêu kỳ, số điểm khả dụng, số tiền thiếu để lên/giữ hạng. Khi sắp hết chu kỳ 12 tháng mà chưa đủ điểm giữ hạng, tự động gợi ý 2–3 tour có mức giá khớp với số tiền còn thiếu.
   - **Bảng quyền lợi & Huy hiệu:** Hiển thị trực quan các đặc quyền đã mở khóa, bộ sưu tập Huy hiệu du lịch, lịch sử tích/tiêu điểm và lịch sử các kỳ xét hạng.
2. **`/account/wallet` & Sàn đổi quà:**
   - Quản lý voucher sinh nhật, voucher thăng hạng (áp dụng 1-click khi checkout) và tab đổi điểm lấy quà/trải nghiệm.
3. **Trang Danh sách Tour, Chi tiết Tour & Hóa đơn (Checkout/Invoice):**
   - Hiển thị badge khóa/mở khóa cho Tour đặc quyền, tự động cộng các `vip_included_perks` vào tóm tắt đơn hàng và hóa đơn điện tử.

### Phía Quản trị viên (`/admin/marketing/membership`):
1. **Dashboard thống kê:** Phân bổ hội viên theo 5 hạng, tỷ lệ giữ hạng, tổng điểm đã phát/đã tiêu, hiệu quả sử dụng voucher.
2. **Cấu hình chính sách động:** Cho phép Admin chỉnh sửa linh hoạt mốc tiền thăng hạng, % chiết khấu, hệ số nhân điểm, cấu hình đặc quyền từng hạng, và tạo chiến dịch *Flash Tier Upgrade* (x2 điểm xét hạng trong thời gian giới hạn).
3. **Quản lý hội viên:** Tra cứu theo Tên/Email/SĐT/Hạng, xem chi tiết lịch sử điểm & đặc quyền đã dùng, hỗ trợ xuất dữ liệu Excel/CSV.