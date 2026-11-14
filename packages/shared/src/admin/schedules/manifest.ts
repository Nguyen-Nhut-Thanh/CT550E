export interface ManifestTraveler {
  traveler_id: number;
  full_name: string;
  gender: string;
  dob?: string | null;
  id_number?: string | null;
  traveler_type: string;
  phone?: string | null;
}

export interface ManifestBookingGroup {
  booking_id: number;
  status: string;
  total_amount?: number | string | null;
  created_at: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  note?: string | null;
  pickup_snapshot?: {
    name?: string;
    address?: string;
    pickup_at?: string;
    note?: string | null;
  } | null;
  departure_name?: string | null;
  adult_count: number;
  child_count: number;
  infant_count: number;
  holding_expires_at?: string;
  is_holding_expired?: boolean;
  travelers: ManifestTraveler[];
  payment?: {
    status?: string | null;
    method?: string | null;
    amount?: number | string;
    transaction_code?: string | null;
  } | null;
}

export interface ScheduleManifestResponse {
  schedule: {
    tour_schedule_id: number;
    code?: string | null;
    start_date: string;
    end_date: string;
    quota: number;
    booked_count: number;
    departure_location?: {
      location_id: number;
      name: string;
    } | null;
    tour?: {
      tour_id: number;
      name: string;
      code?: string | null;
      duration_days?: number | null;
      duration_nights?: number | null;
    } | null;
  };
  summary: {
    total_bookings: number;
    total_travelers: number;
    adult_count: number;
    child_count: number;
    infant_count: number;
    paid_count: number;
    pending_count: number;
  };
  bookings: ManifestBookingGroup[];
}

export interface BookingCancellationInfo {
  type:
    | "expired_15m"
    | "expired_departure"
    | "customer_request_approved"
    | "admin_cancelled"
    | "staff_cancelled_pending"
    | "customer_cancelled_pending"
    | "unknown";
  title: string;
  actor: "Hệ thống tự động" | "Khách hàng" | "Ban quản trị / Nhân viên" | "Hệ thống";
  reason: string;
  time?: string;
  refundAmount?: string;
  note?: string;
}

export interface ParsedBookingNote {
  /** Ghi chú thực tế của khách hàng (sau khi đã tách các tag hệ thống) */
  customerNote: string;
  /** Loại phòng: "PHÒNG ĐƠN" | "GHÉP PHÒNG" hoặc undefined */
  roomType?: string;
  /** Phụ thu phòng đơn: "0đ", "250,000đ"... */
  roomSurcharge?: string;
  /** CCCD người liên hệ nếu được lưu trong note */
  contactIdCard?: string;
  /** Thông tin hủy chi tiết (lý do, người hủy, thời gian, tiền hoàn) */
  cancellation?: BookingCancellationInfo;
  /** Thông tin hủy nếu có (lý do hủy, thời gian hủy) */
  cancellationReason?: string;
  cancellationTime?: string;
  /** Chi tiết yêu cầu hủy & hoàn tiền của khách */
  cancelRequest?: {
    reason?: string;
    daysRemaining?: string;
    tierPenalty?: string;
    totalPaid?: string;
    penaltyAmount?: string;
    refundEstimated?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    requestedAt?: string;
    numericRefundAmount?: number;
  };
  /** Thông tin duyệt hủy từ Admin nếu có */
  adminApproval?: {
    note?: string;
    refundAmount?: string;
  };
  /** Thông tin từ chối hủy từ Admin nếu có */
  adminRejection?: {
    note?: string;
  };
  /** Thông tin Admin chủ động hủy đơn nếu có */
  adminAction?: {
    reason?: string;
    note?: string;
    refundAmount?: string;
    time?: string;
  };
}

