# Demo AI nhận diện 15 địa điểm du lịch

Phạm vi hiện tại: **chọn một trong 15 địa điểm** bằng ResNet50 pretrained và trả top-3. Phiên bản mới là `resnet50-landmarks15-v2`. Trang upload kèm theo dùng để thử AI.

## Chạy demo đã huấn luyện

Trong PowerShell:

```powershell
cd D:\AI\ai-service
..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Mở [trang thử ảnh](http://127.0.0.1:8000) hoặc [API docs](http://127.0.0.1:8000/docs). Dịch vụ chỉ lắng nghe trên máy này. Dừng bằng Ctrl+C.

Nhận diện một ảnh bằng dòng lệnh, không cần chạy server:

```powershell
..\.venv\Scripts\python.exe -m src.landmarks.predictor "D:\duong-dan\anh-moi.jpg"
```

Thêm `--device cpu` để thử CPU. Trang upload hỗ trợ JPEG/PNG/WEBP, tối đa 10 MB/25 megapixel, cạnh ngắn từ 64 pixel. Không nhận ảnh động; ảnh được xử lý trong bộ nhớ, không lưu làm dữ liệu train.

## Mô hình và giới hạn

- ResNet50 `IMAGENET1K_V2`, head 2.048 → 15; train head tối đa 30 epoch rồi fine-tune layer4 tối đa 10 epoch. BatchNorm giữ frozen, early stopping patience 7; chọn checkpoint bằng macro-F1 validation, dùng validation loss để phá hòa.
- Các lớp: Chợ Bến Thành, Cầu Rồng, Cầu Vàng, Nhà hát Lớn Hà Nội, Lăng Chủ tịch Hồ Chí Minh, Chùa Cầu Hội An, Ngọ Môn Huế, Chùa Một Cột, Dinh Độc Lập, Bưu điện Trung tâm Sài Gòn, Nhà thờ Đức Bà Sài Gòn, Văn Miếu – Quốc Tử Giám, Cầu Thê Húc, Chùa Thiên Mụ và Cầu Trường Tiền.
- Tiền xử lý validation/calibration/test/inference: EXIF → RGB → resize cạnh ngắn 232 → center crop 224 → ImageNet normalization. Alpha được ghép nền trắng.
- Training: crop nhẹ, xoay ±5°, jitter màu nhẹ. Không lật ngang mặc định.
- Confidence được hiệu chỉnh temperature scaling bằng phần calibration riêng. T bị giới hạn [0.5,10] để hạn chế fit cực đoan trên tập nhỏ. Điểm vẫn chỉ có điều kiện trên 15 lớp.
- **Mô hình luôn chọn một trong 15 lớp, kể cả ảnh lạ. Chưa có dữ liệu OOD nên chưa bật ngưỡng từ chối.** Response ghi `status=closed_set_prediction`, `ood_validated=false`. Không coi ảnh lạ có điểm cao là đã nhận diện đúng.
- Gallery embedding L2-normalized chỉ từ train; cosine là tín hiệu tham khảo, không phải phần trăm xác suất và chưa dùng làm điều kiện chấp nhận.
- Ảnh nguồn ít; pHash chỉ gom một phần ảnh gần trùng. Chưa có metadata nguồn để chứng minh không còn cùng chuỗi chụp/cùng nguồn giữa các tập. Phải bổ sung ảnh độc lập để đánh giá thực tế.
- Test khóa không dùng chọn checkpoint, temperature hoặc hyperparameter. Không chọn model khác dựa trên test đã xem.

## Dữ liệu và chia tập

Dataset nguồn giữ tại `D:\AI\dataset`, giữ nguyên nội dung ảnh. Ngày 31/10/2026 đã chuẩn hóa tên 765 ảnh / 15 địa danh thành `<dia_danh>_train_001.<ext>` hoặc `<dia_danh>_test_001.<ext>`, chia 612 train / 153 test theo nhóm ảnh. Xem [manifest đang dùng](manifests/manifest.csv).

Config 15 lớp lưu tại `configs/landmarks15.json`; `configs/demo.json` chọn phiên bản dùng cho inference mặc định.

Pipeline decode ảnh, kiểm tra kích thước, hash SHA-256, pHash (Hamming ≤6), gom nhóm trước khi split. Exact duplicate chỉ giữ một đại diện. Nhóm gần trùng xuyên lớp được loại khỏi train và đưa vào báo cáo để rà soát, không tự quyết nhãn.

Giữ nguyên 612 ảnh có tên `train` và 153 ảnh có tên `test`. Chỉ từ phần train, tách validation và calibration, mỗi phần khoảng 12,5% ngân sách train, theo toàn bộ nhóm ảnh. Sau loại 7 exact duplicates còn **454 train / 77 validation / 77 calibration / 150 test**; không có ảnh test đi vào ba tập còn lại. Tên file `train` vẫn dùng cho ảnh validation/calibration vì đây là các phần tách từ ngân sách train ban đầu; cột `split` trong `manifests/manifest.csv` là tập được pipeline sử dụng, cột `source_partition` lưu train/test ban đầu.

Xem contact sheets trong `reports/data/` để rà soát nhãn và các nhóm. Nếu biết ảnh cùng nguồn/chuỗi, tạo `manifests/manual_groups.csv` có cột `relative_path,source_id`; cùng source_id sẽ cùng group. Không suy đoán rằng tên file khác đồng nghĩa nguồn độc lập.

Lần audit 15 lớp: 765 ảnh decode được, không có ảnh lỗi, 758 ảnh được sử dụng sau loại exact duplicates. Nhóm thủ công là biện pháp thận trọng, không phải bằng chứng nguồn đã được xác minh; xem `manifests/MANUAL_GROUP_NOTES.md`.

## Cài môi trường mới

Máy triển khai ban đầu dùng Python 3.12, RTX 3050 4 GB và CUDA wheel 12.6. Trên máy có Python 3.11/3.12 thông thường:

```powershell
cd D:\AI
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install torch==2.6.0 torchvision==0.21.0 --index-url https://download.pytorch.org/whl/cu126
.\.venv\Scripts\python.exe -m pip install -r ai-service\requirements.txt
```

Máy chỉ dùng CPU: thay index wheel bằng `https://download.pytorch.org/whl/cpu`. Không cài lại torch CPU lên môi trường GPU hiện tại. Phiên bản chính xác đã chạy được lưu trong `requirements-lock.txt`; bản này ghi cả biến thể CUDA nên dành cho môi trường tương tự.

