import { Controller, Delete, Get, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt.guard";
import { FavoritesService } from "./favorites.service";
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
    constructor(private readonly favorites: FavoritesService) { }
    @Get("ids")
    ids(
    @Req()
    req: any) { return this.favorites.ids(req.user.accountId); }
    @Get("my")
    list(
    @Req()
    req: any) { return this.favorites.list(req.user.accountId); }
    @Post(":tourId")
    add(
    @Req()
    req: any,
    @Param("tourId", ParseIntPipe)
    tourId: number) {
        return this.favorites.add(req.user.accountId, tourId);
    }
    @Delete(":tourId")
    remove(
    @Req()
    req: any,
    @Param("tourId", ParseIntPipe)
    tourId: number) {
        return this.favorites.remove(req.user.accountId, tourId);
    }
}
