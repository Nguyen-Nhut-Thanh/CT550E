# Dịch vụ AI cho web du lịch

Đã huấn luyện **ResNet50 pretrained + fine-tune layer4** cho đủ 15 địa danh trong dataset. Model mặc định: `resnet50-landmarks15-v2`.

## Thử mô hình

Khởi động từ PowerShell trong `D:\AI`:

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --app-dir ai-service --host 127.0.0.1 --port 8000
```

Mở [demo upload ảnh](http://127.0.0.1:8000), chọn ảnh rồi nhấn nhận diện. Nếu dịch vụ đang chạy sẵn, chỉ cần mở link. Dừng server bằng Ctrl+C trong cửa sổ chạy lệnh.

## Kết quả model 15 địa danh — 01/11/2026

| Nội dung | Kết quả đo |
| --- | --- |
| Ảnh nguồn / dùng được sau loại exact duplicate | 765 / 758 |
| Train / val / calibration / test | 454 / 77 / 77 / 150 |
| Test theo nhóm đã phát hiện | 150 ảnh, 133 nhóm |
| Test accuracy | 142/150 = 94.67% |
| Test macro-F1 | 0.9497 |
| Test top-3 accuracy | 148/150 = 98.67% |
| Huấn luyện | 30 head + 10 fine-tune epochs; 432.8 giây |
| Phần cứng | NVIDIA GeForce RTX 3050 Ti Laptop GPU 4 GB |
| Latency chỉ model sau warm-up | p50 6.6 ms; p95 7.5 ms |

Kết quả trên tập test này chưa bảo đảm chất lượng trên mọi ảnh thực tế. Model luôn chọn một trong 15 lớp, kể cả ảnh ngoài danh sách. Confidence được hiệu chỉnh trên 77 ảnh riêng (temperature 1,0869), chưa có đánh giá OOD và metadata nguồn đầy đủ.

## Tài liệu và kết quả

- [Hướng dẫn đầy đủ: cài đặt, huấn luyện, đánh giá, API, giới hạn](ai-service/README.md)
- [Báo cáo kết quả theo từng địa điểm](ai-service/reports/resnet50-landmarks15-v2/REPORT.md)
- [Ảnh test và dự đoán](ai-service/reports/resnet50-landmarks15-v2/test_examples.png)
- [Confusion matrix](ai-service/reports/resnet50-landmarks15-v2/confusion_matrix.png)
- [Learning curves](ai-service/reports/resnet50-landmarks15-v2/learning_curves.png)
- [Danh sách dự đoán từng ảnh](ai-service/reports/resnet50-landmarks15-v2/test_predictions.csv)
- [Báo cáo dữ liệu](ai-service/reports/data/dataset_report.json)

Mô hình lưu tại `ai-service/models/resnet50-landmarks15-v2/`. Môi trường riêng tại `.venv/`; nội dung ảnh nguồn trong `dataset/` được giữ nguyên.

Dataset được đặt tên theo mẫu `<dia_danh>_train_001.jpg` hoặc `<dia_danh>_test_001.jpg` (giữ đuôi file gốc): **612 train / 153 test**. Validation và calibration chỉ tách từ phần train; tập test giữ nguyên, loại 3 bản trùng còn 150 ảnh dùng đánh giá. Xem [manifest dùng train](ai-service/manifests/manifest.csv).

## Tổ chức và tích hợp web

- Nhận diện địa danh đang hoạt động: `ai-service/src/landmarks/`.
- API chung và router theo chức năng: `ai-service/src/api/`.
- Chatbot: `ai-service/src/chatbot/`; gợi ý tour: `ai-service/src/tour_recommendation/` (hai phần này chưa triển khai).
- [Sơ đồ thư mục](docs/PROJECT_STRUCTURE.md) · [Tích hợp web](docs/WEB_INTEGRATION.md).
- [Cách train và đọc CSV](docs/TRAINING_AND_METRICS.md).

## Các bảng CSV kết quả

- [Chỉ số tổng hợp](ai-service/reports/resnet50-landmarks15-v2/summary_metrics.csv): accuracy, precision, recall, F1.
- [Chỉ số từng địa danh](ai-service/reports/resnet50-landmarks15-v2/per_class_metrics.csv): TP/FP/FN/TN và support.
- [Actual / predicted từng ảnh](ai-service/reports/resnet50-landmarks15-v2/test_predictions.csv).
- [Ảnh dự đoán sai](ai-service/reports/resnet50-landmarks15-v2/test_errors.csv).
- [Confusion matrix CSV](ai-service/reports/resnet50-landmarks15-v2/confusion_matrix.csv).
- [Lịch sử train](ai-service/reports/resnet50-landmarks15-v2/training_history.csv).
- [Số ảnh từng tập](ai-service/reports/resnet50-landmarks15-v2/split_counts.csv).

Mỗi lần train hiện tại bắt đầu từ weights ImageNet và học lại toàn bộ phần `split=train`; chưa hỗ trợ resume từ model cũ hoặc tự chỉ học ảnh mới. Xem hướng dẫn chi tiết ở tài liệu phía trên.
