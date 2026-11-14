# Chatbot

Vị trí dành cho chatbot du lịch; hiện chưa có model, provider hay endpoint hoạt động.

- Logic hội thoại, truy xuất dữ liệu và gọi provider đặt trong module này.
- Khi triển khai, thêm router `src/api/routers/chatbot.py`, đăng ký prefix `/api/v1/chatbot` tại `src/api/app.py`.
- Đầu vào dự kiến: `message`, lịch sử hội thoại và ngữ cảnh địa danh/tour cần thiết.
- Đầu ra dự kiến: `reply`, nguồn dữ liệu tham khảo và tour liên quan nếu có.
- Dùng dữ liệu tour từ backend web qua một lớp truy cập dữ liệu; cấu hình provider/API key ở biến môi trường khi triển khai.

Xem `docs/WEB_INTEGRATION.md` ở gốc dự án để biết ranh giới giữa web và AI service.
