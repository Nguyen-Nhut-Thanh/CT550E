# PROMPT: XÂY DỰNG HỆ THỐNG AI NHẬN DIỆN ĐỊA ĐIỂM DU LỊCH QUA HÌNH ẢNH

## 1. Vai trò

Bạn là một Senior AI Engineer, Machine Learning Engineer và Full-stack Developer chuyên về Computer Vision, Deep Learning, Python, PyTorch, FastAPI, Next.js và Prisma.

Nhiệm vụ của bạn là thiết kế và triển khai một hệ thống AI nhận diện danh lam thắng cảnh, địa điểm du lịch Việt Nam thông qua hình ảnh, có khả năng tích hợp vào website du lịch hiện tại.

**Yêu cầu quan trọng:**
- Viết code hoàn chỉnh, có thể chạy thực tế.
- Không sử dụng dữ liệu giả để thay thế kết quả nhận diện AI.
- Ưu tiên mô hình pretrained kết hợp Transfer Learning.
- Tổ chức mã nguồn rõ ràng, dễ bảo trì và mở rộng.
- Không phá vỡ các chức năng hiện có của website.
- Trước khi chỉnh sửa, phân tích cấu trúc dự án và cơ sở dữ liệu hiện tại.

## 2. Công nghệ sử dụng

**Machine Learning:**
- Python 3.11+
- PyTorch
- Torchvision
- ResNet50 pretrained trên ImageNet
- NumPy
- Pandas
- Pillow
- Scikit-learn
- Matplotlib

**Backend AI:**
- FastAPI
- Uvicorn
- Pydantic

**Website:**
- Next.js
- TypeScript
- Prisma ORM
- Tailwind CSS

Không thay đổi framework hoặc kiến trúc hiện có nếu không thực sự cần thiết.

## 3. Xây dựng dataset

Xây dựng bộ dữ liệu nhận diện 20 địa điểm du lịch nổi tiếng tại Việt Nam.

Quy mô mục tiêu:

- Số lớp: 6 địa điểm.
- Training: 70%.
- Validation: 20%.
- Testing: 10%.

Các địa điểm ban đầu có thể bao gồm:



Cấu trúc dataset:

```text
dataset/
├── ben_thanh_market/
├── dragon_bridge/
├── japanese_covered_bridge/
├── saigon_notre_dame/
├── the_huc_bridge/
└── golden_bridge/

Yêu cầu:

Tự động duyệt toàn bộ thư mục.

Hỗ trợ JPG, JPEG, PNG và WEBP.

Kiểm tra file ảnh hỏng.

Phát hiện ảnh trùng và gần trùng.

Thống kê số ảnh mỗi địa điểm.

Không đổi tên, di chuyển hoặc xóa ảnh gốc.

Giữ nguyên tên thư mục làm nhãn phân loại.

Tạo báo cáo thống kê dataset.
```

Việc chia dữ liệu cần tránh rò rỉ giữa các tập, đặc biệt với ảnh trùng, gần trùng hoặc cùng một chuỗi ảnh.

Tạo thư mục dữ liệu huấn luyện riêng:

dataset_split/
├── train/
├── val/
└── test/


## 4. Trích xuất đặc trưng hình ảnh

Sử dụng mô hình ResNet50 để tự động trích xuất các đặc trưng từ hình ảnh.

Các nhóm đặc trưng cần giải thích trong tài liệu gồm:

1. Color Features: Màu sắc, sắc độ, độ sáng, độ tương phản.
2. Shape Features: Hình dạng, đường cong, hình khối.
3. Texture Features: Kết cấu bề mặt.
4. Edge Features: Đường cạnh, đường viền, góc.
5. Spatial Features: Bố cục và vị trí tương đối.
6. Object Features: Các đối tượng như cầu, núi, chùa, tháp.
7. Semantic Features: Các dấu hiệu ngữ nghĩa giúp nhận biết địa điểm.

Lưu ý: Đây là các nhóm đặc trưng mang tính khái niệm. Không được khẳng định ResNet50 chia cố định 2.048 chiều thành 7 nhóm trên.

