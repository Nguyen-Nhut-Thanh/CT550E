# Huấn luyện và các bảng CSV

## Mỗi lần train có học tiếp model cũ không?

Hiện tại mỗi lần chạy `train` sẽ khởi tạo ResNet50 từ **weights ImageNet V2**, tạo lớp phân loại mới theo danh sách địa danh, rồi học lại trên **toàn bộ ảnh có `split=train` trong manifest**. Đây không phải khởi tạo ngẫu nhiên toàn bộ mạng, cũng không phải tiếp tục từ model 15 lớp lần trước.

Với manifest hiện tại, 454 ảnh tham gia cập nhật trọng số. 77 ảnh validation dùng chọn checkpoint; 77 ảnh calibration dùng hiệu chỉnh confidence; 150 ảnh test dùng đánh giá. Validation/calibration chỉ tách từ phần train ban đầu.

Trong cùng một lần chạy, giai đoạn fine-tune layer4 nạp checkpoint tốt nhất của giai đoạn train head vừa xong. Code chưa hỗ trợ `--resume`, nạp optimizer state của lần trước hoặc tự động chỉ học ảnh mới. Các model đã có không bị ghi đè; một lần train mới cần `model_version` mới trong config.

## CSV của model hiện tại

Các file nằm tại `ai-service/reports/resnet50-landmarks15-v2/`, mã hóa UTF-8 có BOM để Excel đọc tên tiếng Việt.

| File | Nội dung |
| --- | --- |
| `summary_metrics.csv` | Accuracy, precision/recall/F1 macro, weighted, micro, số ảnh đúng/sai, top-3 accuracy |
| `per_class_metrics.csv` | Precision, recall, F1, specificity, TP/FP/FN/TN và support của từng địa danh |
| `test_predictions.csv` | Mỗi ảnh test: actual label, predicted label, tên tiếng Việt, confidence, đúng/sai |
| `test_errors.csv` | Chỉ các ảnh test dự đoán sai |
| `confusion_matrix.csv` | Hàng là actual, cột là predicted, ô là số ảnh |
| `training_history.csv` | Từng epoch: stage, train/validation loss, accuracy, validation macro-F1 và thời gian |
| `split_counts.csv` | Số ảnh train/val/calibration/test và số ảnh bị loại của từng địa danh |

`actual_label` là nhãn thật do dataset/manifest cung cấp, `predicted_label` là nhãn model dự đoán. Đây là hai nhãn để tính điểm, không phải tên một chỉ số.

Các điểm mặc định là số **0–1**; cột kết thúc `_percent` là số **0–100**. `correct` là 1 nếu đúng, 0 nếu sai. Các cột đếm là số nguyên. Không làm tròn số trước khi tính chỉ số tổng hợp.

- Accuracy = tổng ảnh đúng / tổng ảnh test.
- Precision = TP / (TP + FP).
- Recall = TP / (TP + FN).
- F1 = 2TP / (2TP + FP + FN).
- Specificity = TN / (TN + FP).
- Macro là trung bình đều giữa các địa danh; weighted là trung bình theo support của từng địa danh.
- `one_vs_rest_accuracy` xem một lớp đối với tất cả lớp còn lại; nó khác accuracy chung của model.
- Mẫu số bằng 0 trả 0, theo quy ước của bộ đánh giá hiện tại.

Accuracy/precision/recall/F1 và confusion matrix được tính lại từ các dự đoán đã lưu, đối chiếu tập test với manifest và so sánh accuracy/macro-F1 với `metrics.json`. Top-3 lấy từ kết quả đã đo trong `metrics.json`, vì bản dự đoán top-1 không đủ để tính lại top-3. `csv_exports.json` ghi các nguồn và checksum tương ứng.

## Xuất lại CSV từ kết quả đã lưu

```powershell
cd D:\AI\ai-service
..\.venv\Scripts\python.exe -m src.landmarks.metrics
```

Có thể thêm `--model-version <ten-phien-ban>`. Lệnh này đọc kết quả test đã lưu, không chạy huấn luyện. `train` tự xuất lịch sử epoch; `evaluate` tự xuất đầy đủ các CSV ở mỗi phiên bản model.

## Lần huấn luyện mới

Tạo config mới từ `configs/landmarks15.json`, đổi `model_version` sang một tên chưa tồn tại. Khi bổ sung dữ liệu, đặt đúng nhãn/tên train hoặc test, tạo lại manifest và báo cáo từ ảnh hiện có; sau khi model mới chạy tốt, có thể xóa bundle/báo cáo cũ để chỉ giữ phiên bản đang dùng. Ảnh/nhóm trùng không được nằm ở hai tập train/test khác nhau.

```powershell
cd D:\AI\ai-service
# Thay config bên dưới bằng config mới có model_version mới.
..\.venv\Scripts\python.exe -m src.landmarks.data --config configs\landmarks15-v3.json --overwrite
..\.venv\Scripts\python.exe -m src.landmarks.pipeline all --config configs\landmarks15-v3.json --device cuda
```

Khi muốn dùng model mới cho web/demo, cập nhật `configs/demo.json` sau khi đã train và kiểm tra bundle. Bản config `landmarks15-v3.json` trong ví dụ chưa được tạo tự động.
