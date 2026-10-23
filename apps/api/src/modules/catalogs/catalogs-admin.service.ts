import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class CatalogsAdminService {
    constructor(private readonly prisma: PrismaService) { }
    async listHotels() {
        return this.prisma.hotels.findMany({
            orderBy: { name: 'asc' },
            select: { hotel_id: true, name: true, star_rating: true },
        });
    }
    async listHotelRoomTypes(hotelId: number) {
        return this.prisma.hotel_room_types.findMany({
            where: { hotel_id: hotelId },
            select: { room_type_id: true, name: true, base_price: true },
        });
    }
    async listAllTransports() {
        return this.prisma.transports.findMany({
            orderBy: { name: 'asc' },
            select: { transport_id: true, name: true, transport_type: true },
        });
    }
}