### Yêu cầu kỹ thuật

- Kích thước ảnh đầu vào: 224 × 224 × 3.
- Sử dụng ResNet50 pretrained.
- Lấy vector 2.048 chiều từ đầu ra Global Average Pooling trước lớp phân loại.
- Thay lớp Fully Connected cuối bằng lớp phân loại số địa điểm thực tế.
- Tự động xác định số lớp từ dataset.
- Hỗ trợ trích xuất và lưu vector embedding của từng ảnh.
- Xây dựng module `feature_extractor.py`.
- Hỗ trợ xuất dữ liệu đặc trưng ra CSV hoặc NumPy.

Giải thích rõ sự khác nhau giữa:
- 150.528 giá trị pixel RGB đầu vào.
- 2.048 đặc trưng được mô hình trích xuất.
- 20 đầu ra phân loại địa điểm.

## 5. Huấn luyện mô hình

Sử dụng Transfer Learning với ResNet50.

Cấu hình ban đầu:

- Batch size: 16.
- Epochs: 10.
- Optimizer: Adam.
- Learning rate: 0.001 cho lớp phân loại.
- Loss function: CrossEntropyLoss.
- Image augmentation phù hợp.
- Tự động phát hiện CUDA hoặc CPU.

Quy trình:

1. Load và kiểm tra dataset.
2. Tiền xử lý hình ảnh.
3. Áp dụng augmentation cho training.
4. Load ResNet50 pretrained.
5. Freeze backbone.
6. Thay classification head.
7. Huấn luyện mô hình.
8. Theo dõi training loss và validation loss.
9. Theo dõi training accuracy và validation accuracy.
10. Lưu checkpoint tốt nhất theo validation.
11. Hỗ trợ fine-tuning các tầng cuối nếu cần.
12. Lưu class mapping và cấu hình tiền xử lý.

Đảm bảo validation và testing không áp dụng augmentation ngẫu nhiên.

Lưu model:

```text
models/
├── best_model.pth
├── classes.json
├── training_config.json
└── metrics.json
```

## 6. Đánh giá mô hình

Xây dựng module đánh giá độc lập trên tập testing.

Các chỉ số:

- Accuracy
- Precision
- Recall
- F1-score
- Top-3 Accuracy
- Confusion Matrix
- Per-class Accuracy

Trực quan hóa:
- Biểu đồ Training Loss và Validation Loss.
- Biểu đồ Training Accuracy và Validation Accuracy.
- Confusion Matrix.
- Một số hình ảnh dự đoán đúng và sai.

Không sử dụng tập test để lựa chọn hyperparameter.

Xuất báo cáo đánh giá thành file JSON, CSV và ảnh biểu đồ.

## 7. Xây dựng chức năng nhận diện địa điểm

Người dùng tải hình ảnh lên và hệ thống thực hiện:

1. Kiểm tra định dạng và kích thước ảnh.
2. Tiền xử lý.
3. Trích xuất đặc trưng.
4. Dự đoán bằng mô hình.
5. Trả về tối đa 3 địa điểm có xác suất cao nhất.
6. Hiển thị độ tin cậy của dự đoán.
7. Ánh xạ nhãn AI sang thông tin địa điểm trong database.

Cần xử lý trường hợp:
- Ảnh không hợp lệ.
- Ảnh bị lỗi.
- Ảnh không chứa địa điểm được hỗ trợ.
- Mô hình có độ tin cậy thấp.
- Không tìm thấy thông tin địa điểm trong database.

Xây dựng cơ chế phát hiện ảnh ngoài tập lớp nhận diện, hiệu chỉnh và kiểm thử ngưỡng từ dữ liệu thực. Không xem Softmax confidence là xác suất đúng tuyệt đối.

## 8. Xây dựng FastAPI

Tạo backend AI riêng bằng Python.

Các endpoint:

- `GET /health`: Kiểm tra trạng thái dịch vụ.
- `GET /model/info`: Trả về thông tin mô hình, số lớp, số chiều đặc trưng.
- `POST /predict`: Nhận hình ảnh và dự đoán địa điểm.

Yêu cầu:

