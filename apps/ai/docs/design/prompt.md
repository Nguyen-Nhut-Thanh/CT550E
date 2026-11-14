# PROMPT: XÂY DỰNG MÔ HÌNH NHẬN DIỆN ĐỊA ĐIỂM DU LỊCH QUA ẢNH VÀ TÌM TOUR

## 1. Vai trò, mục tiêu và phạm vi

Bạn là Senior AI Engineer và Full-stack Developer chuyên Computer Vision, PyTorch, FastAPI và hệ thống du lịch. Hãy thiết kế rồi triển khai pipeline nhận ảnh người dùng, nhận diện địa điểm, trả độ tin cậy và tìm những tour thực sự có địa điểm đó trong lịch trình.

Chia sản phẩm thành hai giai đoạn:

1. **Demo độc lập:** huấn luyện, đánh giá và phục vụ nhận diện 6 địa điểm hiện có; có API và trang upload thử nghiệm tối giản. Chưa cần website du lịch/database để hoàn thành phần AI.
2. **Tích hợp và mở rộng:** kết nối dự án du lịch thực tế, truy vấn tour thật và mở rộng số địa điểm theo quy trình có kiểm soát.

Ví dụ hành vi đích sau khi đã thêm dữ liệu Cầu Cần Thơ: ảnh cầu → “Cầu Cần Thơ — độ tin cậy 89%” → danh sách tour có Cầu Cần Thơ. **89% chỉ minh họa cách hiển thị, không phải kết quả đã đo hoặc giá trị được gán cố định.**

Yêu cầu bắt buộc:

- Code chạy thực tế; không hard-code dự đoán AI, không tạo tour giả để thay truy vấn thật.
- Dùng pretrained/transfer learning, không train backbone từ đầu với vài trăm ảnh.
- Khảo sát source, hướng dẫn dự án, môi trường và schema thật trước khi sửa.
- Không mặc định đã có Next.js/Prisma hoặc bảng Tour/Destination. Không phá chức năng hiện tại, không tự reset DB hoặc chạy migration phá dữ liệu.
- Nếu chưa có website/database, hoàn thiện AI độc lập và hợp đồng tích hợp; ghi rõ phần tour chưa tích hợp, không báo hoàn thành end-to-end.
- Giữ nguyên ảnh nguồn. Không tự xóa/di chuyển/đổi tên ảnh gốc.
- Chỉ báo metric, latency và kết quả kiểm thử từ thực nghiệm. Phân biệt rõ đã thiết kế, đã code, đã chạy, đã đánh giá và đã tích hợp.

## 2. Hiện trạng dữ liệu và phạm vi 6 lớp

Kiểm kê ngày 20/10/2026 có các **tệp** sau, chưa xác minh decode, trùng lặp hoặc nhãn:

| class_key | Tên hiển thị dự kiến | Số tệp |
| --- | --- | ---: |
| ben_thanh_market | Chợ Bến Thành | 30 |
| dragon_bridge | Cầu Rồng | 46 |
| golden_bridge | Cầu Vàng | 27 |
| japanese_covered_bridge | Chùa Cầu Hội An | 32 |
| saigon_notre_dame | Nhà thờ Đức Bà Sài Gòn | 24 |
| the_huc_bridge | Cầu Thê Húc | 60 |
| **Tổng 6 lớp** | | **219** |

`dataset/overview/` đang rỗng, là thư mục phụ, không phải lớp thứ 7. Script phải kiểm kê lại khi chạy; bảng trên chỉ là snapshot ban đầu.

**Cầu Cần Thơ chưa có trong dữ liệu demo.** Ảnh cầu này cần đi qua cơ chế từ chối/không chắc chắn; không hứa chắc nhận diện và không gán cố định sang cầu đã học. Muốn hỗ trợ cần thêm dữ liệu, metadata, cập nhật model và kiểm thử lại.

