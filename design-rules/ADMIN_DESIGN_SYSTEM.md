# QUY TẮC THIẾT KẾ CHUẨN HỆ THỐNG QUẢN TRỊ (ADMIN DESIGN SYSTEM)

> **Tài liệu tham chiếu chuẩn cho giao diện Quản trị viên (Admin Portal - JourniTrip)**  
> *Được trích xuất trực tiếp từ kiến trúc và thiết kế trang Dashboard Admin (`apps/web/app/admin/page.tsx` & hệ thống component con).*

---

## 1. NGUYÊN TẮC THIẾT KẾ CỐT LÕI (CORE PRINCIPLES)

1. **Nhất quán & Liền mạch (Consistency)**: Toàn bộ các trang con (Tour, Booking, Nhân sự, Voucher, Lịch khởi hành...) phải tuân thủ nghiêm ngặt cùng một hệ quy chuẩn về bo góc, khoảng cách, font chữ và màu sắc.
2. **Phẳng, Tinh tế & Sang trọng (Clean Soft-Corporate)**: Nền xanh dịu (`bg-blue-50`), thẻ trắng nổi bật (`bg-white`), viền xanh pastel mỏng nhẹ (`border-[#e1edfc]`), tránh đổ bóng quá gắt.
3. **Mật độ thông tin tối ưu (High Information Density)**: Bố cục trực quan, sử dụng gap và padding gọn gàng (`gap-3`, `p-4`), chữ có kích thước từ `10px` đến `24px` với độ đậm rõ ràng (`font-semibold` -> `font-extrabold`).

---

## 2. BẢNG MÀU CHUẨN (COLOR PALETTE & TOKENS)

### 2.1. Màu nền & Viền (Background & Borders)
| Thành phần | Mã màu / Tailwind Class | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Nền trang admin** | `bg-blue-50` (`#f0f7ff`) | Toàn bộ background khung nhìn trang admin |
| **Nền thẻ (Card)** | `bg-white` (`#ffffff`) | Nền tất cả các Card, Widget, Table, Modal |
| **Nền thẻ phụ / Header table** | `bg-slate-50/75` | Tiêu đề bảng (thead), hàng hover (`hover:bg-slate-50/60`) |
| **Viền thẻ chuẩn (Card Border)** | `border-[#e1edfc]` | Viền chính của tất cả Card, Bảng, Khung thống kê |
| **Viền phân cách (Divider)** | `border-[#edf2fb]` | Đường kẻ ngang giữa thead và tbody, giữa các hàng danh sách |
| **Viền phụ (Subtle Border)** | `border-slate-200/70` / `border-blue-100/80` | Viền cho mini counters, pill nhóm bộ lọc |

### 2.2. Màu chữ (Typography Colors)
| Phân loại | Mã màu / Tailwind Class | Vị trí áp dụng |
| :--- | :--- | :--- |
| **Tiêu đề lớn (Page Title)** | `#07123e` | Tiêu đề H1 trang admin (Greeting & Header) |
| **Tiêu đề khối (Card Title)** | `#0b1747` | Tiêu đề H2, tên tour, tên khách hàng, chữ in đậm chính |
| **Chữ giá trị nổi bật (KPI Value)** | `text-slate-950` / `#0b1747` | Con số doanh thu, số lượng booking, thống kê lớn |
| **Chữ phụ đề (Subtitles)** | `#637da5` | Mô tả dưới H1 header trang |
| **Nhãn mô tả (Labels/Captions)** | `#7387aa` / `text-slate-500` | Mô tả dưới H2, tiêu đề cột bảng, mã tour, thời gian |
| **Nhãn cực nhỏ (Micro labels)** | `text-slate-400` / `text-slate-500` | Nhãn UPPERCASE trong KPI card, mini counters |