- Load model một lần khi khởi động.
- Validate MIME type và nội dung ảnh.
- Giới hạn kích thước upload.
- Không lưu ảnh người dùng nếu không cần thiết.
- Có xử lý lỗi phù hợp.
- Trả về JSON thống nhất.
- Thiết lập CORS và xác thực phù hợp với kiến trúc triển khai.
- Không để lộ file model hoặc đường dẫn nội bộ.

## 9. Tích hợp vào website Next.js

Kiểm tra cấu trúc dự án Next.js hiện có và tích hợp chức năng nhận diện hình ảnh.

Thiết kế giao diện hiện đại, phù hợp với website du lịch:

- Khu vực tải ảnh bằng kéo thả hoặc chọn file.
- Xem trước ảnh.
- Nút bắt đầu nhận diện.
- Trạng thái đang phân tích.
- Kết quả nhận diện.
- Tên địa điểm và tỉnh/thành.
- Tỷ lệ tin cậy.
- Top 3 kết quả.
- Thông tin chi tiết địa điểm.
- Gợi ý tour liên quan.
- Thông báo khi không nhận diện được.

Giao diện sử dụng tông xanh dương nhạt, trắng, bo góc mềm mại, responsive và nhất quán với thiết kế website hiện tại.

Không thiết kế lại toàn bộ website; chỉ xây dựng các thành phần cần thiết.


## 11. Cấu trúc source code

Tổ chức phần AI độc lập, ví dụ:

```text
ai-service/
├── dataset/
├── models/
├── src/
│   ├── api/
│   ├── training/
│   │   ├── train.py
│   │   ├── evaluate.py
│   │   └── dataset_loader.py
│   ├── inference/
│   │   ├── predictor.py
│   │   └── feature_extractor.py
│   └── utils/
├── scripts/
│   ├── prepare_dataset.py
│   └── check_dataset.py
├── requirements.txt
├── README.md
└── main.py
```

Phần Next.js phải đặt theo cấu trúc thực tế của dự án.

## 12. Tài liệu và kiểm thử

Tạo README hướng dẫn:

1. Cài đặt Python và dependencies.
2. Chuẩn bị dataset.
3. Kiểm tra dữ liệu.
4. Huấn luyện mô hình.
5. Đánh giá.
6. Chạy FastAPI.
7. Tích hợp Next.js.
8. Thử nhận diện bằng hình ảnh.
9. Cập nhật và mở rộng số lượng địa điểm.

Viết kiểm thử cho:
- Dataset loader.
- Class mapping.
- Feature extraction.
- Model inference.
- Upload validation.
- API response.

## 13. Cách thực hiện

Hãy triển khai theo từng giai đoạn:

**Giai đoạn 1:** Phân tích dự án, schema và kiến trúc tích hợp.

**Giai đoạn 2:** Xây dựng cấu trúc dataset và script xử lý dữ liệu.

**Giai đoạn 3:** Xây dựng ResNet50, trích xuất 2.048 đặc trưng và huấn luyện.

**Giai đoạn 4:** Xây dựng đánh giá mô hình.

**Giai đoạn 5:** Xây dựng FastAPI phục vụ nhận diện hình ảnh.

**Giai đoạn 6:** Tích hợp vào website Next.js, kết nối Prisma và hoàn thiện giao diện.

**Giai đoạn 7:** Kiểm thử end-to-end và viết tài liệu hướng dẫn.

Hãy bắt đầu bằng cách kiểm tra mã nguồn thực tế, sau đó triển khai các phần có đủ dữ liệu và phụ thuộc. Không giả định những file, bảng hay dữ liệu chưa tồn tại.

Sau mỗi giai đoạn, trình bày ngắn gọn các file đã tạo hoặc chỉnh sửa, cách chạy, kết quả kiểm thử thực tế và những vấn đề còn tồn tại.

**Mục tiêu cuối cùng:** Một hệ thống AI nhận diện địa điểm du lịch qua hình ảnh chạy thực tế, có thể huấn luyện, đánh giá, mở rộng và tích hợp hoàn chỉnh vào website du lịch hiện tại.