Lần đầu cần Internet để tải weights từ PyTorch. Cache weights của dự án được cấu hình trong các lệnh bên dưới; môi trường đã tạo có sẵn checkpoint, inference không cần tải lại.

## Tái lập pipeline

```powershell
cd D:\AI\ai-service
$env:TORCH_HOME = 'D:\AI\.cache\torch'
..\.venv\Scripts\python.exe -m src.landmarks.data --config configs\landmarks15.json
..\.venv\Scripts\python.exe -m src.landmarks.pipeline train --config configs\landmarks15.json --device cuda
..\.venv\Scripts\python.exe -m src.landmarks.pipeline evaluate --config configs\landmarks15.json --device cuda
..\.venv\Scripts\python.exe -m pytest -q
```

`train` bao gồm train head, chọn checkpoint trên val, calibration bằng tập riêng và tạo gallery train. `evaluate` chạy test từ snapshot manifest trong bundle và sinh báo cáo. `all` chạy train rồi evaluate.

Manifest/model đã tồn tại sẽ không bị ghi đè mặc định. Để làm thí nghiệm mới, đổi `model_version` trong config trước khi train. Khi thay dữ liệu hoặc nhóm, backup/version manifest và báo cáo cũ rồi dùng `python -m src.landmarks.data --config configs\landmarks15.json --overwrite`; không dùng báo cáo phiên bản cũ cho dữ liệu mới. Cấu hình này đã chốt 30 head epochs và 10 fine-tune epochs trước khi xem test; không chọn lại model theo kết quả test đã công bố.