### 2.3. Màu sắc điểm nhấn & Trạng thái (Accent & Status Tones)
| Nhóm trạng thái | Nền Badge | Màu chữ | Viền / Dot | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **Primary Accent** | `bg-[#075bff]` | `text-white` | `border-[#075bff]` | Nút bấm chính, ID đơn hàng, Tab đang active |
| **Thành công (Success / +)** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` / `bg-emerald-500` | Đã thanh toán, Tăng trưởng dương, Hoạt động |
| **Cảnh báo (Warning / Pending)** | `bg-amber-50` | `text-amber-700` | `border-amber-200` / `bg-amber-500` | Chờ thanh toán, Tạm giữ chỗ, Chú ý |
| **Nguy hiểm (Danger / Cancel / -)** | `bg-rose-50` | `text-rose-700` | `border-rose-200` / `bg-rose-500` | Đã hủy, Tăng trưởng âm, Yêu cầu hủy |
| **Hoàn tất (Completed)** | `bg-teal-50` | `text-teal-700` | `border-teal-200` / `bg-teal-500` | Chuyến đi hoàn thành |
| **Phụ / Mặc định (Neutral)** | `bg-slate-100` | `text-slate-600` | `border-slate-200` / `bg-slate-400` | Mã code, tag trung tính |

---

## 3. HỆ THỐNG KIỂU CHỮ (TYPOGRAPHY SYSTEM)

*Font family mặc định*: `font-sans` (`Inter, system-ui, -apple-system, sans-serif`).

| Cấp bậc | Font Size | Font Weight | Line Height | Tracking | Quy tắc áp dụng |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title (H1)** | `text-[24px]` (Mobile: `22px`) | `font-extrabold` (800) | `leading-[1.25]` | `tracking-[-0.6px]` | Tiêu đề đầu trang (VD: *Chào buổi sáng, Quản trị viên*) |
| **Card Header (H2)** | `text-[16px]` | `font-[750]` | `leading-[1.5]` | Chuẩn | Tiêu đề trên thanh header của mỗi thẻ/card |
| **KPI Big Number** | `text-xl` (20px) / `text-2xl` | `font-extrabold` (800) | `leading-6` | `tracking-tight` | Con số tổng của thẻ KPI chính |
| **Mini Counter Value** | `text-base` (16px) | `font-bold` (700) | `leading-normal`| Chuẩn | Con số của mini-card phụ |
| **Table Head / Filter** | `text-[12px]` | `font-[650]` | `leading-normal`| Chuẩn | Tiêu đề cột `<th>`, Nút hành động phụ |
| **Table Body / List** | `text-[13px]` | `font-normal` / `font-bold` | `leading-[1.5]` | Chuẩn | Dữ liệu bảng, tên tour, số tiền |
| **Subtitle / Mô tả** | `text-[12px]` | `font-normal` (400) | `leading-[1.5]` | Chuẩn | Đoạn văn giải thích dưới các tiêu đề |
| **Micro Caption / Tab** | `text-[10px]` - `text-[11px]` | `font-semibold` (600) | `leading-4` | `tracking-wide` (Upper) | Nhãn danh mục KPI, Badge trạng thái |

---

## 4. HỆ THỐNG BO GÓC CHUẨN (BORDER RADIUS SYSTEM)

Dự án áp dụng quy chuẩn 4 cấp bậc bo góc có chủ đích rõ rệt:

```
[rounded-[14px]]  ── Khung Card, Bảng Table, Cụm Filter ngoài, Wrapper lớn
     │
[rounded-xl / 12px] ── Nút CTA chính (Primary Button), Khung Icon KPI card (h-10 w-10)
     │
[rounded-lg / 8px]  ── Nút phụ, Nút phân trang, Input, Tag mã, Badge trạng thái
     │
