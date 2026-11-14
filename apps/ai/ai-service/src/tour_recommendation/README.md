# Gợi ý tour

Vị trí dành cho logic gợi ý tour; hiện chưa có thuật toán hay endpoint hoạt động.

- Đầu vào dự kiến: `landmark_class_key` từ nhận diện ảnh, điểm đến, ngân sách, thời lượng và sở thích.
- Nguồn tour, giá, chỗ trống và `tour_id` thuộc backend/database của web.
- Đầu ra dự kiến: danh sách `tour_id`, điểm xếp hạng và lý do gợi ý dựa trên dữ liệu thực.
- Khi triển khai, thêm router `src/api/routers/tours.py`, đăng ký prefix `/api/v1/tours` tại `src/api/app.py`.
- Logic xếp hạng đặt trong module này, phần HTTP đặt trong router; không đưa logic tour vào model nhận diện ảnh.

Xem `docs/WEB_INTEGRATION.md` ở gốc dự án.
