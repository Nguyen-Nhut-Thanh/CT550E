# Cấu trúc dự án

```text
D:\AI\
├── README.md                     # Chạy nhanh, kết quả và link CSV
├── start-demo.ps1                # Lệnh chạy demo giữ nguyên
├── dataset/                      # 765 ảnh / 15 địa danh; giữ nguyên nội dung
├── docs/
│   ├── PROJECT_STRUCTURE.md      # Tài liệu này
│   ├── WEB_INTEGRATION.md        # API và ranh giới web / AI
│   ├── TRAINING_AND_METRICS.md   # Cách train, công thức và CSV
│   └── design/                   # Các yêu cầu/thiết kế gốc
├── ai-service/
│   ├── main.py                  # Entry point Uvicorn
│   ├── README.md
│   ├── requirements*.txt
│   ├── configs/                 # demo.json chọn model đang dùng; config thí nghiệm
│   ├── src/
│   │   ├── common.py            # Đường dẫn gốc, config, hash, đọc ảnh dùng chung
│   │   ├── api/
│   │   │   ├── app.py           # Lifecycle, middleware, health, lỗi HTTP
│   │   │   ├── images.py        # Kiểm tra upload ảnh
│   │   │   └── routers/landmarks.py
│   │   ├── landmarks/
│   │   │   ├── data.py          # Audit và chia dữ liệu theo nhóm
│   │   │   ├── model.py         # ResNet50, preprocessing, dataset loader
│   │   │   ├── pipeline.py      # Train, calibration và evaluate
│   │   │   ├── predictor.py     # Nạp model và dự đoán
│   │   │   └── metrics.py       # Tính chỉ số và xuất CSV
│   │   ├── chatbot/             # Chỗ dành cho chatbot, chưa triển khai
│   │   └── tour_recommendation/ # Chỗ dành cho gợi ý tour, chưa triển khai
│   ├── demo/                    # Giao diện upload thử model
│   ├── tests/                   # Test chia dữ liệu, chỉ số, API, inference
│   ├── scripts/                 # Tải weights, kiểm tra HTTP, dọn cache
│   ├── manifests/               # Dataset/nhãn/split đang dùng
│   ├── models/resnet50-landmarks15-v2/  # Bundle model đang dùng
│   ├── reports/
│   │   ├── data/                # Báo cáo audit dataset hiện tại
│   │   └── resnet50-landmarks15-v2/     # 7 CSV, JSON, báo cáo và biểu đồ
├── .venv/                       # Môi trường đang chạy; không phải file rác
└── .cache/torch/                # Weights ImageNet phục vụ train offline
```


Chatbot và gợi ý tour sẽ có logic ở module tương ứng, router HTTP riêng và dữ liệu/model riêng. Không gộp hai chức năng đó vào classifier ảnh.
