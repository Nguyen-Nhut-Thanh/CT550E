# Mẫu thẻ thống kê dùng chung cho admin

Mẫu được chọn từ thẻ “Tổng doanh thu” của dashboard theo yêu cầu ngày 19/11/2026. Component: `apps/web/components/common/admin_shared/cards/AdminStatCard.tsx`.

| Thành phần | Quy tắc |
| --- | --- |
| Card | Nền trắng, viền pastel 1px theo tone, bo góc 14px, `shadow-sm` |
| Padding | Ngang 16px, dọc 12px |
| Font | Font sans của ứng dụng (hiện tại Manrope) |
| Icon | Bên trái, căn giữa dọc; khung 40 × 40px, bo góc 12px, nền gradient theo mục; icon trắng 21px |
| Gap icon và nội dung | 12px |
| Nhãn | 10px, weight 600, uppercase, tracking-wide, `slate-500` |
| Giá trị chính | 20px, weight 800, line-height 24px, tracking-tight, `slate-950` |
| Mô tả | 11px, line-height 16px, `slate-500`, cách giá trị 4px |
| Badge | Tùy dữ liệu; 10px/600, cạnh nhãn, xuống dòng khi thiếu chỗ |
| Footer | Tùy chọn cho thanh tỷ trọng, phân bổ sao; cách nội dung 12px |

Các số đo rem được quy đổi với root font-size 16px. Dùng `tone` để chọn gradient và viền: `blue`, `green`, `purple`, `indigo`, `amber`, `orange`, `rose`, `cyan`, `slate`; `gradient` cho trường hợp cần giữ màu đặc thù.

Giữ nguyên số cột, breakpoint và cách tính dữ liệu của từng trang. Không thêm số liệu giả hoặc thêm thẻ vào màn hình vốn không có thống kê. Tùy biến nhãn, giá trị, mô tả, icon, badge và footer theo mục.

Trang Quản lý lịch khởi hành giữ bố cục danh sách tour và lịch như ban đầu; không thêm hàng thẻ thống kê vào trang này.

Truyền `onClick` cho thẻ lọc/điều hướng để render button và giữ callback hiện có. Truyền `loading` để hiển thị “—”, đặt `aria-busy` và khóa thao tác; `disabled` cho trường hợp chưa có dữ liệu. Giá trị `0` phải hiển thị bình thường.

```tsx
<AdminStatCard
  title="Tổng số tour"
  value={total.toLocaleString("vi-VN")}
  description="Tất cả tour trong hệ thống"
  icon={Compass}
  tone="blue"
  loading={loading}
/>
```