[rounded-full]     ── Pill trend (+12%), Nút tròn icon Refresh (h-10 w-10), Avatar user
```

- **`rounded-[14px]` (Chuẩn định danh hệ thống)**:
  - Tất cả Card bao ngoài (`Card Container`).
  - Toàn bộ khung bảng dữ liệu (`Table Outer Wrapper`).
  - Khung bao cụm chuyển đổi thời gian (`Filter Segmented Control`).
- **`rounded-[12px]` / `rounded-xl` (12px)**:
  - Nút bấm chính Primary Action (`button CTA`).
  - Hộp Icon KPI Card lớn (`h-10 w-10`).
  - Khung icon mini counter (`h-9 w-9`).
- **`rounded-lg` (8px)**:
  - Các nút phụ dạng Outline / Ghost (`min-h-9`).
  - Các ô số phân trang (`AdminPagination`).
  - Nhãn badge trạng thái (`px-1.5 py-0.5`).
- **`rounded-full`**:
  - Badge phần trăm tăng/giảm xu hướng (`trend pill`).
  - Nút icon tròn (VD nút Refresh h-10 w-10).
  - Avatar đại diện khách hàng.

---

## 5. HỆ THỐNG KHOẢNG CÁCH & QUY TẮC CÁC HÀNG (ROW SPACING & GRID SYSTEM)

### 5.1. Bố cục trang & Khoảng cách dọc giữa các khối
- **Container bao ngoài**: `mx-auto w-full max-w-[1520px] px-4 pb-6 pt-3 md:px-6 md:pb-8`.
- **Khoảng cách dọc giữa các hàng/khối lớn (Section Row Spacing)**: **Luôn luôn dùng `space-y-3` (12px)**.
- **Khoảng cách lưới ngang (Grid Gap)**: **Đồng nhất `gap-3` (12px)**.

### 5.2. Khoảng cách giữa các hàng dữ liệu (Data Row Spacing)
1. **Khoảng cách giữa các hàng trong Bảng (Table Rows)**:
   - **Padding ô hàng**: Chuẩn `px-4 py-3` (padding dọc `12px` trên và dưới, ngang `16px`).
   - **Đường phân cách giữa các hàng**: `divide-y divide-[#edf2fb]` trên thẻ `<tbody>` (hoặc `border-b border-[#edf2fb]`).
   - **Hiệu ứng hover hàng**: `hover:bg-slate-50/60 transition-colors`.
   - **Độ cao cơ sở của một hàng bảng**: Đạt khoảng `48px - 56px` tùy dữ liệu avatar/mã đi kèm, đảm bảo thoáng đãng, dễ click.

2. **Khoảng cách giữa các hàng danh sách List Item (như Top Tours, Danh sách điều hành)**:
   - Sử dụng thẻ bọc với đường phân tách: `<div className="divide-y divide-[#edf2fb]">`.
   - Mỗi hàng item con có padding dọc chuẩn: `py-3` (12px).
   - Khoảng cách các thành phần trong cùng 1 hàng: `gap-x-2.5 gap-y-1` (ngang 10px, dọc 4px khi rớt dòng).

3. **Khoảng cách giữa các hàng trong Form & Toolbar (Toolbar & Form Rows)**:
   - Cụm công cụ lọc & tìm kiếm: `flex flex-wrap items-center gap-x-3 gap-y-2` hoặc `gap-2`.
   - Khoảng cách giữa các nhóm trường form: `space-y-3` (12px) hoặc `space-y-4` (16px).
   - Khoảng cách giữa Label và Input: `mt-1` (4px) hoặc `space-y-1.5` (6px).

### 5.3. Khoảng cách giữa các dòng văn bản (Line Height / Leading)
- **Tiêu đề lớn (H1)**: `leading-[1.25]` (siết dòng gọn gàng, tránh bị thưa khi xuống 2 dòng).
- **Tiêu đề thẻ (H2), Tên tour, Mô tả, Body text**: `leading-[1.5]` (chuẩn công thái học dễ đọc).
- **KPI Value**: `leading-6` (24px) tương ứng với `text-xl`.
- **Nhãn nhỏ, Badge, Caption**: `leading-4` (16px) hoặc `leading-none`.

### 5.4. Padding trong các khối (Inner Padding)
- **Card lớn / Widget biểu đồ / Bảng**: `p-4` (16px).
- **Thẻ KPI chính & Mini counters**: `px-4 py-3` (16px ngang, 12px dọc).
- **Header thẻ có đường viền đáy**: `px-4 pt-4 pb-3 border-b border-[#edf2fb]`.
- **Ô bảng (Table Cell `th`, `td`)**: `px-4 py-3`.

### 5.5. Quy chuẩn Responsive với Container Queries
Dự án sử dụng container queries `@container/dashboard`:
- Lưới 4 cột (KPI): `grid grid-cols-4 gap-3 @max-[1180px]/dashboard:grid-cols-2 @max-[650px]/dashboard:grid-cols-1`.
- Lưới 2 cột (Chart & Widget): `grid gap-3 grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] @max-[900px]/dashboard:grid-cols-1`.

### 5.6. Quy chuẩn khoảng cách mép-đến-mép giữa các thẻ (Card-to-Card Spacing)
Để tránh hiện tượng khoảng cách giữa các thẻ "lúc rộng lúc hẹp, không thống nhất", quy định khoảng cách từ mép ngoài của thẻ này đến mép ngoài của thẻ lân cận:
1. **Khoảng cách ngang giữa 2 thẻ liền kề (Horizontal Column Gap)**:
   - Trên Layout Trang (`Page Layout`): Luôn luôn cố định là **`gap-3` (12px)**. Mép phải thẻ bên trái cách mép trái thẻ bên phải đúng `12px`.
   - Trong Popup / Modal (`Modal Layout`): Luôn luôn cố định là **`gap-3.5` (14px)** hoặc **`gap-3` (12px)**. Tuyệt đối không dùng `gap-5` (20px) hay `gap-6` (24px) gây loãng bố cục.
2. **Khoảng cách dọc giữa 2 thẻ xếp chồng (Vertical Stack / Row Spacing)**:
   - Trên Layout Trang: Cố định **`space-y-3` (12px)**. Mép dưới thẻ trên cách mép trên thẻ dưới đúng `12px`.
   - Trong Popup / Modal: Cố định **`space-y-3.5` (14px)** giữa các thẻ cha cấp 1.
3. **Mối tương quan giữa khoảng cách Thẻ cha vs Khối con**:
   - Khoảng cách giữa các thẻ cha (Card Containers): `14px` (`gap-3.5` hoặc `space-y-3.5`).
   - Khoảng cách giữa các khối con bên trong thẻ (Sub-blocks, Fieldsets): `8px - 10px` (`space-y-2` hoặc `space-y-2.5`).
   - Khoảng cách giữa nhãn và input: `4px - 6px` (`mt-1` hoặc `space-y-1`).
   - *Nguyên tắc thị giác Gestalt*: Khoảng cách khối ngoài luôn lớn hơn hoặc bằng khoảng cách phần tử bên trong, nhưng các khối ngang cấp phải hoàn toàn bằng nhau.

### 5.7. Quy chuẩn khoảng cách trong Popup / Modal (Modal Internal Layout Spacing)
- **Padding vùng thân Modal (`Modal Body Container`)**: `p-4 sm:p-5` (hoặc `p-4.5`, khoảng 16px - 20px).
- **Lưới 2 cột trong Modal**: `grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start`.
- **Cột xếp chồng thẻ con (Stack Column)**: `space-y-3.5` (đồng bộ cả cột trái và cột phải).
- **Header Modal**: `px-6 py-4.5 border-b border-[#e1edfc]`.
- **Footer Modal**: `px-6 py-3.5 border-t border-[#e1edfc] flex items-center justify-end gap-2.5`.

---

## 6. QUY CHUẨN CÁC THẺ THỐNG KÊ (KPI CARDS & METRIC COUNTERS)

> **Cập nhật theo mẫu dashboard:** tất cả các thẻ thống kê hiện dùng component `AdminStatCard` tại `apps/web/components/common/admin_shared/cards/AdminStatCard.tsx`, gồm cả thẻ phụ. Áp dụng [mẫu dùng chung](admin-stat-cards.md) để giữ đồng nhất kích thước, typography và vị trí icon; phần 6.2 bên dưới ghi lại kiểu mini counter trước khi thống nhất.

### 6.1. Thẻ KPI chính (Primary KPI Cards - 4 cột)
Mỗi thẻ KPI chính bao gồm:
1. **Container**: `min-w-0 rounded-[14px] border border-{color}-100 bg-white px-4 py-3 shadow-sm`.
2. **Icon box bên trái**: `flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br {gradient} text-white shadow-sm`.
3. **Nội dung bên phải**:
   - Dòng 1: Tiêu đề in hoa `text-[10px] font-semibold uppercase tracking-wide text-slate-500` đặt cạnh Badge xu hướng `inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold`.
   - Dòng 2: Giá trị số cực đậm `text-xl font-extrabold leading-6 tracking-tight text-slate-950`.
   - Dòng 3: Mô tả chu kỳ `text-[11px] leading-4 text-slate-500`.

*Bộ Gradient chuẩn cho 4 thẻ*:
- Doanh thu: `from-blue-600 to-indigo-600` | Border: `border-blue-100`
- Đơn đặt: `from-emerald-600 to-teal-600` | Border: `border-emerald-100`
- Khách mới: `from-purple-600 to-violet-600` | Border: `border-purple-100`
- Tour hoạt động: `from-amber-600 to-orange-600` | Border: `border-amber-100`

### 6.2. Thẻ chỉ số phụ (Secondary Mini Counters - 4 cột)
Dùng để đếm số lượng trạng thái đơn hàng (Chờ thanh toán, Đã thanh toán, Đã hủy, Tỷ lệ lấp đầy):
- **Container**: `flex min-w-0 items-center gap-3 rounded-[14px] border border-slate-200/70 bg-white px-4 py-3 shadow-xs`.
- **Icon box**: `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-{color}-50 text-{color}-600`.
- **Text**:
  - Nhãn: `text-[11px] font-semibold text-slate-400`.
  - Giá trị: `text-base font-bold text-slate-900`.

---

## 7. QUY CHUẨN BẢNG DỮ LIỆU & PHÂN TRANG (DATA TABLES & PAGINATION)

### 7.1. Khung bảng (Table Wrapper)
```tsx
<div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
  {/* Card Header */}
  <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#edf2fb]">
    <div className="flex items-center gap-2">
      <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center text-[#075bff]">
        {/* Lucide Icon size={22} */}
      </div>
      <div>
        <h2 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">Tiêu Đề Thẻ Bảng</h2>
        <p className="mt-[3px] text-[12px] leading-[1.5] text-[#7387aa]">Mô tả ngắn gọn về nội dung bảng</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      {/* Action buttons */}
    </div>
  </div>

  {/* Table Body */}
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="border-b border-[#edf2fb] bg-slate-50/75 text-[12px] font-[650] text-[#7387aa]">
          <th className="px-4 py-3">Cột A</th>
          <th className="px-4 py-3">Cột B</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#edf2fb] text-[13px]">
        <tr className="transition-colors hover:bg-slate-50/60">
          <td className="px-4 py-3 font-[650] text-[#075bff]">#ID</td>
          <td className="px-4 py-3 font-bold text-[#0b1747]">Dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### 7.2. Phân trang chuẩn (Pagination Rules)
- **100% các bảng phải dùng phân trang kiểu số trang (`AdminPagination.tsx`)**. Đã loại bỏ hoàn toàn kiểu bấm trước/sau đơn giản.
- Các nút số trang có kích thước chuẩn: `min-h-9 min-w-9 rounded-lg text-sm font-semibold`.
- Trang đang chọn: `bg-[#075bff] text-white shadow-sm`.
- Trang khác: `border border-blue-100 bg-white text-slate-600 hover:bg-blue-50`.

---

## 8. CODE TEMPLATES (MẪU CODE CHUẨN COPY-PASTE)

### 8.1. Mẫu Nút bấm (Button Variants)
```tsx
// 1. Nút chính Primary CTA (Xanh dương thương hiệu)
<button
  type="button"
  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[12px] border border-[#075bff] bg-[#075bff] px-4 py-[9px] text-[14px] font-[650] text-white shadow-[0_5px_13px_#075bff12] transition-colors duration-180 hover:bg-[#064ddd] disabled:opacity-45"
>
  <Download size={18} />
  Xuất báo cáo
</button>

// 2. Nút phụ Outline / Sub-action
<button
  type="button"
  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] transition-colors duration-180 hover:bg-[#f1f7ff] disabled:opacity-45"
>
  Xem tất cả
  <ArrowRight size={14} />
</button>

// 3. Nút tròn Icon (Refresh/Action)
<button
  type="button"
  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d6e7fb] bg-[#ffffffd9] text-[#5e84b7] hover:bg-[#f3f8ff] disabled:opacity-45"
>
  <RefreshCw size={17} />
</button>
```

### 8.2. Mẫu Badge Trạng Thái (Status Badges)
```tsx
// Cấu trúc badge chuẩn: icon tròn nhỏ + text
<span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-[650] text-emerald-700">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  Đã thanh toán
</span>
```

### 8.3. Mẫu Khung Thẻ Thống Kê KPI (KPI Card Component)
```tsx
<div className="min-w-0 rounded-[14px] border border-blue-100 bg-white px-4 py-3 shadow-sm">
  <div className="flex h-full items-center gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
      <DollarSign size={21} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Tổng Doanh Thu
        </p>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-700">
          <ArrowUpRight size={12} /> +15.8%
        </span>
      </div>
      <h3 className="mt-1 text-xl font-extrabold leading-6 tracking-tight text-slate-950">
        125.800.000 ₫
      </h3>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">
        Doanh thu phát sinh tháng này
      </p>
    </div>
  </div>
</div>
```

---

## 9. CHECKLIST KIỂM DUYỆT GIAO DIỆN (DESIGN COMPLIANCE CHECKLIST)

Khi xây dựng hoặc sửa đổi bất kỳ trang Admin nào trong dự án:
- [ ] Nền trang có sử dụng `bg-blue-50` không?
- [ ] Khung Card / Bảng có đúng `rounded-[14px]` và `border-[#e1edfc]` không?
- [ ] Khoảng cách layout giữa các hàng có đồng nhất `space-y-3` và `gap-3` không?
- [ ] Tiêu đề H1 có màu `#07123e` (`text-[24px] font-extrabold`) và H2 có màu `#0b1747` (`text-[16px] font-[750]`) không?
- [ ] Nút chính có dùng màu `#075bff` (`rounded-[12px]`) và nút phụ có dùng `rounded-lg` không?
- [ ] Bảng dữ liệu có dùng phân trang dạng bấm số (`AdminPagination`) hay không (nghiêm cấm dùng nút bấm Trước/Sau đơn lẻ)?
- [ ] Các icon trạng thái có kích thước gọn gàng (`18-22px`) và nằm vừa vặn trong khung bo chuẩn không?

