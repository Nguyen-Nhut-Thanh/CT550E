import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  private async userId(accountId: number): Promise<number> {
    const user = await this.prisma.users.findUnique({ where: { account_id: accountId }, select: { user_id: true } });
    if (!user) throw new NotFoundException("Không tìm thấy thông tin người dùng.");
    return user.user_id;
  }

  async ids(accountId: number) {
    const user_id = await this.userId(accountId);
    const items = await this.prisma.favorites.findMany({ where: { user_id }, select: { tour_id: true } });
    return { items: items.map((item: { tour_id: number }) => item.tour_id) };
  }

  async list(accountId: number) {
    const user_id = await this.userId(accountId);
    return this.prisma.favorites.findMany({
      where: { user_id }, orderBy: { created_at: "desc" },
      include: { tours: { include: {
        departure_locations: { select: { name: true } },
        tour_images: { orderBy: [{ is_cover: "desc" }, { sort_order: "asc" }], take: 1 },
        tour_schedules: { orderBy: { start_date: "asc" }, take: 1, select: { start_date: true } },
      } } },
    });
  }

  async add(accountId: number, tourId: number) {
    const user_id = await this.userId(accountId);
    const tour = await this.prisma.tours.findUnique({ where: { tour_id: tourId }, select: { tour_id: true } });
    if (!tour) throw new NotFoundException("Tour không tồn tại.");
    await this.prisma.favorites.upsert({
      where: { user_id_tour_id: { user_id, tour_id: tourId } },
      create: { user_id, tour_id: tourId }, update: {},
    });
    return { tour_id: tourId, is_favorite: true };
  }

  async remove(accountId: number, tourId: number) {
    const user_id = await this.userId(accountId);
    await this.prisma.favorites.deleteMany({ where: { user_id, tour_id: tourId } });
    return { tour_id: tourId, is_favorite: false };
  }
}
