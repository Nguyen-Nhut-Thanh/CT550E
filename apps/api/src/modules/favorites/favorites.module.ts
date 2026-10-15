import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { FavoritesController } from "./favorites.controller";
import { FavoritesService } from "./favorites.service";

@Module({ controllers: [FavoritesController], providers: [PrismaService, FavoritesService] })
export class FavoritesModule {}
