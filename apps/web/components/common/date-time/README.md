# DateTimePicker

Bộ chọn ngày và giờ riêng, không phụ thuộc `common/calendar/Calendar`.
Giao diện mặc định là một panel để nhúng trực tiếp trong form, dialog hoặc popover.

`DateTimeInput` bọc panel trong một ô nhập có nhãn và popover, dùng cùng props
`value` / `onChange`, thêm `label`, `placeholder`, `error`. Bấm Xong, Escape hoặc
bấm ngoài để đóng. Form cha kiểm tra giá trị bắt buộc và truyền lỗi qua `error`.
Mục “Xếp ca trực & lịch nghỉ” đang dùng ô này cho Bắt đầu và Kết thúc.
Popup dùng bản gọn rộng 560px; lịch và thời gian xếp dọc khi khung còn dưới 500px.

```tsx
"use client";

import { useState } from "react";
import { DateTimePicker } from "@/components/common/date-time/DateTimePicker";

export function DepartureField() {
  const [departure, setDeparture] = useState<Date | null>(null);

  return <DateTimePicker value={departure} onChange={setDeparture} />;
}
```

- `value` / `onChange`: component được điều khiển bởi form cha, nhận `Date | null`.
- `minDate` / `maxDate`: giới hạn cả ngày và giờ. Giới hạn dưới được làm tròn lên
  đến phút, giới hạn trên làm tròn xuống. Các lựa chọn ngoài giới hạn bị khóa.
  Nếu form cha truyền một `value` ngoài giới hạn, component vẫn hiển thị đúng giá trị
  đó; chỉ chuẩn hóa khi người dùng chọn lại, không tự phát `onChange` khi đổi props.
- `locale`: `vi-VN` (mặc định) hoặc `en-US` để dùng nhãn tiếng Anh như ảnh mẫu.
- `disabled`, `className`, `ariaLabel`: trạng thái khóa và tùy biến khung ngoài.

Ngày và giờ dùng múi giờ cục bộ của trình duyệt; kết quả có giây và mili giây bằng 0.
Chọn ngày sẽ giữ giờ/phút hiện tại và điều chỉnh về giới hạn gần nhất nếu cần.
Chọn giờ khi chưa chọn ngày sẽ dùng ngày hiện tại (hoặc ngày gần nhất trong giới hạn).
Hôm nay chuyển về ngày hiện tại và giữ giờ đã chọn. Xóa trả về `null`.

Nhấn tiêu đề tháng để chọn tháng/năm. Dùng phím mũi tên để di chuyển trong lịch,
Home/End để tới đầu/cuối tuần, PageUp/PageDown để đổi tháng; Enter/Space để chọn.
Các cột thời gian cho phép cuộn rồi bấm chọn; có thể dùng Tab và phím mũi tên,
Home/End để chọn bằng bàn phím. AM/PM được chuyển thành giờ 24 tiếng trong `Date`.
Panel tự xếp dọc khi khung chứa rộng tối đa 680px.

Kiểm tra logic ngày–giờ: `npx tsx --test apps/web/lib/utils/dateTimePicker.test.ts`.
