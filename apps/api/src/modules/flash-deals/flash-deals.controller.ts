import { Controller, Get, Query } from "@nestjs/common";
import { FlashDealsService } from "./flash-deals.service";

@Controller("public")
export class FlashDealsController {
  constructor(private readonly flashDealsService: FlashDealsService) {}

  @Get("flash-deals")
  async getFlashDeals(@Query("limit") limit?: string) {
    const parsedLimit = Number(limit);
    return this.flashDealsService.getFlashDeals(
      Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 8,
    );
  }
}