export function parseBookingNote(rawNote?: string | null): ParsedBookingNote {
  if (!rawNote || !rawNote.trim()) {
    return { customerNote: "" };
  }

  const text = rawNote.trim();

  // 1. Tách thông tin phòng [ROOM_SELECTION]
  let roomType: string | undefined;
  let roomSurcharge: string | undefined;
  const roomMatch = text.match(
    /\[ROOM_SELECTION\]\s*Loại phòng:\s*([^\n\r]+)(?:[\n\r]+\s*Phụ thu phòng đơn:\s*([^\n\r]+))?/i,
  );
  if (roomMatch) {
    roomType = roomMatch[1]?.trim();
    roomSurcharge = roomMatch[2]?.trim();
  }

  // 2. Tách CCCD liên hệ nếu có
  let contactIdCard: string | undefined;
  const cccdMatch = text.match(/\[CCCD_LIEN_HE\]:\s*([^\n\r]+)/i);
  if (cccdMatch) {
    contactIdCard = cccdMatch[1]?.trim();
  }

  // 3. Tách chi tiết yêu cầu hủy [CUSTOMER_CANCEL_REQUEST] nếu có
  let cancelRequest: ParsedBookingNote["cancelRequest"];
  const cancelReqMatch = text.match(
    /\[CUSTOMER_CANCEL_REQUEST\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (cancelReqMatch) {
    const block = cancelReqMatch[1];
    const reason = block.match(/L[ýy]\s*do:\s*([^\n\r]+)/i)?.[1]?.trim();
    const daysRemaining = block
      .match(/S[ốo]\s*ng[àa]y\s*tr[ưu][ớo]c\s*kh[ởo]i\s*h[àa]nh:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const tierPenalty = block
      .match(
        /M[ứu]c\s*ph[ạa]t\s*h[ủu]y\s*theo\s*quy\s*[đd][ịi]nh:\s*([^\n\r]+)/i,
      )?.[1]
      ?.trim();
    const totalPaid = block
      .match(/S[ốo]\s*ti[ềe]n\s*[đd][aã]\s*thanh\s*to[áa]n:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const penaltyAmount = block
      .match(/Ph[íi]\s*ph[ạa]t\s*h[ủu]y:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const refundEstimated = block
      .match(/S[ốo]\s*ti[ềe]n\s*ho[àa]n\s*d[ựu]\s*ki[ếe]n:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const bankName = block
      .match(/-\s*Ng[âa]n\s*h[àa]ng:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const bankAccountNumber = block
      .match(/-\s*S[ốo]\s*t[àa]i\s*kho[ảa]n:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const bankAccountName = block
      .match(/-\s*Ch[ủu]\s*t[àa]i\s*kho[ảa]n:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    const requestedAt = block
      .match(/Th[ờo]i\s*gian\s*(?:g[ửu]i\s*y[êe]u\s*c[ầa]u|h[ủu]y):\s*([^\n\r]+)/i)?.[1]
      ?.trim();

    let numericRefundAmount: number | undefined;
    if (refundEstimated) {
      const digits = refundEstimated.replace(/[^\d]/g, "");
      if (digits) numericRefundAmount = Number(digits);
    }

    cancelRequest = {
      reason,
      daysRemaining,
      tierPenalty,
      totalPaid,
      penaltyAmount,
      refundEstimated,
      bankName,
      bankAccountNumber,
      bankAccountName,
      requestedAt,
      numericRefundAmount,
    };
  }

  // 4. Tách thông tin duyệt hủy [ADMIN_CANCEL_APPROVED] nếu có
  let adminApproval: ParsedBookingNote["adminApproval"];
  const approvedMatch = text.match(
    /\[ADMIN_CANCEL_APPROVED\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (approvedMatch) {
    const block = approvedMatch[1];
    const note = block.match(/Ghi\s*ch[úu]:\s*([^\n\r]+)/i)?.[1]?.trim();
    const refundAmount = block
      .match(/S[ốo]\s*ti[ềe]n\s*ho[àa]n\s*d[ựu]\s*ki[ếe]n:\s*([^\n\r]+)/i)?.[1]
      ?.trim();
    adminApproval = { note, refundAmount };
  }

  // 5. Tách thông tin từ chối [ADMIN_CANCEL_REJECTED] nếu có
  let adminRejection: ParsedBookingNote["adminRejection"];
  const rejectedMatch = text.match(
    /\[ADMIN_CANCEL_REJECTED\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (rejectedMatch) {
    const block = rejectedMatch[1];
    const note = block.match(/Ghi\s*ch[úu]:\s*([^\n\r]+)/i)?.[1]?.trim();
    adminRejection = { note };
  }

  // 6. Tách thông tin Admin chủ động hủy đơn [ADMIN_CANCEL_ACTION] nếu có
  let adminAction: ParsedBookingNote["adminAction"];
  const adminActionMatch = text.match(
    /\[ADMIN_CANCEL_ACTION\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (adminActionMatch) {
    const block = adminActionMatch[1];
    const reason = block.match(/L[ýy]\s*do\s*h[ủu]y:\s*([^\n\r]+)/i)?.[1]?.trim();
    const note = block.match(/Ghi\s*ch[úu]:\s*([^\n\r]+)/i)?.[1]?.trim();
    const refundAmount = block.match(/S[ốo]\s*ti[ềe]n\s*ho[àa]n:\s*([^\n\r]+)/i)?.[1]?.trim();
    const time = block.match(/Th[ờo]i\s*gian\s*h[ủu]y:\s*([^\n\r]+)/i)?.[1]?.trim();
    adminAction = { reason, note, refundAmount, time };
  }

  // 6.5. Tách thông tin Nhân viên hủy đơn giữ chỗ [STAFF_CANCELLED_PENDING]
  let staffCancelledPending: { reason?: string; time?: string } | undefined;
  const staffPendingMatch = text.match(
    /\[STAFF_CANCELLED_PENDING\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (staffPendingMatch) {
    const block = staffPendingMatch[1];
    const reason = block.match(/L[ýy]\s*do:\s*([^\n\r]+)/i)?.[1]?.trim();
    const time = block.match(/Th[ờo]i\s*gian:\s*([^\n\r]+)/i)?.[1]?.trim();
    staffCancelledPending = { reason, time };
  }

  // 6.6. Tách thông tin Khách tự hủy đơn giữ chỗ [CUSTOMER_CANCELLED_PENDING]
  let customerCancelledPending: { reason?: string; time?: string } | undefined;
  const customerPendingMatch = text.match(
    /\[CUSTOMER_CANCELLED_PENDING\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
  );
  if (customerPendingMatch) {
    const block = customerPendingMatch[1];
    const reason = block.match(/L[ýy]\s*do:\s*([^\n\r]+)/i)?.[1]?.trim();
    const time = block.match(/Th[ờo]i\s*gian(?:\s*h[ủu]y)?:\s*([^\n\r]+)/i)?.[1]?.trim();
    customerCancelledPending = { reason, time };
  }

  // 7. Xây dựng đối tượng cancellation có đầy đủ lý do, ai hủy, thời gian và số tiền hoàn
  let cancellation: BookingCancellationInfo | undefined;

  if (text.includes("[AUTO_CANCELLED_EXPIRED_15M]")) {
    cancellation = {
      type: "expired_15m",
      title: "Hủy tự động do hết hạn thanh toán (quá 15 phút)",
      actor: "Hệ thống tự động",
      reason: "Đơn đặt tour đã vượt quá thời hạn thanh toán 15 phút. Hệ thống tự động hủy đơn.",
    };
  } else if (text.includes("[AUTO_CANCELLED_DEPARTED]")) {
    cancellation = {
      type: "expired_departure",
      title: "Hủy tự động do tour đã đến thời gian khởi hành",
      actor: "Hệ thống tự động",
      reason: "Tour đã đến/qua ngày khởi hành mà đơn chưa hoàn tất thanh toán. Hệ thống tự động hủy đơn.",
    };
  } else if (approvedMatch) {
    cancellation = {
      type: "customer_request_approved",
      title: "Hủy theo yêu cầu của khách hàng (Ban quản trị đã duyệt)",
      actor: "Khách hàng",
      reason: cancelRequest?.reason
        ? `Khách hàng yêu cầu hủy vì lý do: "${cancelRequest.reason}"`
        : "Khách hàng gửi yêu cầu hủy và đã được Ban quản trị phê duyệt",
      time: cancelRequest?.requestedAt,
      refundAmount: adminApproval?.refundAmount || cancelRequest?.refundEstimated,
      note: adminApproval?.note,
    };
  } else if (adminActionMatch) {
    cancellation = {
      type: "admin_cancelled",
      title: "Hủy bởi Ban quản trị / Bộ phận điều hành",
      actor: "Ban quản trị / Nhân viên",
      reason: adminAction?.reason || "Ban quản trị hủy đơn booking theo yêu cầu vận hành",
      time: adminAction?.time,
      refundAmount: adminAction?.refundAmount,
      note: adminAction?.note,
    };
  } else if (staffCancelledPending) {
    cancellation = {
      type: "staff_cancelled_pending",
      title: "Hủy đơn giữ chỗ bởi Nhân viên điều hành",
      actor: "Ban quản trị / Nhân viên",
      reason: staffCancelledPending.reason || "Nhân viên hủy do khách xác nhận không tham gia / quá hạn giữ chỗ",
      time: staffCancelledPending.time,
    };
  } else if (customerCancelledPending) {
    cancellation = {
      type: "customer_cancelled_pending",
      title: "Khách hàng chủ động hủy giữ chỗ",
      actor: "Khách hàng",
      reason: customerCancelledPending.reason || "Khách hàng chủ động hủy đơn giữ chỗ",
      time: customerCancelledPending.time,
    };
  }

  // Fallback lý do & thời gian hủy chung
  let cancellationReason = cancellation?.reason || cancelRequest?.reason || adminAction?.reason;
  let cancellationTime = cancellation?.time || cancelRequest?.requestedAt || adminAction?.time;

  if (!cancellationReason) {
    const reasonMatch = text.match(/L[ýy]\s*do(?:\s*h[ủu]y)?:\s*([^\n\r]+)/i);
    if (reasonMatch) {
      cancellationReason = reasonMatch[1]?.trim();
    }
  }
  if (!cancellationTime) {
    const timeMatch = text.match(
      /Th[ờo]i\s*gian\s*(?:h[ủu]y|g[ửu]i\s*y[êe]u\s*c[ầa]u|duy[eệ]t):\s*([^\n\r]+)/i,
    );
    if (timeMatch) {
      cancellationTime = timeMatch[1]?.trim();
    }
  }

  if (!cancellation && cancellationReason) {
    cancellation = {
      type: "unknown",
      title: "Đơn đặt tour đã bị hủy",
      actor: "Hệ thống",
      reason: cancellationReason,
      time: cancellationTime,
    };
  }

  // 8. Loại bỏ hoàn toàn tất cả các khối tag hệ thống kỹ thuật
  const customerNote = text
    .replace(
      /\[(?:ROOM_SELECTION|CCCD_LIEN_HE|CUSTOMER_CANCELLED_PENDING|CUSTOMER_CANCEL_REQUEST|ADMIN_CANCEL_ACTION|ADMIN_CANCEL_APPROVED|ADMIN_CANCEL_REJECTED|AUTO_CANCELLED_EXPIRED_15M|AUTO_CANCELLED_DEPARTED|STAFF_CANCELLED_PENDING)\][\s\S]*?(?=(?:\r?\n)+\s*\[|$)/gi,
      "",
    )
    .replace(/\[CCCD_LIEN_HE\]:[^\n\r]*/gi, "")
    // Xóa bất kỳ tag dạng [ABC_XYZ] đơn lập còn sót lại
    .replace(/\[[A-Z0-9_]+\]/g, "")
    // Xóa các câu giải thích hệ thống
    .replace(/Hệ thống tự động hủy[^\n\r]*/gi, "")
    // Xóa các dòng key-value hệ thống nếu có lọt ra ngoài tag
    .replace(
      /(?:^|\n)\s*(?:Lý do|Thời gian hủy|Số ngày trước khởi hành|Mức phạt hủy|Số tiền đã thanh toán|Phí phạt hủy|Số tiền hoàn dự kiến|Số tiền hoàn|Thông tin nhận tiền hoàn|Ngân hàng|Số tài khoản|Chủ tài khoản|Loại phòng|Phụ thu phòng đơn|Ghi chú):[^\n\r]*/gi,
      "",
    )
    .replace(/(?:\r?\n){3,}/g, "\n\n")
    .trim();

  return {
    customerNote,
    roomType,
    roomSurcharge,
    contactIdCard,
    cancellation,
    cancellationReason,
    cancellationTime,
    cancelRequest,
    adminApproval,
    adminRejection,
    adminAction,
  };
}

