export interface BookingCancelRequestDetails {
  reason?: string;
  daysRemaining?: string;
  hoursRemaining?: string;
  tierPenalty?: string;
  totalPaid?: string;
  penaltyAmount?: string;
  refundEstimated?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  requestedAt?: string;
  numericRefundAmount?: number;
}

export interface BookingAdminApprovalDetails {
  note?: string;
  refundAmount?: string;
  approvedAt?: string;
}

export interface BookingAdminRejectionDetails {
  note?: string;
  rejectedAt?: string;
}

export interface BookingAdminActionDetails {
  cancelType?: "operator_fault" | "customer_request" | string;
  reason?: string;
  note?: string;
  refundAmount?: string;
  time?: string;
  cancelledAt?: string;
}

export interface BookingRescheduleDetails {
  oldScheduleId?: number;
  newScheduleId?: number;
  reason?: string;
  note?: string;
  rescheduledAt?: string;
}

export interface BookingResolutionProposal {
  proposedAt: string;
  reason: string;
  adminNote?: string;
  allowedOptions: ("full_refund" | "reschedule")[];
  suggestedScheduleId?: number;
  suggestedScheduleStartDate?: string;
  suggestedScheduleEndDate?: string;
  suggestedScheduleTitle?: string;
  priceDifference?: number; // >0: khách cần trả thêm; <0: hoàn lại tiền thừa cho khách; 0: bằng giá
  waiveDifference?: boolean; // Admin hỗ trợ miễn phí chênh lệch
  status: "pending_customer" | "accepted_refund" | "accepted_reschedule" | "contact_support";
  customerDecision?: {
    selectedOption: "full_refund" | "reschedule" | "contact_support";
    decidedAt: string;
    bankAccount?: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
    supportNote?: string;
  };
  refundTransfer?: {
    transferredAt: string;
    transactionCode?: string;
    adminNote?: string;
    amount: number;
  };
}

export interface BookingCancellationMeta {
  type?:
    | "expired_15m"
    | "expired_departure"
    | "customer_cancel_request"
    | "customer_request_approved"
    | "admin_cancel_rejected"
    | "admin_cancelled"
    | "staff_cancelled_pending"
    | "customer_cancelled_pending"
    | "unknown";
  title?: string;
  actor?: "Hệ thống tự động" | "Khách hàng" | "Ban quản trị / Nhân viên" | "Hệ thống";
  reason?: string;
  time?: string;
  cancelledAt?: string;
  refundAmount?: string;
  note?: string;
  cancelRequest?: BookingCancelRequestDetails;
  adminApproval?: BookingAdminApprovalDetails;
  adminRejection?: BookingAdminRejectionDetails;
  adminAction?: BookingAdminActionDetails;
  reschedule?: BookingRescheduleDetails;
  resolutionProposal?: BookingResolutionProposal;
  [key: string]: unknown;
}

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
  room_selection?: { type?: string; surcharge?: number } | null;
  contact_id_card?: string | null;
  cancellation_meta?: BookingCancellationMeta | Record<string, unknown> | null;
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
    | "customer_cancel_request"
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

export type BookingMetadataSource = {
  note?: string | null;
  room_selection?: { type?: string; surcharge?: number } | any | null;
  contact_id_card?: string | null;
  cancellation_meta?: BookingCancellationMeta | Record<string, unknown> | any | null;
};

function getCancellationTitle(type?: string): string {
  switch (type) {
    case "expired_15m":
      return "Hủy tự động do hết hạn thanh toán (quá 15 phút)";
    case "expired_departure":
      return "Hủy tự động do chưa thanh toán trước giờ khởi hành";
    case "customer_cancel_request":
      return "Yêu cầu hủy từ khách hàng";
    case "customer_request_approved":
      return "Hủy theo yêu cầu của khách hàng (Ban quản trị đã duyệt)";
    case "admin_cancelled":
      return "Hủy bởi Ban quản trị / Bộ phận điều hành";
    case "staff_cancelled_pending":
      return "Hủy đơn giữ chỗ bởi Nhân viên điều hành";
    case "customer_cancelled_pending":
      return "Khách hàng chủ động hủy giữ chỗ";
    default:
      return "Đơn đặt tour đã bị hủy";
  }
}

