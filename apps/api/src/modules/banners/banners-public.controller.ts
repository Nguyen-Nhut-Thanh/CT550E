import { Controller, Get, Header } from "@nestjs/common";
import { BannersService } from "./banners.service";
@Controller("banners")
export class BannersPublicController {
    constructor(private readonly bannersService: BannersService) { }
    @Get("public")
    @Header("Cache-Control", "no-store, no-cache, must-revalidate")
    async getPublicBanners() {
        return this.bannersService.getPublicBanners();
    }
    @Get("seasonal-theme")
    @Header("Cache-Control", "no-store, no-cache, must-revalidate")
    async getSeasonalTheme() {
        return this.bannersService.getSeasonalTheme();
    }
}
