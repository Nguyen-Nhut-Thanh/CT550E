import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { TourCompareItemSummary, TourCompareMatrixRow, TourCompareResult, TourCompareVerdict } from "shared";
import { PrismaService } from "../../infrastructure/database/prisma.service";

type CompareCacheItem = {
  result: TourCompareResult;
  expiresAt: number;
};

@Injectable()
export class TourCompareService {
  private readonly logger = new Logger(TourCompareService.name);
  private readonly memoryCache = new Map<string, CompareCacheItem>();

  constructor(private readonly prisma: PrismaService) {}

  async compare(rawTourIds: number[]): Promise<TourCompareResult> {
    const uniqueIds = Array.from(new Set(rawTourIds)).filter((id) => Number.isInteger(id) && id > 0);
    if (uniqueIds.length < 2) {
      throw new NotFoundException("Cần chọn ít nhất 2 tour hợp lệ để so sánh.");
    }

    const sortedIds = [...uniqueIds].sort((a, b) => a - b);
    const cacheKey = `compare:${sortedIds.join("_")}`;

    const cached = this.memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    const tours = await this.prisma.tours.findMany({
      where: {
        tour_id: { in: sortedIds },
        status: 1,
      },
      include: {
        departure_locations: { select: { name: true } },
        transports: { select: { name: true, transport_type: true } },
        tour_destinations: {
          include: { locations: { select: { name: true } } },
          orderBy: { visit_order: "asc" },
        },
        tour_images: {
          orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }],
          take: 1,
          select: { image_url: true },
        },
        tour_schedules: {
          where: {
            status: 1,
            start_date: { gte: new Date() },
          },
          orderBy: { start_date: "asc" },
          take: 1,
          select: {
            price: true,
            start_date: true,
            tour_schedule_prices: true,
          },
        },
        tour_policies: {
          select: { policy_type: true, content: true },
        },
      },
    });

    if (tours.length < 2) {
      throw new NotFoundException("Không tìm thấy đủ thông tin các tour còn mở bán để so sánh.");
    }

    const tourSummaries: TourCompareItemSummary[] = tours.map((t) => {
      const nextSched = t.tour_schedules[0];
      const price = Number(nextSched?.price ?? t.base_price ?? 0);
      return {
        tour_id: t.tour_id,
        code: t.code,
        name: t.name,
        image_url: t.tour_images[0]?.image_url || "/images/shared/default-tour-beach.jpg",
        price,
        original_price: Number(t.base_price) > price ? Number(t.base_price) : undefined,
        duration: `${t.duration_days} ngày ${t.duration_nights} đêm`,
        departure_name: t.departure_locations?.name || "Khởi hành linh hoạt",
        link: `/tours/${t.tour_id}`,
      };
    });

    // Prepare payload for AI
    const aiPayload = tours.map((t) => {
      const price = Number(t.tour_schedules[0]?.price ?? t.base_price ?? 0);
      const included = t.tour_policies
        .filter((p) => p.policy_type === "included")
        .map((p) => p.content);
      const excluded = t.tour_policies
        .filter((p) => p.policy_type === "excluded")
        .map((p) => p.content);
      return {
        tour_id: t.tour_id,
        name: t.name,
        code: t.code,
        price,
        duration: `${t.duration_days} ngày ${t.duration_nights} đêm`,
        departure: t.departure_locations?.name || "Việt Nam",
        summary: t.summary || "",
        description: t.description || "",
        transport: t.transports?.name || "",
        hotel: t.cuisine_info || "Khách sạn tiêu chuẩn",
        included,
        excluded,
      };
    });

    const aiResult = await this.callAiCompare(aiPayload);

    const finalResult: TourCompareResult = {
      verdict: aiResult.verdict,
      criteria_matrix: aiResult.criteria_matrix,
      key_tradeoff: aiResult.key_tradeoff,
      tours: tourSummaries,
    };

    // Cache in memory for 24 hours
    this.memoryCache.set(cacheKey, {
      result: finalResult,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return finalResult;
  }

  private async callAiCompare(aiPayload: any[]): Promise<{
    verdict: TourCompareVerdict;
    criteria_matrix: TourCompareMatrixRow[];
    key_tradeoff: string;
  }> {
    const origin = process.env.AI_SERVICE_URL?.trim().replace(/\/+$/, "");
    const token = process.env.AI_SERVICE_TOKEN?.trim();

    if (origin && token) {
      try {
        const response = await fetch(`${origin}/internal/compare-tours`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tours: aiPayload }),
          signal: AbortSignal.timeout(15_000),
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.verdict && Array.isArray(data?.criteria_matrix)) {
            // Map keys in matrix values to numeric tour_id
            const matrix: TourCompareMatrixRow[] = data.criteria_matrix.map((row: any) => {
              const mappedValues: Record<number, string> = {};
              if (row.values && typeof row.values === "object") {
                for (const [key, val] of Object.entries(row.values)) {
                  mappedValues[Number(key)] = String(val);
                }
              }
              return {
                criterion: row.criterion,
                values: mappedValues,
              };
            });

            return {
              verdict: data.verdict,
              criteria_matrix: matrix,
              key_tradeoff: data.key_tradeoff || "",
            };
          }
        }
      } catch (err) {
        this.logger.warn(`AI compare API call failed: ${err instanceof Error ? err.message : err}, using fallback`);
      }
    }

    return this.buildFallbackCompare(aiPayload);
  }

  private buildFallbackCompare(tours: any[]) {
    const sorted = [...tours].sort((a, b) => a.price - b.price);
    const cheapest = sorted[0];
    const priciest = sorted[sorted.length - 1];

    const names = tours.map((t) => `"${t.name}" (${t.duration})`).join(" và ");
    const summary = `So sánh giữa ${names}. Mỗi tour có điểm đặc sắc riêng về lịch trình, điểm đến và ngân sách dự kiến.`;

    const best_for = tours.map((t) => {
      let recommendation = `Lựa chọn cân bằng hài hòa giữa chi phí (${new Intl.NumberFormat("vi-VN").format(t.price)} đ) và thời gian trải nghiệm ${t.duration}.`;
      if (t.tour_id === cheapest.tour_id && cheapest.price < priciest.price) {
        recommendation = `Phù hợp với nhóm bạn trẻ hoặc gia đình muốn tối ưu ngân sách (${new Intl.NumberFormat("vi-VN").format(t.price)} đ), lịch trình vừa vặn và dịch vụ đầy đủ.`;
      } else if (t.tour_id === priciest.tour_id && cheapest.price < priciest.price) {
        recommendation = `Phù hợp cho khách ưu tiên nghỉ dưỡng thong thả, dịch vụ tiện nghi hơn và nhiều hoạt động trải nghiệm đặc sắc.`;
      }
      return {
        tour_id: t.tour_id,
        tour_name: t.name,
        recommendation,
      };
    });

    const criteria_matrix: TourCompareMatrixRow[] = [
      {
        criterion: "Thời lượng & Khởi hành",
        values: Object.fromEntries(tours.map((t) => [t.tour_id, `${t.duration} • Từ ${t.departure}`])),
      },
      {
        criterion: "Phương tiện di chuyển",
        values: Object.fromEntries(tours.map((t) => [t.tour_id, t.transport || "Xe du lịch đời mới"])),
      },
      {
        criterion: "Tiêu chuẩn lưu trú & Ăn uống",
        values: Object.fromEntries(tours.map((t) => [t.tour_id, t.hotel || "Khách sạn tiêu chuẩn"])),
      },
      {
        criterion: "Mức giá dự kiến",
        values: Object.fromEntries(tours.map((t) => [t.tour_id, `Từ ${new Intl.NumberFormat("vi-VN").format(t.price)} đ / khách`])),
      },
    ];

    const key_tradeoff = `Nếu bạn ưu tiên mức giá tiết kiệm, '${cheapest.name}' là phương án tối ưu. Nếu bạn muốn chuyến đi thảnh thơi với nhiều dịch vụ chất lượng, '${priciest.name}' là lựa chọn xứng đáng.`;

    return {
      verdict: { summary, best_for },
      criteria_matrix,
      key_tradeoff,
    };
  }
}