function getCancellationActor(
  type?: string,
): "Hệ thống tự động" | "Khách hàng" | "Ban quản trị / Nhân viên" | "Hệ thống" {
  switch (type) {
    case "expired_15m":
    case "expired_departure":
      return "Hệ thống tự động";
    case "customer_request_approved":
    case "customer_cancelled_pending":
    case "customer_cancel_request":
      return "Khách hàng";
    case "admin_cancelled":
    case "staff_cancelled_pending":
      return "Ban quản trị / Nhân viên";
    default:
      return "Hệ thống";
  }
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

export function parseBookingNote(
  rawNoteOrBooking?: string | null | BookingMetadataSource,
  metaContainer?: BookingMetadataSource | null,
): ParsedBookingNote {
  let rawNote: string | null | undefined;
  let roomSelection: { type?: string; surcharge?: number } | any | null = null;
  let contactIdCardInput: string | null | undefined = null;
  let cancelMeta: BookingCancellationMeta | null = null;

  if (rawNoteOrBooking && typeof rawNoteOrBooking === "object") {
    rawNote = rawNoteOrBooking.note;
    roomSelection = rawNoteOrBooking.room_selection ?? null;
    contactIdCardInput = rawNoteOrBooking.contact_id_card ?? null;
    cancelMeta = (rawNoteOrBooking.cancellation_meta as BookingCancellationMeta) ?? null;
  } else {
    rawNote = rawNoteOrBooking;
  }

  if (metaContainer && typeof metaContainer === "object") {
    if (metaContainer.room_selection !== undefined) roomSelection = metaContainer.room_selection;
    if (metaContainer.contact_id_card !== undefined) contactIdCardInput = metaContainer.contact_id_card;
    if (metaContainer.cancellation_meta !== undefined) {
      cancelMeta = metaContainer.cancellation_meta as BookingCancellationMeta;
    }
  }

  let roomType: string | undefined;
  let roomSurcharge: string | undefined;
  let contactIdCard: string | undefined;
  let cancelRequest: ParsedBookingNote["cancelRequest"];
  let adminApproval: ParsedBookingNote["adminApproval"];
  let adminRejection: ParsedBookingNote["adminRejection"];
  let adminAction: ParsedBookingNote["adminAction"];
  let cancellation: BookingCancellationInfo | undefined;

  // 1. Nếu có dữ liệu có cấu trúc từ cột riêng, ưu tiên sử dụng trực tiếp (O(1), không regex)
  if (roomSelection) {
    if (roomSelection.type === "single") roomType = "PHÒNG ĐƠN";
    else if (roomSelection.type === "shared") roomType = "GHÉP PHÒNG";
    else if (roomSelection.type) roomType = String(roomSelection.type).toUpperCase();

    if (roomSelection.surcharge !== undefined && roomSelection.surcharge !== null) {
      const amt = Number(roomSelection.surcharge);
      roomSurcharge = Number.isFinite(amt) ? `${amt.toLocaleString("vi-VN")}đ` : String(roomSelection.surcharge);
    }
  }

  if (contactIdCardInput) {
    contactIdCard = String(contactIdCardInput).trim();
  }

  if (cancelMeta && typeof cancelMeta === "object" && Object.keys(cancelMeta).length > 0) {
    if (cancelMeta.cancelRequest) {
      const cr = cancelMeta.cancelRequest;
      cancelRequest = {
        reason: cr.reason,
        daysRemaining: cr.daysRemaining != null ? String(cr.daysRemaining) : undefined,
        tierPenalty: cr.tierPenalty,
        totalPaid: cr.totalPaid != null ? String(cr.totalPaid) : undefined,
        penaltyAmount: cr.penaltyAmount != null ? String(cr.penaltyAmount) : undefined,
        refundEstimated: cr.refundEstimated != null ? String(cr.refundEstimated) : undefined,
        bankName: cr.bankName,
        bankAccountNumber: cr.bankAccountNumber,
        bankAccountName: cr.bankAccountName,
        requestedAt: cr.requestedAt,
        numericRefundAmount: cr.numericRefundAmount != null ? Number(cr.numericRefundAmount) : undefined,
      };
    }
    if (cancelMeta.adminApproval) {
      adminApproval = {
        note: cancelMeta.adminApproval.note,
        refundAmount: cancelMeta.adminApproval.refundAmount != null ? String(cancelMeta.adminApproval.refundAmount) : undefined,
      };
    }
    if (cancelMeta.adminRejection) {
      adminRejection = {
        note: cancelMeta.adminRejection.note,
      };
    }
    if (cancelMeta.adminAction) {
      adminAction = {
        reason: cancelMeta.adminAction.reason,
        note: cancelMeta.adminAction.note,
        refundAmount: cancelMeta.adminAction.refundAmount != null ? String(cancelMeta.adminAction.refundAmount) : undefined,
        time: cancelMeta.adminAction.time || cancelMeta.adminAction.cancelledAt,
      };
    }

    if (cancelMeta.type && cancelMeta.type !== "admin_cancel_rejected") {
      cancellation = {
        type: (cancelMeta.type as any) || "unknown",
        title: cancelMeta.title || getCancellationTitle(cancelMeta.type),
        actor: cancelMeta.actor || getCancellationActor(cancelMeta.type),
        reason: cancelMeta.reason || cancelRequest?.reason || adminAction?.reason || "Đơn đặt tour đã bị hủy",
        time: cancelMeta.time || cancelMeta.cancelledAt || cancelRequest?.requestedAt || adminAction?.time,
        refundAmount: cancelMeta.refundAmount != null ? String(cancelMeta.refundAmount) : (adminApproval?.refundAmount || cancelRequest?.refundEstimated),
        note: cancelMeta.note || adminApproval?.note,
      };
    }
  }

  // 2. Fallback cho dữ liệu cũ (chưa backfill): Phân tích chuỗi regex từ rawNote nếu các trường cấu trúc còn trống
  const text = rawNote?.trim() || "";

  if (text) {
    if (!roomType && !roomSurcharge) {
      const roomMatch = text.match(
        /\[ROOM_SELECTION\]\s*Loại phòng:\s*([^\n\r]+)(?:[\n\r]+\s*Phụ thu phòng đơn:\s*([^\n\r]+))?/i,
      );
      if (roomMatch) {
        roomType = roomMatch[1]?.trim();
        roomSurcharge = roomMatch[2]?.trim();
      }
    }

    if (!contactIdCard) {
      const cccdMatch = text.match(/\[CCCD_LIEN_HE\]:\s*([^\n\r]+)/i);
      if (cccdMatch) {
        contactIdCard = cccdMatch[1]?.trim();
      }
    }

    if (!cancelRequest) {
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
    }

    if (!adminApproval) {
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
    }

    if (!adminRejection) {
      const rejectedMatch = text.match(
        /\[ADMIN_CANCEL_REJECTED\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
      );
      if (rejectedMatch) {
        const block = rejectedMatch[1];
        const note = block.match(/Ghi\s*ch[úu]:\s*([^\n\r]+)/i)?.[1]?.trim();
        adminRejection = { note };
      }
    }

    if (!adminAction) {
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
    }

    if (!cancellation) {
      const staffPendingMatch = text.match(
        /\[STAFF_CANCELLED_PENDING\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
      );
      const customerPendingMatch = text.match(
        /\[CUSTOMER_CANCELLED_PENDING\]([\s\S]*?)(?=(?:\r?\n)+\s*\[|$)/i,
      );

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
          title: "Hủy tự động do chưa thanh toán trước giờ khởi hành",
          actor: "Hệ thống tự động",
          reason: "Tour đã đến/qua ngày khởi hành mà đơn chưa hoàn tất thanh toán. Hệ thống tự động hủy đơn.",
        };
      } else if (adminApproval) {
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
      } else if (adminAction) {
        cancellation = {
          type: "admin_cancelled",
          title: "Hủy bởi Ban quản trị / Bộ phận điều hành",
          actor: "Ban quản trị / Nhân viên",
          reason: adminAction?.reason || "Ban quản trị hủy đơn booking theo yêu cầu vận hành",
          time: adminAction?.time,
          refundAmount: adminAction?.refundAmount,
          note: adminAction?.note,
        };
      } else if (staffPendingMatch) {
        const block = staffPendingMatch[1];
        const reason = block.match(/L[ýy]\s*do:\s*([^\n\r]+)/i)?.[1]?.trim();
        const time = block.match(/Th[ờo]i\s*gian:\s*([^\n\r]+)/i)?.[1]?.trim();
        cancellation = {
          type: "staff_cancelled_pending",
          title: "Hủy đơn giữ chỗ bởi Nhân viên điều hành",
          actor: "Ban quản trị / Nhân viên",
          reason: reason || "Nhân viên hủy do khách xác nhận không tham gia / quá hạn giữ chỗ",
          time,
        };
      } else if (customerPendingMatch) {
        const block = customerPendingMatch[1];
        const reason = block.match(/L[ýy]\s*do:\s*([^\n\r]+)/i)?.[1]?.trim();
        const time = block.match(/Th[ờo]i\s*gian(?:\s*h[ủu]y)?:\s*([^\n\r]+)/i)?.[1]?.trim();
        cancellation = {
          type: "customer_cancelled_pending",
          title: "Khách hàng chủ động hủy giữ chỗ",
          actor: "Khách hàng",
          reason: reason || "Khách hàng chủ động hủy đơn giữ chỗ",
          time,
        };
      }
    }
  }

  // Fallback lý do & thời gian hủy chung
  let cancellationReason = cancellation?.reason || cancelRequest?.reason || adminAction?.reason;
  let cancellationTime = cancellation?.time || cancelRequest?.requestedAt || adminAction?.time;

  if (!cancellationReason && text) {
    const reasonMatch = text.match(/L[ýy]\s*do(?:\s*h[ủu]y)?:\s*([^\n\r]+)/i);
    if (reasonMatch) {
      cancellationReason = reasonMatch[1]?.trim();
    }
  }
  if (!cancellationTime && text) {
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

  // Loại bỏ các khối tag hệ thống kỹ thuật nếu còn sót lại trong ghi chú cũ
  const customerNote = text
    ? text
        .replace(
          /\[(?:ROOM_SELECTION|CCCD_LIEN_HE|CUSTOMER_CANCELLED_PENDING|CUSTOMER_CANCEL_REQUEST|ADMIN_CANCEL_ACTION|ADMIN_CANCEL_APPROVED|ADMIN_CANCEL_REJECTED|AUTO_CANCELLED_EXPIRED_15M|AUTO_CANCELLED_DEPARTED|STAFF_CANCELLED_PENDING)\][\s\S]*?(?=(?:\r?\n)+\s*\[|$)/gi,
          "",
        )
        .replace(/\[CCCD_LIEN_HE\]:[^\n\r]*/gi, "")
        .replace(/\[ƯU ĐÃI ĐỢT KHỞI HÀNH\]:[^\n\r]*/gi, "")
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
        .trim()
    : "";

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

export const CANCELLATION_STATUS_LABELS: Record<string, string> = {
  expired_15m: "Đã hủy (Hết hạn 15p)",
  expired_departure: "Đã hủy (Chưa thanh toán)",
  customer_request_approved: "Đã hủy (Theo yêu cầu)",
  admin_cancelled: "Đã hủy (Ban quản trị / Nhân viên)",
  staff_cancelled_pending: "Đã hủy (Ban quản trị / Nhân viên)",
  customer_cancelled_pending: "Đã hủy (Khách hủy)",
};

export const CANCELLATION_DETAIL_REASONS: Record<string, string> = {
  expired_15m: "Hết hạn thanh toán 15 phút",
  expired_departure: "Chưa thanh toán trước giờ khởi hành",
  customer_request_approved: "Hủy theo yêu cầu của khách hàng",
  admin_cancelled: "Ban quản trị / Nhân viên hủy",
  staff_cancelled_pending: "Ban quản trị / Nhân viên hủy",
  customer_cancelled_pending: "Khách hàng chủ động hủy giữ chỗ",
};

export function getCancelledBookingReason(
  rawNoteOrBooking?: string | null | BookingMetadataSource,
  metaContainer?: BookingMetadataSource | null,
): string | null {
  const parsed = parseBookingNote(rawNoteOrBooking, metaContainer);
  if (parsed.cancellation?.type && CANCELLATION_DETAIL_REASONS[parsed.cancellation.type]) {
    return CANCELLATION_DETAIL_REASONS[parsed.cancellation.type];
  }
  if (parsed.cancellation?.reason) {
    return parsed.cancellation.reason;
  }
  return null;
}

export function getCancelledBookingLabel(
  rawNoteOrBooking?: string | null | BookingMetadataSource,
  metaContainer?: BookingMetadataSource | null,
): string {
  const parsed = parseBookingNote(rawNoteOrBooking, metaContainer);
  if (parsed.cancellation?.type && CANCELLATION_STATUS_LABELS[parsed.cancellation.type]) {
    return CANCELLATION_STATUS_LABELS[parsed.cancellation.type];
  }
  return "Đã hủy";
}

