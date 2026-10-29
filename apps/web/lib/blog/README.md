# Bài viết

- `/blog`: bài chủ đạo (01), bốn bài nổi bật (02–05), bốn bài gợi ý (06–09).
- `/blog/[slug]`: bài công khai theo slug; bài liên quan ưu tiên cùng danh mục.
- `/admin/marketing/posts`: danh sách, lọc trạng thái/danh mục, tạo và sửa bài.
- `/admin/marketing/posts/layout`: sơ đồ 9 vị trí, chọn bài, lưu bố cục.

Bài mới dùng `content_blocks` dạng `{ version: 1, blocks: [...] }`. Form tạo sẵn mẫu giới thiệu điểm đến với tiêu đề, đoạn văn, ảnh, nhóm trải nghiệm có biểu tượng, mẹo du lịch, lời kết và nút đặt tour. Các khối có thể thêm, di chuyển, nhân bản, thu gọn và xóa. Đoạn văn dùng trường nhập trực quan hỗ trợ in đậm, in nghiêng và liên kết. Không có màn hình xem trước.

Năm trường bổ sung: `content_blocks`, `author_display_name`, `published_at`, `tags`, `cover_position`. `thumbnail` tiếp tục dùng làm ảnh bìa và ảnh đại diện. `published_at` được ghi khi công khai lần đầu và giữ nguyên khi sửa/ẩn/đăng lại. Bài cũ chưa có dữ liệu khối vẫn hiển thị bằng bộ đọc nội dung cũ, khi sửa được đưa vào một khối văn bản giữ nguyên nội dung. `content` được tự tổng hợp từ các khối để tương thích dữ liệu cũ.

Lưu nháp chỉ yêu cầu danh mục, cho phép nội dung chưa hoàn chỉnh. Đăng công khai yêu cầu tiêu đề, ảnh bìa và nội dung thực tế. Ảnh trong bài cần mô tả; trải nghiệm cần tên và mô tả; nút có liên kết cần nhãn. Các khối trống được bỏ qua ngoài trang. Liên kết và loại khối được kiểm tra trên server; HTML không được thực thi. Nút chọn tour được server gắn đúng `/tours/:id` và chỉ nhận tour công khai.

Chỉ bài có `status = 1` được công khai. Ô trống tự bù bằng bài mới nhất, không trùng bài đã chọn. Khi thiếu bài, ưu tiên bài chủ đạo và thu gọn các khối còn lại. Sửa tiêu đề không đổi slug đã xuất bản. Xóa bài tự gỡ vị trí liên kết; chuyển về nháp khiến vị trí tự bù.

Thiết lập cơ sở dữ liệu ở môi trường mới: generate Prisma client, sau đó chạy `node scripts/apply-blog-layout.cjs` và `node scripts/apply-article-blocks.cjs` từ gốc dự án. Các script chỉ bổ sung cấu trúc còn thiếu và giữ nguyên bài cũ. Trên Windows, dừng API trước khi generate để tránh khóa Prisma DLL.
