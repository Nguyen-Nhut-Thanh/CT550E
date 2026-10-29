# Component của web

Tìm theo khu vực trước, rồi chọn thư mục chức năng cần sửa. Component, thẻ,
skeleton và CSS module của cùng một chức năng nằm cạnh nhau.

## Tài khoản — `account/`

| Thư mục | Sửa phần nào |
| --- | --- |
| `layout/` | Khung tài khoản, menu, vùng nội dung và provider dữ liệu |
| `profile/` | Trang cá nhân, thông tin hồ sơ, tổng quan và cột thông tin bên phải |
| `avatar/` | Hiển thị và chỉnh ảnh đại diện, dùng cho hồ sơ và cài đặt |
| `membership/` | Thẻ hạng thành viên, huy hiệu, tiến độ và quyền lợi |
| `favorites/` | Tour yêu thích |
| `bookings/` | Lịch sử đặt tour |
| `reviews/` | Bài đánh giá của khách hàng |
| `wallet/` | Ví voucher và ưu đãi |
| `notifications/` | Danh sách thông báo |
| `settings/` | Cài đặt hồ sơ và đổi mật khẩu |

Ví dụ: sửa giao diện hạng trong `account/membership/AccountMembershipTab.tsx`,
sửa danh sách yêu thích trong `account/favorites/AccountFavoritesTab.tsx`.

## Trang chủ — `home/`

| Thư mục | Sửa phần nào |
| --- | --- |
| `hero/` | Banner đầu trang và các slide |
| `flash-deals/` | Khuyến mãi nhanh: section, thẻ tour và skeleton |
| `featured-tours/` | Tour nổi bật: section, thẻ tour và skeleton |
| `destinations/` | Điểm đến yêu thích, thẻ điểm đến và skeleton |
| `about/` | Giới thiệu JourniTrip |
| `why-choose/` | Lý do lựa chọn và các thẻ lợi ích |

## Tour, đặt tour và bài viết

- `tours/listing/`: danh sách, thẻ tour, bộ lọc, sắp xếp, trạng thái trống và skeleton.
- `tours/detail/`: ảnh đầu trang, tiện ích, điểm nổi bật, lịch trình, bản đồ và video.
- `tours/booking/`: thẻ đặt tour và lịch chọn ngày khởi hành.
- `tours/reviews/`: đánh giá tour và ảnh đại diện người đánh giá.
- `tours/recommendations/`: danh sách tour được gợi ý.
- `booking/checkout/`: thông tin tour, số khách, hành khách, liên hệ, dịch vụ và tóm tắt đơn.
- `booking/vouchers/`: chọn voucher thành viên, nhập mã và phương thức thanh toán.
- `booking/detail/`: chi tiết đơn đã đặt và CSS module tương ứng.
- `blog/listing/`: các bài nổi bật ở trang danh sách.
- `blog/article/`: tiêu đề, nội dung, khối bài viết, bố cục và bài liên quan.
- `blog/widgets/`: banner quảng bá, đăng ký nhận tin và liên kết mạng xã hội.

## Component dùng chung — `common/`

| Thư mục | Nội dung |
| --- | --- |
| `layout/` | Header, footer, liên kết footer và nhãn menu |
| `navigation/` | Phản hồi khi chuyển trang (`NavigationPending`) |
| `calendar/` | Lịch, bộ chọn ngày tìm kiếm/lọc và ô nhập ngày sinh |
| `forms/` | Dropdown, nhãn biểu mẫu, giá tiền và upload ảnh |
| `feedback/` | Toast provider, vùng hiển thị, từng toast và thông báo trong trang |
| `overlays/` | Dialog, xác nhận thao tác và popover |
| `media/` | Hiển thị ảnh có phương án dự phòng |
| `search/` | Thanh tìm kiếm tour |
| `tours/` | Nút yêu thích, biểu tượng phương tiện, sao đánh giá và thẻ gợi ý tour |
| `loading/` | Màn hình chờ dùng trong các trang |

`Calendar` dựng lịch dùng chung. `Dialog` quản lý popup và bàn phím;
`Popover` giữ lịch/dropdown không bị cắt bởi vùng cuộn. Component dùng chung
có comment tiếng Việt giải thích chức năng ngay trước khai báo.

`common/tours/TourRecommendationCard` là khung thẻ gợi ý dùng chung, tối đa
600px và co theo khung chứa. Truyền thông tin tour cùng `favorite`,
`favoritePending`, `onToggleFavorite`, `error` từ bên ngoài. Component không
phụ thuộc hội thoại, socket hay API chatbot. `chat/TourMessageCard` nối dữ liệu
chat và hook yêu thích vào khung này.

## Quản trị — `admin/`

- `layout/`: guard truy cập và menu quản trị.
- `common/`: các component `Admin*` dùng giữa nhiều nghiệp vụ: bảng,
  phân trang, tìm kiếm, trạng thái, thao tác dòng, tiêu đề, biểu mẫu, popup và chọn ngày.
- `locations/management/`, `locations/editor/`, `locations/featured/`: danh sách,
  chỉnh sửa địa điểm và bố cục địa điểm yêu thích.
- `tours/management/`, `tours/editor/`: danh sách tour và biểu mẫu chỉnh sửa tour.
- `schedules/tour-picker/`, `schedules/listing/`, `schedules/editor/`: chọn tour,
  danh sách lịch khởi hành và chỉnh sửa lịch.
- `posts/editor/`, `posts/blocks/`, `posts/categories/`: biên tập bài viết,
  chỉnh các khối nội dung và quản lý danh mục.
- `bookings/`, `dashboard/`, `banners/`, `users/`, `chats/`, `vouchers/`,
  `flash-deals/`: mỗi thư mục đã là một nhóm chức năng riêng.

`auth/` chứa các biểu mẫu đăng nhập, đăng ký, xác thực và đăng nhập Google.
`chat/` chứa khung chat, soạn tin, dòng thời gian và chọn/chia sẻ tour cho khách.

## Quy ước thêm component

1. Đặt file vào đúng nhóm chức năng; khi thêm chức năng mới, tạo thư mục con
   mang tên chức năng đó. Dùng tên thư mục chữ thường, nối bằng dấu gạch ngang.
2. Giữ skeleton và CSS module cạnh component tương ứng. Ưu tiên mỗi file một
   component chính, tên file trùng tên component.
3. Import trực tiếp từ file; không thêm `index.ts` chuyển tiếp hoặc giữ file
   ở đường dẫn cũ chỉ để export lại. Import cùng thư mục có thể dùng `./`;
   giữa các nhóm dùng `@/components/...` để dễ tìm.
4. Hook, cache và xử lý dữ liệu vẫn nằm trong `lib/`, ví dụ
   `lib/account/useAccountResource`, `lib/notifications/useToast`, `lib/ui/useDismiss`.
   Các kiểu dữ liệu dùng chung nằm trong package `shared`.
