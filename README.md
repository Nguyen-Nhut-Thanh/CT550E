# JourniTrip

## Cấu hình môi trường

Dự án chỉ dùng hai file ở thư mục gốc:

- `.env`: cấu hình thực tế và thông tin bí mật trên máy đang chạy; Git bỏ qua file này.
- `.env.example`: mẫu cấu hình để chia sẻ và khởi tạo máy mới; không chứa thông tin bí mật thực tế.

Tạo cấu hình lần đầu bằng PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run db:generate
npm run setup --workspace=ai
```

Điền thông tin database, Google, Cloudinary, email và VNPay trong `.env` theo dịch vụ sử dụng. Biến có tiền tố `NEXT_PUBLIC_` được đưa vào trình duyệt, chỉ dùng cho thông tin công khai.

Web, API, Prisma và các script nhập dữ liệu đều đọc `.env` ở gốc. Không cần tạo `.env` hay `.env.local` trong từng workspace. Biến môi trường đã được đặt trong shell hoặc hệ thống triển khai được ưu tiên hơn giá trị trong file.

## Chạy dự án

```powershell
npm run dev
```

Hoặc chạy riêng từng ứng dụng:

```powershell
npm run dev:web
npm run dev:api
npm run dev:ai
```

Khởi động lại ứng dụng sau khi thay đổi `.env`. Với bản production, cần build lại web khi thay đổi biến `NEXT_PUBLIC_`.

`apps/web/next-env.d.ts` là file khai báo kiểu do Next.js tạo, không phải file cấu hình môi trường.

Chatbot dùng Python 3.11 trở lên, `OPENAI_API_KEY` và `DATABASE_URL` trong `.env` gốc. `npm run dev` chạy cả web, API và dịch vụ AI. Khi chạy từng ứng dụng, chạy thêm `npm run dev:ai` để NestJS chuyển yêu cầu chat vào FastAPI. Dùng `AI_INTERNAL_URL` nếu hai dịch vụ chạy khác máy. Có thể chạy `npm run ai:index` để tạo sẵn chỉ mục FAISS từ tour JourniTrip. Chatbot cũng tự làm mới chỉ mục trong nền và dùng dữ liệu PostgreSQL khi chỉ mục chưa sẵn sàng.
