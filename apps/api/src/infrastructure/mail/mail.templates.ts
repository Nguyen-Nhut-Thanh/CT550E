export function formatCurrency(value: number | string) {
    return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}
export function formatDate(value?: string | Date | null) {
    if (!value || Number.isNaN(new Date(value).getTime()))
        return 'Chưa cập nhật';
    return new Date(value).toLocaleDateString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}
export function formatDateTime(value?: string | Date | null) {
    if (!value || Number.isNaN(new Date(value).getTime()))
        return 'Chưa cập nhật';
    return new Date(value).toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function renderLayout(title: string, intro: string, body: string, footer?: string) {
    return `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6; max-width: 640px; margin: 0 auto; padding: 24px;">
        <div style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
          <div style="padding: 24px 24px 8px;">
            <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b;">
              JourniTrip
            </p>
            <h2 style="margin: 0 0 12px; font-size: 24px; color: #0f172a;">${title}</h2>
            <p style="margin: 0; color: #334155;">${intro}</p>
          </div>
          <div style="padding: 16px 24px 8px;">${body}</div>
          <div style="padding: 8px 24px 24px; color: #475569; font-size: 14px;">
            <p style="margin: 0;">
              ${footer || 'Nếu cần hỗ trợ thêm, vui lòng phản hồi email này hoặc liên hệ đội ngũ JourniTrip.'}
            </p>
          </div>
        </div>
      </div>
    `;
}
export function renderInfoCard(lines: Array<[
    label: string,
    value: string
]>, tone: 'neutral' | 'success' | 'warning' = 'neutral') {
    const theme = tone === 'success'
        ? { background: '#f0fdf4', border: '#bbf7d0' }
        : tone === 'warning'
            ? { background: '#fff7ed', border: '#fdba74' }
            : { background: '#f8fafc', border: '#e2e8f0' };
    return `
      <div style="background: ${theme.background}; border: 1px solid ${theme.border}; border-radius: 12px; padding: 16px; margin: 0 0 16px;">
        ${lines
        .map(([label, value]) => `
              <p style="margin: 0 0 8px;">
                <strong>${label}:</strong> ${value}
              </p>
            `)
        .join('')}
      </div>
    `;
}

export interface ReceiptEmailTraveler {
    fullName: string;
    dob?: string | Date | null;
    gender?: string | null;
    idNumber?: string | null;
}

export interface ReceiptEmailExtraService {
    id?: number | string;
    name: string;
    quantity: number;
    unit_price: number | string;
    amount: number | string;
}

export function renderReceiptEmailHtml(params: {
    contactName: string;
    contactPhone?: string;
    contactEmail?: string;
    bookingId: number;
    tourName: string;
    tourCode?: string;
    startDate?: string | Date | null;
    duration?: string;
    departureName?: string;
    totalAmount: number | string;
    subtotal?: number | string;
    discountAmount?: number | string;
    servicesTotal?: number | string;
    surcharge?: number | string;
    method?: string;
    transactionCode?: string;
    paidAt?: string | Date | null;
    adultCount?: number;
    adultPrice?: number | string;
    childCount?: number;
    childPrice?: number | string;
    infantCount?: number;
    infantPrice?: number | string;
    voucherCode?: string;
    roomType?: string;
    pickupName?: string;
    pickupAddress?: string;
    travelers?: ReceiptEmailTraveler[];
    extraServices?: ReceiptEmailExtraService[];
    appUrl?: string;
}) {
    const appUrl = params.appUrl || process.env.APP_URL || process.env.FRONTEND_PUBLIC_URL || 'http://localhost:3000';
    const bookingUrl = `${appUrl}/booking/${params.bookingId}`;
    const paidDate = params.paidAt ? formatDateTime(params.paidAt) : formatDateTime(new Date());
    const transactionCode = params.transactionCode || `BK${String(params.bookingId).padStart(6, '0')}`;
    const paymentMethod = params.method || 'VNPay';

    const adultCount = Number(params.adultCount) || 1;
    const adultPrice = Number(params.adultPrice) || 0;
    const childCount = Number(params.childCount) || 0;
    const childPrice = Number(params.childPrice) || 0;
    const infantCount = Number(params.infantCount) || 0;
    const infantPrice = Number(params.infantPrice) || 0;

    const rows = [
        { label: 'Người lớn', quantity: adultCount, price: adultPrice },
        { label: 'Trẻ em', quantity: childCount, price: childPrice },
        { label: 'Em bé', quantity: infantCount, price: infantPrice },
    ];
    const tickets = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
    const discount = Number(params.discountAmount) || 0;
    const services = Number(params.servicesTotal) || 0;
    const totalAmount = Number(params.totalAmount) || 0;

    const surcharge = params.surcharge !== undefined
        ? Number(params.surcharge)
        : Math.max(0, Math.round((totalAmount + discount - tickets - services) * 100) / 100);

    const subtotal = params.subtotal !== undefined
        ? Number(params.subtotal)
        : (tickets + services + surcharge);

    const extras = Array.isArray(params.extraServices) ? params.extraServices : [];

    let pickupDisplay = 'Điểm đón mặc định của đoàn';
    if (params.pickupAddress && params.pickupName) {
        pickupDisplay = `${params.pickupName} — ${params.pickupAddress}`;
    } else if (params.pickupName) {
        pickupDisplay = params.pickupName;
    } else if (params.pickupAddress) {
        pickupDisplay = params.pickupAddress;
    }

    const travelerRows = params.travelers && params.travelers.length > 0
        ? params.travelers.map(t => {
            const genderLabel = { male: 'Nam', female: 'Nữ', other: 'Khác' }[t.gender?.toLowerCase() || ''] || t.gender || '—';
            const dobFormatted = t.dob ? formatDate(t.dob) : '—';
            const idNumber = t.idNumber || '—';
            return `
                <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; font-weight: 600; color: #1e293b;">${t.fullName}</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">${dobFormatted}</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">${genderLabel}</td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">${idNumber}</td>
                </tr>
            `;
        }).join('')
        : `
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; font-weight: 600; color: #1e293b;">${params.contactName}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">—</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">—</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #475569;">—</td>
            </tr>
        `;

    const pricingRowsHtml = [
        ...rows.map(row => `
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #1e293b; font-weight: 500;">${row.label}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: center; color: #475569;">${row.quantity}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; color: #475569;">${formatCurrency(row.price)}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(row.quantity * row.price)}</td>
            </tr>
        `),
        ...extras.map((item, index) => `
            <tr key="${item.id || index}">
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #1e293b; font-weight: 500;">${item.name}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: center; color: #475569;">${item.quantity}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; color: #475569;">${formatCurrency(item.unit_price)}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(item.amount)}</td>
            </tr>
        `),
        ...(services > 0 && !extras.length ? [`
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #1e293b; font-weight: 500;">Dịch vụ bổ sung</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: center; color: #475569;">1</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; color: #475569;">${formatCurrency(services)}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(services)}</td>
            </tr>
        `] : []),
        ...(surcharge > 0 ? [`
            <tr>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; color: #1e293b; font-weight: 500;">Phụ thu phòng đơn</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: center; color: #475569;">1</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; color: #475569;">${formatCurrency(surcharge)}</td>
                <td style="padding: 10px 14px; border-bottom: 1px solid #edf4fc; text-align: right; font-weight: bold; color: #0f172a;">${formatCurrency(surcharge)}</td>
            </tr>
        `] : []),
    ].join('');

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f294d; line-height: 1.5; max-width: 680px; margin: 0 auto; padding: 20px 10px; background-color: #f8fafc;">
        <div style="border: 2px solid #cfe2fe; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 16px rgba(0, 53, 128, 0.06);">
          <!-- HEADER CHÍNH -->
          <div style="padding: 24px 24px 18px; border-bottom: 1px solid #edf2f7;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top; text-align: left;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #003580; text-transform: uppercase; letter-spacing: -0.5px;">JOURNITRIP</h1>
                  <p style="margin: 3px 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Khám phá thế giới cùng bạn</p>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #003580; text-transform: uppercase;">BIÊN LAI THANH TOÁN</h2>
                  <p style="margin: 3px 0 0; font-size: 12px; color: #64748b; font-weight: 500;">Xác nhận booking đã thanh toán thành công</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- DÒNG TÓM TẮT TRẠNG THÁI & GIAO DỊCH (4 CỘT) -->
          <div style="margin: 16px 24px; padding: 14px 16px; background-color: #f0f7ff; border: 1px solid #cfe2fe; border-radius: 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block;">TRẠNG THÁI</span>
                  <span style="font-size: 12px; font-weight: bold; color: #15803d; margin-top: 4px; display: block;">● ĐÃ THANH TOÁN</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block;">PHƯƠNG THỨC</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 4px; display: block;">${paymentMethod}</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block;">MÃ GIAO DỊCH</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 4px; display: block;">${transactionCode}</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block;">NGÀY ĐẶT / THANH TOÁN</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 4px; display: block;">${paidDate}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- THÔNG TIN NGƯỜI ĐẶT & THÔNG TIN TOUR (2 CỘT CÓ VIỀN) -->
          <div style="margin: 0 24px 16px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; border-right: 1px solid #cfe2fe;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580;">THÔNG TIN NGƯỜI ĐẶT TOUR</p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Họ và tên:</strong> <span style="font-weight: bold; color: #0f172a;">${params.contactName}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Số điện thoại:</strong> <span style="color: #1e293b;">${params.contactPhone || '—'}</span></p>
                  <p style="margin: 0;"><strong style="color: #475569; font-weight: 600;">Email:</strong> <span style="color: #1e293b;">${params.contactEmail || '—'}</span></p>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580;">THÔNG TIN TOUR</p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Tên tour:</strong> <span style="font-weight: bold; color: #0f172a;">${params.tourName}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Mã tour:</strong> <span style="color: #1e293b;">${params.tourCode || 'Chưa cập nhật'}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Ngày khởi hành:</strong> <span style="color: #1e293b;">${formatDate(params.startDate)}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Thời gian:</strong> <span style="color: #1e293b;">${params.duration || 'Chưa cập nhật'}</span></p>
                  <p style="margin: 0;"><strong style="color: #475569; font-weight: 600;">Điểm khởi hành:</strong> <span style="color: #1e293b;">${params.departureName || 'Chưa cập nhật'}</span></p>
                </td>
              </tr>
            </table>
          </div>

          <!-- THÔNG TIN HÀNH KHÁCH -->
          <div style="margin: 0 24px 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580;">THÔNG TIN HÀNH KHÁCH</p>
            <div style="border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f0f7ff; color: #003580; text-align: left;">
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Họ tên</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Ngày sinh</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Giới tính</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Giấy tờ</th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffffff;">
                  ${travelerRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- CHI TIẾT THANH TOÁN -->
          <div style="margin: 0 24px 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580;">CHI TIẾT THANH TOÁN</p>
            <div style="border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px;">
                <thead>
                  <tr style="background-color: #f0f7ff; color: #003580; text-align: left;">
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Hạng mục</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-align: center;">Số lượng</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Đơn giá</th>
                    <th style="padding: 10px 14px; border-bottom: 1px solid #cfe2fe; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; text-align: right;">Thành tiền</th>
                  </tr>
                </thead>
                <tbody style="background-color: #ffffff;">
                  ${pricingRowsHtml}
                </tbody>
              </table>
            </div>
          </div>

          <!-- THÔNG TIN BỔ SUNG & TỔNG KẾT (2 CỘT CÓ VIỀN) -->
          <div style="margin: 0 24px 20px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px; line-height: 1.6;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; border-right: 1px solid #cfe2fe; background-color: #ffffff;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580;">THÔNG TIN BỔ SUNG</p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Voucher:</strong> <span style="color: #1e293b;">${params.voucherCode || 'Không áp dụng'}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Loại phòng:</strong> <span style="color: #1e293b;">${params.roomType || 'Ghép phòng theo tiêu chuẩn đoàn'}</span></p>
                  <p style="margin: 0 0 5px;"><strong style="color: #475569; font-weight: 600;">Phụ thu phòng đơn:</strong> <span style="color: #1e293b;">${formatCurrency(surcharge)}</span></p>
                  <p style="margin: 0;"><strong style="color: #475569; font-weight: 600;">Điểm đón:</strong> <span style="color: #1e293b;">${pickupDisplay}</span></p>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; background-color: #f0f7ff; text-align: right;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; color: #003580; text-align: right;">TỔNG KẾT</p>
                  <div style="margin-bottom: 5px; font-size: 12px; color: #64748b;">
                    <span>Tạm tính: </span>
                    <strong style="color: #0f172a; font-weight: bold;">${formatCurrency(subtotal)}</strong>
                  </div>
                  <div style="margin-bottom: 8px; font-size: 12px; color: ${discount > 0 ? '#e11d48' : '#64748b'};">
                    <span>Giảm giá: </span>
                    <strong style="font-weight: 600; color: ${discount > 0 ? '#e11d48' : '#64748b'};">${discount > 0 ? `-${formatCurrency(discount)}` : '0 đ'}</strong>
                  </div>
                  <div style="border-top: 1px solid #cfe2fe; padding-top: 8px; margin-top: 8px;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; display: block;">TỔNG THANH TOÁN</span>
                    <span style="font-size: 22px; font-weight: 900; color: #0284c7; display: block; margin-top: 2px;">${formatCurrency(totalAmount)}</span>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- NÚT TRUY CẬP ĐƠN ĐẶT TOUR -->
          <div style="margin: 0 24px 20px; text-align: center;">
            <a href="${bookingUrl}" style="display: inline-block; background-color: #0064ff; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0, 100, 255, 0.25);">
              Xem chi tiết booking trực tuyến
            </a>
          </div>

          <!-- FOOTER & LỜI CẢM ƠN -->
          <div style="padding: 16px 24px; border-top: 1px solid #edf2f7; text-align: center; color: #64748b; font-size: 11px;">
            <p style="margin: 0 0 4px; font-weight: 900; color: #003580; text-transform: uppercase; letter-spacing: 0.05em;">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH CÙNG JOURNITRIP!</p>
            <p style="margin: 0 0 6px; line-height: 1.5;">Biên lai này xác nhận JourniTrip đã ghi nhận khoản thanh toán cho booking trên. Vui lòng lưu email này để đối chiếu khi cần hỗ trợ.</p>
            <p style="margin: 0; font-style: italic; font-size: 10px; color: #94a3b8;">Lưu ý: Đây là biên lai xác nhận thanh toán, không thay thế hóa đơn giá trị gia tăng (VAT).</p>
          </div>
        </div>
      </div>
    `;
}

export function renderRefundStatementEmailHtml(params: {
    contactName: string;
    bookingId: number;
    tourName: string;
    tourCode?: string;
    startDate?: string | Date | null;
    totalAmount: number | string;
    refundAmount: number | string;
    cancellationFee?: number | string;
    reason?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    note?: string;
    appUrl?: string;
}) {
    const appUrl = params.appUrl || process.env.APP_URL || 'http://localhost:3000';
    const bookingUrl = `${appUrl}/booking/${params.bookingId}`;
    const fee = params.cancellationFee !== undefined
        ? Number(params.cancellationFee)
        : Math.max(0, Number(params.totalAmount) - Number(params.refundAmount));

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f294d; line-height: 1.5; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="border: 1px solid #fecdd3; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.05);">
          <!-- HEADER -->
          <div style="padding: 24px 24px 16px; border-bottom: 1px solid #edf2f7;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #003580; text-transform: uppercase; letter-spacing: -0.5px;">JOURNITRIP</h1>
                  <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Khám phá thế giới cùng bạn</p>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #e11d48; text-transform: uppercase;">BIÊN NHẬN HỦY TOUR & HOÀN TIỀN</h2>
                  <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">Xác nhận hủy booking và quyết toán hoàn tiền</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- TOP METADATA BAR -->
          <div style="margin: 16px 24px; padding: 14px 16px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">TRẠNG THÁI</span>
                  <span style="font-size: 12px; font-weight: bold; color: #e11d48; margin-top: 2px; display: block;">● ĐÃ HỦY TOUR</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">PHƯƠNG THỨC HOÀN</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">Chuyển khoản</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">MÃ BOOKING</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">#BK${String(params.bookingId).padStart(6, '0')}</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">NGÀY DUYỆT HỦY</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">${formatDateTime(new Date())}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- CHI TIẾT QUYẾT TOÁN HOÀN TIỀN -->
          <div style="margin: 0 24px 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">CHI TIẾT QUYẾT TOÁN HOÀN TIỀN</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
              <thead>
                <tr style="background: #f0f7ff; color: #003580; text-align: left;">
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase;">Hạng mục quyết toán</th>
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase; text-align: right;">Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7;">1. Tổng số tiền đã thanh toán</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">+${formatCurrency(params.totalAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; color: #e11d48;">2. Phí phạt hủy theo chính sách quy định</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold; color: #e11d48;">-${formatCurrency(fee)}</td>
                </tr>
                <tr style="background: #f0fdf4;">
                  <td style="padding: 12px 12px; font-weight: bold; color: #166534;">3. Số tiền thực hoàn trả cho bạn</td>
                  <td style="padding: 12px 12px; text-align: right; font-size: 16px; font-weight: 900; color: #16a34a;">=${formatCurrency(params.refundAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- THÔNG TIN NHẬN HOÀN TIỀN -->
          <div style="margin: 0 24px 20px; padding: 14px 16px; border: 1px solid #cfe2fe; border-radius: 12px; font-size: 12px; background: #ffffff;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">THÔNG TIN NHẬN TIỀN HOÀN</p>
            <p style="margin: 0 0 4px;"><strong>Tour đã đặt:</strong> ${params.tourName}</p>
            <p style="margin: 0 0 4px;"><strong>Lý do hủy:</strong> ${params.reason || 'Theo đề nghị của khách hàng'}</p>
            ${params.bankName ? `<p style="margin: 0 0 4px;"><strong>Ngân hàng nhận:</strong> ${params.bankName}</p>` : ''}
            ${params.bankAccountNumber ? `<p style="margin: 0 0 4px;"><strong>Số tài khoản:</strong> ${params.bankAccountNumber}</p>` : ''}
            ${params.bankAccountName ? `<p style="margin: 0 0 4px;"><strong>Chủ tài khoản:</strong> ${params.bankAccountName}</p>` : ''}
            <p style="margin: 6px 0 0; color: #64748b; font-size: 11px;">
              Tiền hoàn sẽ được bộ phận kế toán của JourniTrip giải ngân về tài khoản ngân hàng trên trong vòng 24 - 48 giờ làm việc.
            </p>
          </div>

          <!-- NÚT TRUY CẬP ĐƠN ĐẶT TOUR -->
          <div style="margin: 0 24px 20px; text-align: center;">
            <a href="${bookingUrl}" style="display: inline-block; background: #0064ff; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 12px 24px; border-radius: 10px;">
              Xem chi tiết booking trực tuyến
            </a>
          </div>

          <!-- FOOTER -->
          <div style="padding: 16px 24px; border-top: 1px solid #edf2f7; text-align: center; color: #64748b; font-size: 11px;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #003580; text-transform: uppercase;">CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH CÙNG JOURNITRIP!</p>
            <p style="margin: 0 0 6px;">JourniTrip rất tiếc vì chuyến đi chưa thể diễn ra như dự định. Chúng tôi hy vọng sẽ có cơ hội được phục vụ bạn trong những hành trình tiếp theo!</p>
            <p style="margin: 0; font-style: italic; font-size: 10px; color: #94a3b8;">Lưu ý: Biên nhận này xác nhận nghĩa vụ hoàn tiền theo thỏa thuận chính sách hủy tour.</p>
          </div>
        </div>
      </div>
    `;
}