Giữ nhãn thư mục làm `class_key`. Dùng whitelist lớp rõ ràng, loại trừ thư mục phụ và báo thư mục lạ thay vì âm thầm thêm lớp. Khi mở rộng có chủ đích, cập nhật cấu hình rồi xác định C từ danh sách hợp lệ; không hard-code số 6 trong tensor/API.

## 3. Lựa chọn mô hình

### 3.1. Mô hình chính: ResNet50 pretrained + classification head

Dùng Torchvision **ResNet50 với `ResNet50_Weights.IMAGENET1K_V2`**, thay lớp cuối bằng `Linear(2048, C)`, ban đầu C = 6.

Đây là lựa chọn baseline cho demo: tận dụng đặc trưng pretrained khi ít dữ liệu, triển khai/giải thích thuận tiện và có thể thử trên CPU. Không khẳng định tốt nhất trước khi thực nghiệm.

```text
Ảnh → kiểm tra/EXIF/RGB → preprocessing đã lưu
    → ResNet50 → embedding 2048 chiều → logits C lớp
    → temperature scaling → confidence các lớp
    → kiểm tra ngưỡng + độ gần gallery train
    → recognized / uncertain / unknown
```

Phân biệt rõ:

- Tensor đầu vào `(B, 3, 224, 224)`; một ảnh có 150.528 giá trị pixel.
- Vector sau Global Average Pooling và trước FC có 2.048 chiều.
- Đầu ra classifier có C logits, demo là 6, không phải 20.
- Màu sắc, cạnh, texture, hình khối, bố cục, đối tượng và ngữ nghĩa là các khái niệm giải thích đặc trưng. Không chia cứng 2.048 chiều thành 7 nhóm hoặc khẳng định mỗi chiều có ý nghĩa cố định.

### 3.2. Phương án so sánh khi cần

Nếu baseline chưa đạt và đủ tài nguyên, thử **DINOv2 ViT-S/14 frozen + linear classifier**, embedding CLS 384 chiều, processor đúng checkpoint. Dùng cùng manifest chia dữ liệu và ngân sách thử nghiệm; chọn model trên validation theo chất lượng, latency và bộ nhớ. Không triển khai nhiều backbone chỉ để tăng độ phức tạp.

Không dùng mô tả do LLM sinh ra để tự quyết định địa điểm hay tạo danh sách tour.

### 3.3. Mở rộng sau demo

Khi nhiều địa điểm, đánh giá thêm image retrieval: embedding ảnh truy vấn → top-k ảnh tham chiếu → gộp theo địa điểm → xác minh/rerank. Bắt đầu bằng NumPy cosine/nearest neighbors; chỉ dùng FAISS/vector database khi quy mô và phép đo cho thấy cần.

Với encoder cố định, thêm ảnh vào gallery không luôn cần train lại encoder, nhưng phải đánh giá lớp mới và ngưỡng. Với classifier C lớp hiện tại, thêm lớp cần mở rộng head, train lại với cả dữ liệu cũ và mới, calibration và phát hành phiên bản mới.

## 4. Công nghệ và kiến trúc tích hợp

- AI: Python 3.11, PyTorch/Torchvision tương thích, NumPy, pandas, Pillow, scikit-learn, Matplotlib, perceptual hash; pytest cho kiểm thử cần thiết.
- Service: FastAPI, Uvicorn, Pydantic, python-multipart. Cố định dependency versions sau khi kiểm tra môi trường.
- Website/DB: theo stack thật. Nếu dự án là Next.js + TypeScript + Prisma + Tailwind thì dùng cấu trúc hiện có. Demo độc lập chỉ cần trang upload nhỏ, không dựng toàn bộ website du lịch.

```text
Browser → backend website → FastAPI nhận diện
                         ← class_key, confidence, trạng thái
        → mapping class_key thành destination_id
        → truy vấn tour có destination_id trong lịch trình
Browser ← địa điểm + tour thật + trạng thái truy vấn
```

Backend website sở hữu dữ liệu tour và quyền DB. AI service không cần kết nối DB. Không đưa API key riêng vào browser.

