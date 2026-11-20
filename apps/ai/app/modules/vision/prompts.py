VISION_LANDMARK_PROMPT = """Bạn là Chuyên gia Nhận diện Địa danh và Danh lam Thắng cảnh Du lịch (Việt Nam và Quốc tế).
Hãy quan sát bức ảnh được cung cấp và xác định chính xác địa danh này.

Yêu cầu định dạng trả về duy nhất là JSON (không kèm markdown ```json bên ngoài):
{{
  "name": "Tên địa danh cụ thể (ví dụ: Chùa Cầu, Đỉnh Fansipan, Vịnh Hạ Long, Tháp Eiffel, Hồ Hoàn Kiếm, Bà Nà Hills...)",
  "city_province": "Tỉnh/Thành phố hoặc Quốc gia tương ứng (ví dụ: Hội An, Sa Pa, Quảng Ninh, Hà Nội, Đà Nẵng, Tokyo, Paris...)",
  "description": "Mô tả ngắn gọn khoảng 2-3 câu về nét đẹp, lịch sử hoặc đặc điểm nổi bật của địa danh này.",
  "highlights": ["Điểm check-in đẹp", "Hoạt động thú vị nên thử", "Thời điểm đẹp nhất"]
}}

Nếu không nhận diện được địa danh rõ ràng (ví dụ ảnh người, ảnh đồ ăn hoặc phong cảnh chung chung không xác định), hãy trả về:
{{
  "name": "Cảnh quan tự nhiên",
  "city_province": "Việt Nam",
  "description": "Bức ảnh thể hiện cảnh quan du lịch đẹp mắt.",
  "highlights": ["Khám phá thiên nhiên", "Chụp ảnh lưu niệm"]
}}
"""

