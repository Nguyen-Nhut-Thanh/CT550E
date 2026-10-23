import { Controller, Get } from "@nestjs/common";
import { BannersService } from "./banners.service";
@Controller("banners")
export class BannersPublicController {
    constructor(private readonly bannersService: BannersService) { }
    @Get("public")
    async getPublicBanners() {
        return this.bannersService.getPublicBanners();
    }
}
