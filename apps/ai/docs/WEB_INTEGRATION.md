# Tích hợp AI vào web

AI service có phần HTTP dùng chung tại `ai-service/src/api/`; từng chức năng có module riêng:

| Chức năng | Logic | Router | Tình trạng |
| --- | --- | --- | --- |
| Nhận diện địa danh | `src/landmarks/` | `src/api/routers/landmarks.py` | Đã có model 15 lớp |
| Chatbot du lịch | `src/chatbot/` | Dự kiến `src/api/routers/chatbot.py` | Chưa triển khai |
| Gợi ý tour | `src/tour_recommendation/` | Dự kiến `src/api/routers/tours.py` | Chưa triển khai |

Chạy `D:\AI\start-demo.ps1`, xem schema tại `http://127.0.0.1:8000/docs`.

## API nhận diện đang hoạt động

- `POST /api/v1/landmarks/predict`: multipart form với trường `image`.
- `GET /api/v1/landmarks/info`: phiên bản model, danh sách lớp, cấu hình xử lý ảnh.
- `GET /health` và `GET /ready`: trạng thái tiến trình/model.
- `/predict` và `/model/info` được giữ để tương thích demo cũ.

Ví dụ PowerShell, thay đường dẫn bằng một ảnh thực:

```powershell
curl.exe -X POST "http://127.0.0.1:8000/api/v1/landmarks/predict" -F "image=@D:\duong-dan\anh.jpg"
```

Backend web gửi ảnh đến AI service rồi dùng `prediction.class_key` làm khóa địa danh. Đầu ra có `prediction`, `candidates` (top-3), `model_version`, `confidence` trong từng dự đoán và `inference_ms`.

Luồng dự kiến: ảnh người dùng → nhận diện địa danh → backend lấy dữ liệu tour → module gợi ý tour xếp hạng → chatbot giải thích kết quả bằng dữ liệu của web. Model nhận diện ảnh không tự truy cập database tour.

Các endpoint chatbot/tour chưa được đăng ký; chỉ thêm khi có phần xử lý thật. Đăng ký router mới bằng `app.include_router(...)` trong `src/api/app.py`, dùng prefix riêng để mỗi chức năng có API độc lập.

Web có thể gọi qua backend/reverse proxy. Nếu browser gọi thẳng AI service từ origin khác, cấu hình CORS theo origin thật của web; hiện service chưa bật CORS.
