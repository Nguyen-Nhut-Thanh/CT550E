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
