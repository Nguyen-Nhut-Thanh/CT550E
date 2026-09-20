import { Controller, Get } from "@nestjs/common";
import { prisma } from "database";

@Controller("banners")
export class BannersController {
  @Get("public")
  async getPublicBanners() {
    return prisma.banners.findMany({
      where: { status: 1 },
      orderBy: { banner_id: "asc" }
    });
  }
}
