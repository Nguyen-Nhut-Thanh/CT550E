import {
  BadRequestException, Injectable, Logger, ServiceUnavailableException,
} from "@nestjs/common";
import { tourIntentSchema, voucherAudienceLabel } from "shared";
import type { AiChatResponse, AiChatTour, AiChatTourReference, TourIntent } from "shared";
import type { Party } from "../bookings/helpers/booking-tour-price";
import { VouchersService } from "../vouchers/vouchers.service";
import { AiChatDto } from "./ai-chat.dto";
import { AiChatTours, vnd } from "./ai-chat-tours.service";

const directIntent: TourIntent = {
  intent: "offers",
  topic: "overview",
  policy_key: null,
  destination: null,
  departure: null,
  tour_name: null,
  themes: [],
  departure_from: null,
  departure_until: null,
  duration_days: null,
  max_per_person: null,
  max_total: null,
  adults: null,
  children: null,
  infants: null,
  voucher_code: null,
  tour_position: null,
  use_selected_tour: true,
  change_departure: false,
};

export function parsePartyFromText(text: string): Party | undefined {
  const norm = text.toLowerCase().normalize("NFC");

  let adults: number | null = null;
  let children = 0;
  let infants = 0;

  // 1. Adults: "1 người lớn", "2 ng lớn", "2 lớn", "2 adults", "2 adult", "2 nguoi lon"
  const adultMatch = norm.match(/(?:^|\D)(\d+)\s*(?:người\s*lớn|ng\s*lớn|nguoi\s*lon|lớn|adults?)(?:\D|$)/);
  if (adultMatch) {
    adults = parseInt(adultMatch[1], 10);
  }

  // 2. Children: "1 trẻ em", "1 trẻ nhỏ", "1 trẻ", "1 tre em", "1 children", "1 child", "1 nhỏ"
  const childMatch = norm.match(/(?:^|\D)(\d+)\s*(?:trẻ\s*em|tre\s*em|trẻ\s*nhỏ|tre\s*nho|trẻ|tre|nhỏ|children|child)(?:\D|$)/);
  if (childMatch) {
    children = parseInt(childMatch[1], 10);
  }

  // 3. Infants: "1 em bé", "1 em be", "1 bé", "1 infants", "1 infant"
  const infantMatch = norm.match(/(?:^|\D)(\d+)\s*(?:em\s*bé|em\s*be|bé|infants?)(?:\D|$)/);
  if (infantMatch) {
    infants = parseInt(infantMatch[1], 10);
  }

  // 4. Fallback if no explicit breakdown: "vợ chồng", "cặp đôi", or general "2 khách", "2 người"
  if (adults === null) {
    if (/(?:vợ\s*chồng|cặp\s*đôi|hai\s*vợ\s*chồng)/.test(norm)) {
      adults = 2;
    } else {
      const guestMatch = norm.match(/(?:^|\D)(\d+)\s*(?:người|khách|nguoi|khach|pax)(?!\s*(?:lớn|trẻ|nhỏ|em|bé|ngày|đêm|triệu|k\b|tr\b))(?:\D|$)/);
      if (guestMatch) {
        adults = parseInt(guestMatch[1], 10);
      }
    }
  }

  if (adults != null && adults > 0) {
    return { adults, children, infants };
  }
  return undefined;
}

function referenceFor(card: AiChatTour): AiChatTourReference {
  return { tourId: card.id, scheduleId: card.schedule_id };
}

function asResponse(reply: string, tours: AiChatTour[] = [], tourReference?: AiChatTourReference): AiChatResponse {
  return { reply, tours, tourReference };
}