## 5. Chuẩn bị dữ liệu

### 5.1. Audit và manifest

- Hỗ trợ JPG/JPEG/PNG/WEBP không phân biệt hoa thường; kiểm tra decode nội dung thật, kích thước và hướng ảnh.
- Phát hiện ảnh hỏng, quá nhỏ, ảnh ghép, watermark lớn, nhãn sai hoặc không thấy địa danh; xuất báo cáo để rà soát.
- Dùng exact hash và perceptual hash tìm trùng/gần trùng, cả giữa các lớp. Không tự xóa nguồn; nhãn mâu thuẫn phải được rà soát trước khi dùng.
- Gom cùng nhóm ảnh chụp liên tiếp, cùng video, resize/crop từ ảnh gốc hoặc cùng nguồn khi có metadata. Perceptual hash không bảo đảm phát hiện mọi rò rỉ.
- Lưu nguồn và quyền sử dụng nếu biết; không tự đoán thông tin còn thiếu.
- Xuất `dataset_report.json`, thống kê và `manifest.csv`.

Manifest gợi ý: `image_id, relative_path, class_key, source_id, group_id, exact_hash, width, height, split, excluded_reason`. Lưu seed và hash/version manifest.

### 5.2. Chia tập

- Mục tiêu train 70%, validation 20%, test 10%, cân đối theo lớp và tách theo nhóm. Tỷ lệ có thể lệch do nhóm; báo số lượng thực tế.
- Gom nhóm trước khi split; toàn bộ một `group_id` nằm cùng một tập.
- Với chỉ 24–60 tệp/lớp, test 10% có thể chỉ vài ảnh/lớp. Không diễn giải accuracy cao trên test nhỏ là đã dùng tốt ngoài thực tế.
- Khóa test, chỉ đánh giá cuối của phiên bản. Không chọn model/hyperparameter/ngưỡng dựa trên test.
- Khi đủ dữ liệu, tách dữ liệu phát triển thành phần chọn model và phần calibration/ngưỡng riêng, giữ tách nhóm. Có thể phải thu thập thêm để đủ mẫu mỗi lớp.
- Khi quá ít, dùng group-aware cross-validation trên phần train/validation; ghi rõ hạn chế nếu phải tái sử dụng validation để calibration. Test vẫn độc lập.
- Nếu lớp không đủ nhóm độc lập cho các split, báo thiếu dữ liệu; không âm thầm đưa ảnh cùng nhóm sang nhiều tập hoặc tuyên bố đánh giá hợp lệ.
- Ưu tiên đọc theo manifest. Nếu tạo `dataset_split/train|val|test/`, giữ nguyên dữ liệu nguồn.

### 5.3. Dữ liệu ngoài 6 lớp (OOD)

Chuẩn bị `ood_dev/` để chọn ngưỡng và `ood_test/` để đánh giá cuối; tách nhóm/nguồn, không trùng với known hoặc nhau.

Bao gồm địa điểm chưa hỗ trợ, cầu/chùa/nhà thờ tương tự, phố, thiên nhiên, người, đồ ăn, nội thất và ảnh không có địa danh. Cầu Cần Thơ có thể là hard negative trước khi được bổ sung thành lớp.

OOD không tự động trở thành lớp thứ 7. Một lớp “other” hữu hạn cũng không đại diện mọi ảnh lạ.

### 5.4. Bổ sung dữ liệu

219 tệp là điểm bắt đầu cho prototype. Mục tiêu thu thập ban đầu có thể là 100–300 ảnh hợp lệ đa dạng/lớp rồi điều chỉnh theo lỗi thực tế; không phải mức bảo đảm accuracy.

Ưu tiên nhiều ảnh gốc độc lập: xa/gần, góc nhìn, ngày/đêm, thời tiết, người che khuất, thiết bị khác nhau. Augmentation không thay thế dữ liệu độc lập.