## Kết quả và artifact

- `reports/data/dataset_report.json`: số ảnh, lỗi, trùng, số nhóm, số mẫu từng split.
- `reports/resnet50-landmarks15-v2/REPORT.md`: kết quả đo thực tế của model 15 lớp.
- Cùng thư mục có `metrics.json`, `test_predictions.csv`, confusion matrix và learning curves.
- `models/resnet50-landmarks15-v2/`: weights, classes đúng thứ tự, config, manifest snapshot/hash, preprocessing, calibration, gallery, thresholds tắt, metrics và training history.
- `metrics.json` có accuracy, macro-F1, top-3, precision/recall/support mỗi lớp, confusion matrix, NLL/Brier/ECE trước/sau calibration và latency chỉ model. Bootstrap accuracy theo nhóm có thể suy biến nếu mẫu nhỏ/toàn đúng; không phải bảo đảm chất lượng.

Không ghi sẵn accuracy trong README. Đọc báo cáo sinh từ lần chạy thật. Số liệu ban đầu cần được xác nhận bằng ảnh mới do người dùng chụp, có dữ liệu OOD riêng trước khi dùng sản phẩm.

## API

`GET /health`, `GET /ready`, `GET /model/info`, `POST /predict` (multipart trường `image`). `/ready` trả 503 nếu bundle không tải được. Không cần API key cho demo chỉ chạy localhost. Khi triển khai mạng cần gateway xác thực/rate limit/timeout; CORS chưa mở cho website khác.

Kết quả có model_version, request_id, prediction, candidates, confidence 0–1, calibrated, ood_validated, gallery_similarity và inference_ms. UI chuyển confidence sang %. Confidence không phải tỷ lệ ảnh giống nhau. Lỗi JSON có request_id và error.code/message: 400 ảnh hỏng/quá nhỏ, 413 quá lớn, 415 định dạng/MIME, 422 thiếu ảnh, 429 bận, 503 model chưa sẵn sàng.

## Bước tiếp theo sau đánh giá

Rà soát nhóm/nhãn → thêm ảnh độc lập → thêm OOD-dev/OOD-test → chọn ngưỡng trên dev → đánh giá known coverage/OOD false acceptance → cân nhắc fine-tune hoặc encoder khác nếu lỗi cho thấy cần. Chỉ sau đó mới tích hợp tour; không có code giả lập tour trong demo này.

Nguồn: [Torchvision ResNet50](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html), [PyTorch transfer learning](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html), [temperature scaling](https://arxiv.org/abs/1706.04599).

## Cấu trúc module và CSV

Logic nhận diện nằm tại `src/landmarks/`; HTTP chung tại `src/api/app.py`, router nhận diện tại `src/api/routers/landmarks.py`. `main.py` giữ vai trò entry point để lệnh khởi động cũ vẫn chạy.

API có namespace `/api/v1/landmarks/info` và `/api/v1/landmarks/predict`; các alias cũ vẫn hoạt động. Chatbot/gợi ý tour có module riêng dành cho triển khai tiếp, chưa có endpoint hoạt động. Xem [tài liệu tích hợp web](../docs/WEB_INTEGRATION.md).

`python -m src.landmarks.metrics` xuất lại 7 CSV từ kết quả test đã lưu. Mỗi lần `train` tự xuất `training_history.csv`; `evaluate` tự xuất đầy đủ chỉ số và dự đoán. Xem [định nghĩa CSV và cách train](../docs/TRAINING_AND_METRICS.md).

Dọn cache sinh lại được bằng `scripts/clean.ps1`; thêm `-IncludeDownloadCache` để dọn cache tải thư viện/audit cũ. Script giữ dataset, model, `.venv` và weights ImageNet trong `.cache/torch`.
