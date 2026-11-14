export function formatCurrency(value: number | string) {
    return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}
export function formatDate(value?: string | Date | null) {
    if (!value)
        return 'Đang cập nhật';
    return new Date(value).toLocaleDateString('vi-VN');
}
export function formatDateTime(value?: string | Date | null) {
    if (!value)
        return 'Đang cập nhật';
    return new Date(value).toLocaleString('vi-VN');
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
    pickupName?: string;
    appUrl?: string;
}) {
    const appUrl = params.appUrl || process.env.APP_URL || 'http://localhost:3000';
    const bookingUrl = `${appUrl}/booking/${params.bookingId}`;
    const paidDate = params.paidAt ? formatDateTime(params.paidAt) : formatDateTime(new Date());

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #0f294d; line-height: 1.5; max-width: 650px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="border: 1px solid #cfe2fe; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 12px rgba(0, 53, 128, 0.05);">
          <!-- HEADER -->
          <div style="padding: 24px 24px 16px; border-bottom: 1px solid #edf2f7;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #003580; text-transform: uppercase; letter-spacing: -0.5px;">JOURNITRIP</h1>
                  <p style="margin: 2px 0 0; font-size: 12px; color: #64748b;">Khám phá thế giới cùng bạn</p>
                </td>
                <td style="vertical-align: top; text-align: right;">
                  <h2 style="margin: 0; font-size: 20px; font-weight: 900; color: #003580; text-transform: uppercase;">BIÊN LAI THANH TOÁN</h2>
                  <p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">Xác nhận booking đã thanh toán thành công</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- TOP METADATA BAR -->
          <div style="margin: 16px 24px; padding: 14px 16px; background: #f0f7ff; border: 1px solid #cfe2fe; border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">TRẠNG THÁI</span>
                  <span style="font-size: 12px; font-weight: bold; color: #15803d; margin-top: 2px; display: block;">● ĐÃ THANH TOÁN</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">PHƯƠNG THỨC</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">${params.method || 'VNPay'}</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">MÃ GIAO DỊCH</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">${params.transactionCode || `BK${String(params.bookingId).padStart(6, '0')}`}</span>
                </td>
                <td style="width: 25%; vertical-align: top;">
                  <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">NGÀY THANH TOÁN</span>
                  <span style="font-size: 12px; font-weight: bold; color: #0f172a; margin-top: 2px; display: block;">${paidDate}</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- THÔNG TIN NGƯỜI ĐẶT & THÔNG TIN TOUR -->
          <div style="margin: 0 24px 16px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; border-right: 1px solid #cfe2fe;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">THÔNG TIN NGƯỜI ĐẶT TOUR</p>
                  <p style="margin: 0 0 4px;"><strong>Họ và tên:</strong> ${params.contactName}</p>
                  <p style="margin: 0 0 4px;"><strong>Số điện thoại:</strong> ${params.contactPhone || '—'}</p>
                  <p style="margin: 0;"><strong>Email:</strong> ${params.contactEmail || '—'}</p>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">THÔNG TIN TOUR</p>
                  <p style="margin: 0 0 4px;"><strong>Tên tour:</strong> ${params.tourName}</p>
                  <p style="margin: 0 0 4px;"><strong>Mã tour:</strong> ${params.tourCode || '—'}</p>
                  <p style="margin: 0 0 4px;"><strong>Ngày khởi hành:</strong> ${formatDate(params.startDate)}</p>
                  <p style="margin: 0 0 4px;"><strong>Thời gian:</strong> ${params.duration || 'Theo lịch trình'}</p>
                  <p style="margin: 0;"><strong>Điểm khởi hành:</strong> ${params.departureName || 'Theo thông báo'}</p>
                </td>
              </tr>
            </table>
          </div>

          <!-- CHI TIẾT THANH TOÁN -->
          <div style="margin: 0 24px 16px;">
            <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">CHI TIẾT THANH TOÁN</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
              <thead>
                <tr style="background: #f0f7ff; color: #003580; text-align: left;">
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase;">Hạng mục</th>
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase; text-align: center;">Số lượng</th>
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase; text-align: right;">Đơn giá</th>
                  <th style="padding: 10px 12px; border-bottom: 1px solid #cfe2fe; font-size: 10px; text-transform: uppercase; text-align: right;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7;">Người lớn</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: center;">${params.adultCount || 1}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right;">${formatCurrency(params.adultPrice || params.totalAmount)}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">${formatCurrency(Number(params.adultPrice || params.totalAmount) * (params.adultCount || 1))}</td>
                </tr>
                ${params.childCount ? `
                <tr>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7;">Trẻ em</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: center;">${params.childCount}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right;">${formatCurrency(params.childPrice || 0)}</td>
                  <td style="padding: 10px 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: bold;">${formatCurrency(Number(params.childPrice || 0) * params.childCount)}</td>
                </tr>` : ''}
              </tbody>
            </table>
          </div>

          <!-- THÔNG TIN BỔ SUNG & TỔNG KẾT -->
          <div style="margin: 0 24px 20px; border: 1px solid #cfe2fe; border-radius: 12px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <tr>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; border-right: 1px solid #cfe2fe;">
                  <p style="margin: 0 0 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; color: #003580;">THÔNG TIN BỔ SUNG</p>
                  <p style="margin: 0 0 4px;"><strong>Voucher:</strong> ${params.voucherCode || 'Không áp dụng'}</p>
                  <p style="margin: 0 0 4px;"><strong>Loại phòng:</strong> Ghép phòng tiêu chuẩn</p>
                  <p style="margin: 0;"><strong>Điểm đón:</strong> ${params.pickupName || 'Điểm đón theo lịch trình'}</p>
                </td>
                <td style="width: 50%; vertical-align: top; padding: 14px 16px; background: #f0f7ff; text-align: right;">
                  <p style="margin: 0 0 4px; font-size: 12px; color: #64748b;">Tạm tính: <strong style="color: #0f172a;">${formatCurrency(params.subtotal || params.totalAmount)}</strong></p>
                  ${params.discountAmount ? `<p style="margin: 0 0 8px; font-size: 12px; color: #dc2626;">Giảm giá: -${formatCurrency(params.discountAmount)}</p>` : ''}
                  <div style="border-top: 1px solid #cfe2fe; padding-top: 8px; margin-top: 8px;">
                    <span style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #64748b; display: block;">TỔNG THANH TOÁN</span>
                    <span style="font-size: 22px; font-weight: 900; color: #0284c7; display: block; margin-top: 2px;">${formatCurrency(params.totalAmount)}</span>
                  </div>
                </td>
              </tr>
            </table>
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
            <p style="margin: 0 0 6px;">Biên lai này xác nhận JourniTrip đã ghi nhận khoản thanh toán cho booking trên. Vui lòng lưu email này để đối chiếu khi cần hỗ trợ.</p>
            <p style="margin: 0; font-style: italic; font-size: 10px; color: #94a3b8;">Lưu ý: Đây là biên lai xác nhận giao dịch điện tử, không thay thế hóa đơn giá trị gia tăng (VAT).</p>
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
