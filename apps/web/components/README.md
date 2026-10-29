# Component của web

- `common/`: các component dùng lại giữa nhiều trang: tìm kiếm, dropdown,
  lịch, ô nhập, upload ảnh, popup, bảng, phân trang, thông báo và điều hướng.
- `home/`, `tours/`, `booking/`, `blog/`, `auth/`, `account/`, `chat/`:
  component dành riêng cho từng nhóm trang/chức năng.
- `admin/`: khung quản trị và các nhóm trang `dashboard`, `chats`,
  `locations`, `schedules`, `tours`, `users`, `posts`, `vouchers`, `flash-deals`.

Mỗi file chứa một component, tên file trùng với tên component. File nằm ngay
trong nhóm trang, không tạo thêm thư mục chỉ để chứa một vài component nhỏ.
Import trực tiếp từ file; không dùng các file `index.ts` chuyển tiếp export.

Component trong `common/` có comment tiếng Việt ngay trước khai báo để giải thích
chức năng. Các tên bắt đầu bằng `Admin` biểu thị giao diện quản trị dùng chung
giữa nhiều trang quản trị, không gắn với một nghiệp vụ riêng.

`Calendar` dựng lịch dùng chung; `AdminDatePicker`, `DateFilterInput` và
`SearchDateInput` cung cấp cách nhập/chọn ngày phù hợp từng kiểu biểu mẫu.
`Dialog` quản lý popup và bàn phím; `AdminModalShell` bổ sung khung biểu mẫu,
`ConfirmDialog` bổ sung nội dung xác nhận thao tác.
`Popover` giữ lịch và dropdown không bị cắt bởi khung popup hoặc vùng cuộn,
đồng thời điều chỉnh vị trí theo khoảng trống trên màn hình.
`ToastProvider`, `ToastViewport`, `ToastItem` lần lượt cung cấp chức năng,
vùng thông báo và một thông báo cụ thể.
`NavigationPending` phản hồi ngay khi bấm liên kết đang chuyển trang;
`PageLoading` là trạng thái chờ dùng trong các file `loading.tsx`.

Hook và xử lý dữ liệu nằm trong `lib/`, ví dụ `lib/notifications/useToast`,
`lib/account/useAccountResource`, `lib/ui/useDismiss`. Không đưa hook hoặc
cache dữ liệu vào file component dùng chung.

`common/TourRecommendationCard` là khung thẻ giới thiệu tour dùng chung, co theo khung chứa, tối đa
600px. Giữ bố cục ngang và thu nhỏ ảnh, chữ, khoảng cách theo cùng tỉ lệ với chiều rộng thẻ. Truyền `tour: TourRecommendationData` với ảnh, giá, lịch khởi hành, tiện ích
và mô tả; component không phụ thuộc hội thoại, socket hay API chatbot.
`favorite`, `favoritePending`, `onToggleFavorite` và `error` điều khiển nút yêu thích
từ bên ngoài. `chat/TourMessageCard` nối dữ liệu chat và hook yêu thích vào khung này.
Chatbot dùng trực tiếp `TourRecommendationCard` với dữ liệu tour từ API.