## 6. Tiền xử lý và huấn luyện

### 6.1. Tiền xử lý

- Sửa hướng EXIF, chuyển RGB, xử lý alpha theo quy tắc nhất quán.
- Validation/test/inference ResNet50 V2 theo weights: resize cạnh ngắn 232, center crop 224; mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`.
- Training: crop vừa phải để giữ công trình, jitter màu nhẹ, xoay nhỏ. Horizontal flip cần xem xét vì có thể đảo chữ/cấu trúc đặc trưng; không mặc định biến đổi mạnh.
- Không augmentation ngẫu nhiên ở validation/calibration/test/inference. Nếu thử letterbox/padding để giữ công trình, đánh giá như cấu hình riêng và lưu cùng model.

### 6.2. Hai bước transfer learning

1. Freeze backbone, chỉ train head. Giữ BatchNorm backbone ở eval khi freeze để tránh cập nhật running statistics ngoài ý muốn.
2. Chỉ mở `layer4` fine-tune khi validation cho thấy cần; tránh overfit.

| Tham số | Khởi đầu đề xuất, cấu hình được |
| --- | --- |
| Batch size | 16, giảm khi thiếu bộ nhớ |
| Head training | Tối đa 20 epochs; early stopping patience 5 |
| Fine-tune tùy chọn | Tối đa 10 epochs |
| Optimizer | AdamW |
| LR head | 1e-3; khi fine-tune có thể giảm 1e-4 |
| LR layer4 | 1e-5 khi mở tầng |
| Weight decay | 1e-4 |
| Loss | CrossEntropyLoss |
| Chọn checkpoint | Validation macro-F1; val loss khi hòa |
| Seed | 42, ghi seed khác nếu chạy lặp |

- Log train/val loss, accuracy, macro-F1 và thời gian; lưu best checkpoint và cấu hình resume.
- Class weights/sampler chỉ dùng khi phân tích cho thấy cần, tính từ train; tránh đồng thời bù mất cân bằng quá mức.
- Tự phát hiện CPU/CUDA. DataLoader phù hợp Windows và có main guard; không bắt buộc GPU.
- Inference dùng `model.eval()` và inference mode.

### 6.3. Gallery embedding

`feature_extractor.py` xuất embedding 2.048 chiều, L2 normalize để tính cosine. Gallery phục vụ quyết định chỉ lấy từ train/reference được phép dùng; không đưa val/test vào gallery lúc đánh giá.

Lưu NumPy `.npy/.npz` kèm metadata ảnh/nhãn; CSV tùy chọn. Thử độ tương đồng trung bình top-k của lớp ứng viên, ví dụ k=3 cấu hình được, để hỗ trợ từ chối. Không đổi cosine trực tiếp thành phần trăm xác suất.

## 7. Độ tin cậy và từ chối nhận diện

### 7.1. Phần trăm có nghĩa gì?

Tính `p = softmax(logits / T)`; T > 0 fit bằng temperature scaling trên calibration split khi đủ dữ liệu, tối thiểu dùng dữ liệu model chưa train. Lưu T, nguồn fit và trạng thái calibration.

UI ghi **“Độ tin cậy dự đoán: 89%”**, không ghi “ảnh trùng 89%”. Điểm này là ước lượng có điều kiện trên các lớp hỗ trợ, không phải phần trăm pixel giống nhau hay xác suất toàn cục ảnh thuộc tập known. Calibration không tự giải quyết OOD, và dữ liệu ít khiến điểm vẫn có thể kém tin cậy.

Đánh giá NLL, Brier score, ECE trước/sau calibration; báo số mẫu và số bins ECE. Nếu chưa calibration, `calibrated=false` và ghi rõ điểm chưa hiệu chỉnh; không bịa T hoặc kết quả.

### 7.2. Quyết định trạng thái

Thử kết hợp các tín hiệu, chọn ngưỡng trên known-dev + OOD-dev:

- Confidence top-1 ≥ `tau_conf`.
- Chênh lệch top-1 và top-2 ≥ `tau_margin`.
- Độ tương đồng embedding với gallery của lớp top-1 ≥ `tau_similarity`.

`recognized` chỉ khi đạt điều kiện đã đánh giá. Định nghĩa rõ quy tắc còn lại, ví dụ thiếu hỗ trợ từ gallery → `unknown`; có hỗ trợ nhưng confidence/margin chưa đủ → `uncertain`. Đây là heuristic, không bảo đảm từ chối mọi ảnh lạ.

Chọn ngưỡng để cân bằng precision, tỷ lệ chấp nhận known và tỷ lệ OOD bị nhận nhầm. Không tùy ý gán 0.7/0.8 rồi gọi là đáng tin. Ngưỡng riêng từng lớp chỉ dùng khi đủ mẫu.

Chưa có OOD để chọn/đánh giá ngưỡng thì `ood_validated=false`, chỉ coi là demo nội bộ; không tuyên bố xử lý tốt ảnh ngoài 6 lớp.

Unknown/uncertain không tự động gợi ý tour như thể đã nhận diện. Có thể cho người dùng xem ứng viên và chủ động xác nhận địa điểm rồi mới tìm tour, gắn rõ “Bạn đã chọn địa điểm này”. Điểm thấp không chứng minh ảnh không có địa danh.

## 8. Đánh giá và kiểm thử

### 8.1. Chỉ số và báo cáo

- Known test cố định: accuracy, macro/weighted precision-recall-F1, top-3 accuracy, confusion matrix, precision/recall/support mỗi lớp. Nếu dùng “per-class accuracy” phải định nghĩa rõ; ưu tiên recall mỗi lớp.
- Known + OOD test: tỷ lệ OOD bị chấp nhận nhầm, tỷ lệ OOD được từ chối, known bị từ chối, precision trên ảnh đã chấp nhận và known coverage. Nêu mẫu số; tính cả lỗi nhận sai lớp known và lỗi OOD gán thành known.
- Learning curves, ảnh đúng/sai, lỗi theo điều kiện chụp, reliability diagram nếu đủ mẫu.
- Báo số mẫu và bất định; nếu bootstrap thì resample theo nhóm khi phù hợp. Không kết luận chắc chắn trên test vài chục ảnh.
- Đo latency p50/p95, cold start, bộ nhớ và phần cứng; tách inference khỏi upload/truy vấn tour.
- Ưu tiên thêm test từ người chụp/nguồn độc lập chưa có ở train.
- Xuất JSON, CSV và ảnh biểu đồ; không dùng test để điều chỉnh ngưỡng rồi tiếp tục gọi đó là test độc lập.

### 8.2. Mục tiêu demo đề xuất

Mốc thử nghiệm, **không phải kết quả/cam kết**: known macro-F1 ≥ 0,85; precision trên known được chấp nhận ≥ 0,90; known coverage ≥ 0,70; OOD false acceptance ≤ 0,10. Công bố số mẫu và bất định. Không đạt precision bằng cách từ chối gần hết ảnh.

Nếu chưa đạt hoặc mẫu quá ít, báo hạn chế, bổ sung dữ liệu và tạo phiên bản đánh giá mới. Không sửa test chỉ để tăng điểm. Tiêu chí production cần chốt lại trên ảnh người dùng thực và chi phí gợi ý sai tour.

### 8.3. Kiểm thử chức năng cần thiết

- Decode, nhãn, nhóm trùng không vượt split, class mapping không đảo thứ tự khi load.
- Embedding đúng chiều, inference tái lập trong dung sai, load đúng calibration/ngưỡng.
- Upload hợp lệ, file giả MIME, file quá lớn, ảnh quá nhiều pixel, model chưa sẵn sàng, unknown/uncertain.
- Tour có/không có, tour ẩn/hủy, thiếu mapping, lỗi DB, không lấy tour lớp khác.
- Fixture/mock được dùng cho unit test có ghi rõ, không thay kết quả demo AI/tour thật.

## 9. Artifact và phiên bản

```text
models/<model_version>/
├── best_model.pth
├── classes.json
├── preprocessing.json
├── training_config.json
├── calibration.json
├── thresholds.json
├── gallery_embeddings.npz
├── gallery_metadata.json
├── metrics.json
└── manifest_hash.txt
```

`classes.json` lưu index/class_key/tên hiển thị theo đúng thứ tự train; không suy luận lại từ thư mục khi phục vụ. Metadata có architecture, weights, embedding_dim, C, dataset_version, seed, dependency versions, code revision nếu có, số mẫu và trạng thái đánh giá.

Model/classes/preprocessing/calibration/ngưỡng/gallery thuộc cùng bundle; không trộn phiên bản. Kiểm tra dimension/mapping/version ở startup, lỗi thì fail readiness. Chỉ nạp checkpoint tin cậy, không nạp checkpoint từ upload người dùng. Có baseline để so sánh/rollback; phiên bản mới kiểm tra hồi quy lớp cũ.

## 10. Hợp đồng FastAPI

- `GET /health`: liveness.
- `GET /ready`: sẵn sàng khi bundle tải và kiểm tra thành công.
- `GET /model/info`: model_version, lớp hỗ trợ, embedding_dim, calibration/OOD status, giới hạn upload.
- `POST /predict`: multipart trường `image`, một ảnh/request; chỉ inference, không truy vấn tour.

Ví dụ **chỉ minh họa schema, không phải kết quả chạy thật**:

```json
{
  "request_id": "example-request",
  "model_version": "resnet50-demo-v1",
  "status": "recognized",
  "prediction": {
    "class_key": "dragon_bridge",
    "display_name": "Cầu Rồng",
    "confidence": 0.89
  },
  "candidates": [
    {"class_key": "dragon_bridge", "confidence": 0.89},
    {"class_key": "golden_bridge", "confidence": 0.07},
    {"class_key": "the_huc_bridge", "confidence": 0.02}
  ],
  "calibrated": true,
  "ood_validated": true,
  "reason_code": "accepted",
  "inference_ms": 125
}
```

Các cờ/thời gian phải lấy trạng thái/số đo thật khi chạy. Top-3 không cần cộng thành 1 vì còn lớp khác. API dùng confidence 0–1, UI nhân 100 và định dạng nhất quán.

Unknown/uncertain: `prediction=null`, có reason_code, có thể trả candidates tham khảo. Ảnh hợp lệ nhưng không nhận diện được vẫn HTTP 200; tách lỗi upload khỏi từ chối AI.

Vận hành:

- Load model một lần mỗi process, chọn số worker theo bộ nhớ; không mặc định nhân nhiều bản model trên một GPU.
- Giới hạn cấu hình, khởi đầu 10 MB và 25 megapixel/ảnh. Kiểm tra stream bytes, nội dung decode, không chỉ tin MIME/extension/Content-Length.
- Từ chối ảnh động hoặc quy định rõ frame; demo không nhận URL ảnh tùy ý.
- HTTP 413 quá lớn, 415 không hỗ trợ, 400/422 nội dung không hợp lệ, 503 chưa sẵn sàng; lỗi có request_id, mã và thông điệp an toàn, không lộ đường dẫn/model.
- Timeout, concurrency/rate limit và hàng đợi giới hạn; không để inference nặng chặn event loop.
- Production ưu tiên backend gọi service qua mạng riêng có xác thực. CORS đúng allowlist nếu dev cần browser gọi trực tiếp.
- Không lưu ảnh upload mặc định, giải phóng sau request. Không log ảnh/base64/EXIF vị trí; không đưa ảnh người dùng vào train nếu chưa được đồng ý.

## 11. Liên kết địa điểm với tour

### 11.1. Dữ liệu logic

Khảo sát schema trước; nếu chưa có cấu trúc tương đương, đề xuất:

```text
Destination(id, name, slug, province, ...)
AiPlaceMapping(class_key UNIQUE, destination_id FK)
Tour(id, title, slug, publication_status, ...)
TourStop(tour_id FK, destination_id FK, day_number, stop_order, ...)
```

Tour và Destination nhiều-nhiều qua các điểm dừng lịch trình. Dùng quan hệ sẵn có nếu phù hợp, không tạo bảng trùng vai trò. Nếu tour ghé một địa điểm nhiều lần, không ép unique(tour_id, destination_id) làm mất lịch trình; khử trùng tour khi trả kết quả.

- Mapping dựa ID/key ổn định, không so chuỗi tên/tỉnh hoặc tìm từ khóa trong mô tả tour.
- Địa điểm trong DB có thể chưa có lớp AI; tập hỗ trợ AI là tập con.
- Tên/tỉnh hiển thị cuối cùng lấy từ dữ liệu đã quản lý, không do model tự suy đoán.
- Migration theo quy trình dự án; seed mapping chỉ dùng destination_id đã kiểm chứng, không reset DB.

### 11.2. Truy vấn và trạng thái

Recognized → mapping class_key → Destination → tour có điểm dừng tham chiếu đúng Destination → lọc được công bố và trạng thái cho phép hiển thị theo nghiệp vụ hiện có.

- Có thể lọc lịch khởi hành/chỗ còn nếu DB có; không tự tạo giá/tình trạng chỗ.
- Phân trang, khử trùng và trả card theo schema thật: ID, tên, URL và trường có sẵn. Nếu có giá, giữ đơn vị tiền và điều kiện giá.
- Không có tour: vẫn hiện địa điểm; `tour_status=empty`, “Chưa có tour đi qua địa điểm này”.
- Có tour: `tour_status=found`.
- Thiếu mapping: giữ kết quả AI, `tour_status=unmapped`; không thay bằng địa điểm gần giống.
- DB lỗi: `tour_status=unavailable`, không diễn giải thành không có tour.
- Chưa kết nối DB: `tour_status=not_integrated`, không trả tour giả khiến người dùng tưởng là thật.
- Unknown/uncertain chưa được người dùng xác nhận: `tour_status=not_requested`.

Backend website cung cấp endpoint theo convention dự án, ví dụ `POST /api/recognize-place`, gộp `recognition`, `destination`, `tours`, `tour_status`, phân trang. Giữ được kết quả nhận diện nếu bước tìm tour lỗi.

Confidence AI không phải điểm chất lượng hay độ phù hợp của tour. Tour được chọn bằng lịch trình trong DB, không huấn luyện AI để sinh danh sách tour.

## 12. Giao diện

- Upload kéo thả/chọn file, kiểm tra định dạng/dung lượng, preview, nút nhận diện và loading.
- Recognized: địa điểm, tỉnh/thành nếu có, độ tin cậy, thông tin chi tiết và tour đi qua nơi đó.
- Top-3 là ứng viên tham khảo, không hiện tất cả như kết luận ngang nhau.
- Unknown/uncertain: thông báo chưa xác định chắc, gợi ý ảnh rõ công trình/góc khác và danh sách đang hỗ trợ; có thể cho người dùng chọn ứng viên để tìm tour với nhãn xác nhận thủ công.
- Phân biệt trạng thái tour ở phần 11; không che mất kết quả AI khi DB lỗi.
- Bỏ qua/hủy response cũ khi đổi ảnh, tránh hiển thị ảnh trước; chống gửi lặp, có timeout/retry phù hợp.
- Responsive, accessible, theo thiết kế hiện có; demo độc lập có thể xanh dương nhạt/trắng. Không thiết kế lại toàn bộ website.
- Demo một ảnh/một địa điểm; collage hoặc nhiều địa danh không thuộc phạm vi phân loại một nhãn. Không hứa nhận diện mọi góc chụp/cảnh thiếu dấu hiệu.

## 13. Source và pipeline

Cấu trúc đề xuất, điều chỉnh theo repository. Dataset hiện tại có thể giữ ngoài service qua `dataset_root`.

```text
ai-service/
├── configs/demo.yaml
├── models/
├── reports/
├── manifests/
├── src/
│   ├── api/          # routes, schemas, upload validation
│   ├── data/         # audit, grouping, manifest, splits
│   ├── training/     # train, evaluate, calibrate, tune thresholds
│   ├── inference/    # predictor, feature_extractor, rejector
│   └── utils/
├── scripts/
│   ├── check_dataset.py
│   ├── prepare_dataset.py
│   └── build_gallery.py
├── tests/
├── demo/
├── requirements.txt
├── README.md
└── main.py
```

Thiết kế CLI/config cho: audit → split → train → build-gallery → calibrate → tune-thresholds → evaluate → serve. README dùng lệnh khớp code thật, đường dẫn Windows, cách chạy CPU/GPU; không ghi lệnh chưa có implementation như tính năng hoàn thành.

## 14. Các giai đoạn triển khai và đầu ra

1. **Khảo sát:** source, stack/schema thật, tài nguyên, audit dữ liệu. Nếu mới có dataset/prompt, bắt đầu AI độc lập.
2. **Dữ liệu:** manifest tái lập, nhóm trùng, split, thống kê và danh sách cần bổ sung/OOD.
3. **Baseline:** ResNet50 frozen + head, checkpoint/learning curves/gallery. Chỉ fine-tune khi có bằng chứng cần.
4. **Đánh giá:** calibration, ngưỡng, báo cáo known/OOD và hạn chế dữ liệu ít. Có thể tiếp tục prototype khi chưa đủ OOD, nhưng phải gắn cờ chưa được đánh giá.
5. **Demo:** API/trang upload chạy inference thật, xử lý lỗi/không chắc chắn. Chưa có DB thì tour chưa tích hợp.
6. **Tích hợp:** mapping, query tour theo lịch trình, UI theo website; kiểm thử bằng DB/tour thật khi được cung cấp.
7. **Mở rộng:** thêm lớp, đánh giá hồi quy, thử backbone/retrieval khi có nhu cầu đo được; version, rollback, theo dõi lỗi và drift.

Sau mỗi giai đoạn báo file tạo/sửa, cách chạy, kiểm thử thực tế và phần thiếu. README cuối có cài đặt, dữ liệu, pipeline, cách đọc confidence/metrics, API/lỗi, demo, hợp đồng tour, thêm lớp mới, xử lý ảnh upload và giới hạn. Có model report ghi nguồn dữ liệu, số nhóm/split, lớp hỗ trợ, phần cứng, metric và phạm vi phù hợp.

**Hoàn thành demo:** pipeline tái lập cho 6 địa điểm, inference thật, độ tin cậy được diễn giải trung thực, cơ chế từ chối đánh giá theo dữ liệu sẵn có và hợp đồng tích hợp tour rõ ràng.

**Hoàn thành sản phẩm:** tour thật từ database, đánh giá ảnh người dùng ngoài thực tế, quy trình mở rộng không bỏ quên các lớp cũ.

## 15. Nguồn kỹ thuật tham khảo

Nguồn làm cơ sở kỹ thuật; lựa chọn thiết kế và mốc nghiệm thu ở trên phải được kiểm chứng trên dữ liệu thực:

- [PyTorch: Transfer Learning for Computer Vision](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)
- [Torchvision: ResNet50 weights và preprocessing](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet50.html)
- [Guo và cộng sự: On Calibration of Modern Neural Networks](https://arxiv.org/abs/1706.04599)
- [Meta: DINOv2 model card](https://github.com/facebookresearch/dinov2/blob/main/MODEL_CARD.md)

Không suy ra accuracy của 6 lớp từ tài liệu tham khảo. Chỉ thực nghiệm trên dữ liệu đã kiểm tra mới cho biết chất lượng thực tế.