type SearchResult = Awaited<ReturnType<AiChatTours["find"]>>[number];

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  constructor(private readonly tours: AiChatTours, private readonly vouchers: VouchersService) {}

  async ask(body: AiChatDto, accountId?: number): Promise<AiChatResponse> {
    const message = body.message.trim();
    if (!message) throw new BadRequestException("Bạn hãy nhập câu hỏi về tour.");

    const partyFromText = parsePartyFromText(message);
    const recent = body.recentTours ?? [];
    const selected = body.tourReference ?? (recent.length === 1 ? recent[0] : undefined);

    let intent: TourIntent;
    if (body.action === "quote" && selected) {
      intent = {
        ...directIntent,
        intent: "quote",
        adults: partyFromText?.adults ?? null,
        children: partyFromText?.children ?? null,
        infants: partyFromText?.infants ?? null,
        use_selected_tour: true,
      };
    } else if (body.action === "offers" && !message) {
      intent = { ...directIntent, intent: "offers" };
    } else if (body.action === "advice" && selected) {
      intent = { ...directIntent, intent: "advice", use_selected_tour: true };
    } else {
      intent = await this.interpret(message, body.previousQuestions ?? [], recent.length, Boolean(selected));
      if (body.action) {
        intent.intent = body.action;
      }
    }

    if (partyFromText && selected && (intent.intent === "other" || intent.intent === "greeting" || intent.intent === "search") && !intent.destination && !intent.tour_name) {
      intent.intent = "quote";
      intent.use_selected_tour = true;
    }

    if (intent.intent === "greeting" || intent.intent === "other") {
      return asResponse("Mình có thể tìm tour JourniTrip, tư vấn lịch trình, tính giá cho nhóm hoặc kiểm tra ưu đãi. Bạn muốn đi đâu?");
    }
    if (intent.departure_from && intent.departure_until && intent.departure_from > intent.departure_until) {
      return asResponse("Bạn kiểm tra lại khoảng ngày khởi hành giúp mình nhé.");
    }

    const reference = intent.tour_position
      ? recent[intent.tour_position - 1]
      : intent.use_selected_tour ? selected : undefined;
    if (intent.tour_position && !reference) {
      return asResponse("Mình chưa thấy tour ở vị trí đó trong danh sách gần nhất. Bạn cho mình tên hoặc mã tour nhé.");
    }

    const wantsQuote = intent.intent === "quote" || Boolean(intent.voucher_code);
    const party: Party | undefined = (partyFromText && partyFromText.adults > 0)
      ? partyFromText
      : (intent.adults ? { adults: intent.adults, children: intent.children ?? 0, infants: intent.infants ?? 0 } : undefined);
    if (intent.max_total != null && !party) {
      return asResponse("Ngân sách này dành cho cả nhóm. Bạn cho mình số người lớn, trẻ em và em bé để lọc tour nhé.", [], reference);
    }
    if (party && party.adults + party.children + party.infants > 100) {
      return asResponse("Nhóm trên 100 khách vui lòng liên hệ tư vấn viên để kiểm tra số chỗ và giá đoàn.");
    }

    const hasTourQuery = Boolean(reference || intent.tour_name || intent.destination ||
      intent.departure || intent.departure_from || intent.departure_until);
    if (intent.intent === "advice" && intent.topic !== "overview" && !hasTourQuery) {
      return asResponse("Bạn muốn xem thông tin của tour nào? Gửi mình tên hoặc mã tour nhé.");
    }
    if (wantsQuote && !hasTourQuery) {
      return asResponse("Bạn gửi tên, mã hoặc điểm đến của tour cần tính giá nhé. Nếu có ngày khởi hành và số khách, bạn gửi kèm giúp mình.");
    }

    const found = await this.tours.find(intent, reference, party);
    const cards = found.map((item) => item.card);
    const match = found.length === 1 ? found[0] : undefined;
    if (intent.intent === "offers" && !intent.voucher_code) {
      return this.listOffers(found, hasTourQuery);
    }
    if (!found.length) {
      return asResponse("Mình chưa tìm thấy tour còn đủ chỗ và phù hợp với các điều kiện này. Bạn thử đổi ngày, điểm khởi hành hoặc ngân sách nhé.", [], reference);
    }

    if (wantsQuote) {
      if (!match) {
        return asResponse("Mình tìm được vài tour. Bạn cho mình biết tour nào cần tính giá hoặc chọn Tính giá ở thẻ tour bên dưới.", cards);
      }
      if (!party) {
        const voucherHint = intent.voucher_code ? ` để kiểm tra mã ${intent.voucher_code}` : "";
        return asResponse(
          `Bạn cho mình số người lớn, trẻ em và em bé${voucherHint} nhé. Ví dụ: 2 người lớn, 1 trẻ em, không có em bé.`,
          cards, referenceFor(match.card),
        );
      }
      return this.quote(match, party, intent.voucher_code, accountId);
    }

    if (intent.intent === "advice" && match) {
      const target = referenceFor(match.card);
      return asResponse(await this.tours.advise(target, intent.topic, intent.policy_key), cards, target);
    }

    return asResponse(
      intent.intent === "advice"
        ? "Mình tìm thấy những tour này theo nhu cầu bạn vừa nêu. Bạn chọn Tư vấn trên thẻ để xem thông tin chi tiết."
        : `Mình tìm thấy ${cards.length === 5 ? "5 lựa chọn đầu tiên" : `${cards.length} tour`} phù hợp. Giá trên thẻ là giá cho một người lớn ở ngày khởi hành hiển thị.`,
      cards, match && referenceFor(match.card),
    );
  }

  private async interpret(message: string, previousQuestions: string[], recentTourCount: number, hasSelectedTour: boolean) {
    const origin = process.env.AI_SERVICE_URL?.trim().replace(/\/+$/, "");
    const token = process.env.AI_SERVICE_TOKEN?.trim();
    if (!origin || !token) {
      throw new ServiceUnavailableException("Chatbot AI chưa được cấu hình.");
    }
    try {
      const response = await fetch(`${origin}/internal/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message, previousQuestions, recentTourCount, hasSelectedTour }),
        signal: AbortSignal.timeout(19_000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return tourIntentSchema.parse(await response.json());
    } catch (error) {
      this.logger.warn(`AI interpretation failed (${error instanceof Error && /^HTTP \d+$/.test(error.message) ? error.message : "request or schema error"})`);
      throw new ServiceUnavailableException("Chatbot đang bận hoặc mất kết nối. Bạn thử lại sau nhé.");
    }
  }

  private async quote(match: SearchResult, party: Party, code: string | null, accountId?: number) {
    const { pricing, card } = match;
    const target = referenceFor(card);
    if (pricing.missingChildPrice || pricing.missingInfantPrice) {
      return asResponse(
        "Lịch khởi hành này chưa có giá công bố cho mọi nhóm tuổi bạn chọn. Bạn có thể nhắn tư vấn viên để lấy báo giá đầy đủ.",
        [card], target,
      );
    }

    const pieces = [
      `Người lớn: ${party.adults} × ${vnd.format(pricing.adultPrice)}`,
      party.children ? `Trẻ em: ${party.children} × ${vnd.format(pricing.childPrice)}` : "",
      party.infants ? `Em bé: ${party.infants} × ${vnd.format(pricing.infantPrice)}` : "",
      pricing.appliedPromoTitle ? `Đã tính ưu đãi: ${pricing.appliedPromoTitle}.` : "",
      pricing.appliedGiftDescription ? `Quà tặng: ${pricing.appliedGiftDescription}.` : "",
    ].filter(Boolean);

    let total = pricing.subtotal;
    if (code) {
      try {
        const amount = String(pricing.subtotal);
        const result = accountId
          ? await this.vouchers.validateForAccount(accountId, code, amount, card.id)
          : await this.vouchers.validatePublicVoucher(code, amount, undefined, card.id);
        total = result.final_amount;
        pieces.push(`Voucher ${result.code} giảm ${vnd.format(result.discount_amount)}.`);
      } catch (error) {
        if (!(error instanceof BadRequestException)) throw error;
        pieces.push(`Chưa áp dụng mã ${code.toUpperCase()}. ${error.message}`);
      }
    }

    const date = card.departure_date
      ? new Date(card.departure_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      : "";
    return asResponse([
      `${card.title} — khởi hành ${date} từ ${match.departure}`,
      ...pieces,
      `Tiền tour dự kiến: ${vnd.format(total)}.`,
      "Phụ thu phòng đơn, dịch vụ thêm và giảm theo hạng thành viên sẽ được tính ở bước đặt tour.",
    ].join("\n"), [card], target);
  }

  private async listOffers(found: SearchResult[], hasTourQuery: boolean) {
    const { vouchers } = await this.vouchers.getPublicHomeVouchers();
    const publicCodes = vouchers.filter((voucher) =>
      voucher.used_count < voucher.usage_limit &&
      (!hasTourQuery || found.some(({ card, tourType }) => {
        if (voucher.applicable_scope === "specific_tours" && voucher.applicable_tour_ids?.length) {
          return voucher.applicable_tour_ids.includes(card.id);
        }
        if (voucher.applicable_scope === "tour_type" && voucher.applicable_tour_types?.length) {
          return voucher.applicable_tour_types.includes(tourType);
        }
        return true;
      })));
    const offers = publicCodes.slice(0, 4).map((voucher) => {
      const amount = voucher.discount_type === "percentage"
        ? `${Number(voucher.discount_value)}%`
        : vnd.format(Number(voucher.discount_value));
      const cap = voucher.discount_type === "percentage" && voucher.max_discount_amount != null
        ? `, tối đa ${vnd.format(Number(voucher.max_discount_amount))}`
        : "";
      const scope = voucher.applicable_scope && voucher.applicable_scope !== "all" ? ", giới hạn theo tour" : "";
      const expiry = new Date(voucher.expiry_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
      return `${voucher.code}: giảm ${amount}${cap}, đơn từ ${vnd.format(Number(voucher.min_order_value))}${scope}. Hạn ${expiry}. ${voucherAudienceLabel(voucher.eligible_tiers)}.`;
    });
    const cards = found.filter((item) => item.pricing.appliedPromoType).map((item) => item.card);
    const lines = [
      cards.length ? "Các thẻ bên dưới có ưu đãi theo lịch khởi hành." : "",
      ...offers,
      offers.length ? "Gửi mã, tên tour và số khách để mình kiểm tra điều kiện cho chuyến đi của bạn." : "",
    ].filter(Boolean);
    return asResponse(lines.join("\n") || "Mình chưa thấy ưu đãi công khai đang áp dụng cho yêu cầu này.", cards, found.length === 1 ? referenceFor(found[0].card) : undefined);
  }
}

