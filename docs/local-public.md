# Chạy đồng thời local và public

Chạy ứng dụng bằng `npm run dev` từ thư mục gốc. Web dùng cổng 3000,
API dùng cổng 4000. Tunnel Cloudflare phải chạy trên cùng máy với ứng dụng.

| Dịch vụ | Địa chỉ local | Địa chỉ public | Service URL trong tunnel `myweb` |
| --- | --- | --- | --- |
| Web | http://localhost:3000 | https://nhutthanh.id.vn | http://127.0.0.1:3000 |
| API và chat WebSocket | http://localhost:4000 | https://api.nhutthanh.id.vn | http://127.0.0.1:4000 |
| AI (chưa triển khai server) | http://localhost:8000 | https://ai.nhutthanh.id.vn | http://127.0.0.1:8000 khi có server |

## Cấu hình Cloudflare

Các bản ghi DNS trong ảnh đã trỏ tới tunnel `myweb`. Cổng đích được cấu hình
ở tuyến ứng dụng của tunnel, không phải ở bản ghi DNS.

Trong Cloudflare, vào **Networking / Networks → Tunnels → myweb →
Published application routes / Public Hostnames**. Sửa từng hostname theo
bảng trên, chọn loại **HTTP**, nhập `127.0.0.1:3000` cho web và
`127.0.0.1:4000` cho API, để trống Path rồi lưu. Không bật HTTPS cho kết nối
nội bộ này; người truy cập public vẫn dùng HTTPS do Cloudflare cung cấp.

Giữ connector của `myweb` chạy trên máy này và kiểm tra trạng thái **Healthy**.
`apps/ai/main.py` hiện chỉ in thông báo, chưa lắng nghe cổng 8000; vì vậy
hostname AI chưa phục vụ được request dù đã có bản ghi DNS.

Tham khảo: [Cloudflare Tunnel routing](https://developers.cloudflare.com/tunnel/concepts/routing/).

## Biến môi trường

Trong `apps/web/.env` (hoặc `.env.local`):

```dotenv
API_INTERNAL_URL=http://127.0.0.1:4000
```

Mọi trình duyệt gọi `/api` trên cùng origin với trang đang mở:

- Local: `http://localhost:3000/api/auth/login`.
- Public/điện thoại: `https://nhutthanh.id.vn/api/auth/login`.
- Next.js chuyển tiếp `/api/*` tới `API_INTERNAL_URL`, bỏ tiền tố `/api`.
- Chat dùng namespace `/chat`, WebSocket path `/api/socket.io` qua cùng proxy.

Đường WebSocket phía trình duyệt không thêm dấu `/` cuối để tránh redirect của
Next.js; rewrite riêng chuyển tiếp tới `/socket.io/` mà Engine.IO yêu cầu.

Frontend không cần điện thoại phân giải/kết nối riêng hostname `api.nhutthanh.id.vn`.
Hostname API vẫn dùng được để gọi trực tiếp và làm callback thanh toán.
Các biến `NEXT_PUBLIC_API_BASE` / `NEXT_PUBLIC_API_LOCAL_BASE` cũ không còn được
frontend sử dụng. Server rendering luôn gọi API nội bộ.

Proxy dùng [Next.js rewrites](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/rewrites).

Trong `.env` ở gốc:

```dotenv
API_HOST=127.0.0.1
API_PORT=4000
API_PUBLIC_URL=https://api.nhutthanh.id.vn
FRONTEND_PUBLIC_URL=https://nhutthanh.id.vn
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://nhutthanh.id.vn,https://www.nhutthanh.id.vn
```

HTTP API và chat dùng cùng danh sách CORS, gồm các origin local và public.
Next.js đã cho phép hostname public truy cập tài nguyên dev qua
[`allowedDevOrigins`](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins).

Dừng và chạy lại web/API sau khi đổi `.env`; bản production cần build lại web
để cập nhật cấu hình rewrites. Các biến trong `.env.local` hoặc môi
trường của tiến trình có độ ưu tiên cao hơn `.env`.

## Đăng nhập Google và thanh toán

Nếu dùng Google Login, thêm cả `http://localhost:3000` và
`https://nhutthanh.id.vn` vào **Authorized JavaScript origins** của OAuth
client đang dùng. Cấu hình ứng dụng không tự cập nhật Google Cloud Console.

VNPay tiếp tục nhận callback ở API public và chuyển về web public theo
`API_PUBLIC_URL` / `FRONTEND_PUBLIC_URL`, kể cả khi bắt đầu thanh toán ở local.
Phiên đăng nhập local và public được lưu riêng theo origin của trình duyệt.
