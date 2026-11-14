import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import type {
  HotelPayload,
  ProviderPayload,
  RoomTypePayload,
  TransportPayload,
} from 'shared';

@Injectable()
export class CatalogsAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // EXISTING READ CATALOGS (Keep backward compatible)
  // ==========================================
  async listHotels() {
    return this.prisma.hotels.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' },
      select: { hotel_id: true, name: true, star_rating: true },
    });
  }

  async listHotelRoomTypes(hotelId: number) {
    return this.prisma.hotel_room_types.findMany({
      where: { hotel_id: hotelId, status: 1 },
      select: { room_type_id: true, name: true, base_price: true },
    });
  }

  async listAllTransports() {
    return this.prisma.transports.findMany({
      where: { status: 1 },
      orderBy: { name: 'asc' },
      select: { transport_id: true, name: true, transport_type: true },
    });
  }

  // ==========================================
  // FULL HOTELS CRUD
  // ==========================================
  async listAdminHotels(search?: string, locationId?: number, starRating?: number, status?: number) {
    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { address: { contains: search.trim(), mode: 'insensitive' } },
        { phone: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (locationId) where.location_id = locationId;
    if (starRating) where.star_rating = starRating;
    if (typeof status === 'number') where.status = status;

    return this.prisma.hotels.findMany({
      where,
      orderBy: [{ updated_at: 'desc' }, { hotel_id: 'desc' }],
      include: {
        locations: { select: { location_id: true, name: true } },
        hotel_room_types: {
          orderBy: { base_price: 'asc' },
        },
        _count: {
          select: {
            hotel_room_types: true,
            tour_schedule_hotels: true,
          },
        },
      },
    });
  }

  async getAdminHotel(id: number) {
    const hotel = await this.prisma.hotels.findUnique({
      where: { hotel_id: id },
      include: {
        locations: { select: { location_id: true, name: true } },
        hotel_room_types: {
          orderBy: { base_price: 'asc' },
        },
        _count: {
          select: {
            hotel_room_types: true,
            tour_schedule_hotels: true,
          },
        },
      },
    });
    if (!hotel) throw new NotFoundException('Không tìm thấy thông tin khách sạn.');
    return hotel;
  }

  async createHotel(payload: HotelPayload) {
    if (!payload.name?.trim()) throw new BadRequestException('Tên khách sạn không được để trống.');
    if (!payload.location_id) throw new BadRequestException('Vui lòng chọn Tỉnh/Thành phố.');
    if (!payload.address?.trim()) throw new BadRequestException('Địa chỉ khách sạn không được để trống.');

    const locationExists = await this.prisma.locations.findUnique({ where: { location_id: payload.location_id } });
    if (!locationExists) throw new BadRequestException('Địa điểm không hợp lệ.');

    const roomTypes = Array.isArray(payload.room_types) ? payload.room_types.filter(r => r.name?.trim()) : [];

    return this.prisma.hotels.create({
      data: {
        name: payload.name.trim(),
        location_id: payload.location_id,
        star_rating: Number(payload.star_rating) || 3,
        address: payload.address.trim(),
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
        description: payload.description?.trim() || null,
        status: typeof payload.status === 'number' ? payload.status : 1,
        hotel_room_types: roomTypes.length
          ? {
              create: roomTypes.map(r => ({
                name: r.name.trim(),
                base_price: Number(r.base_price) || 0,
                extra_price: Number(r.extra_price) || 0,
                breakfast_included: Boolean(r.breakfast_included),
                description: r.description?.trim() || null,
                status: 1,
              })),
            }
          : undefined,
      },
      include: {
        locations: { select: { location_id: true, name: true } },
        hotel_room_types: true,
      },
    });
  }

  async updateHotel(id: number, payload: Partial<HotelPayload>) {
    await this.getAdminHotel(id);

    const data: any = {};
    if (payload.name !== undefined) {
      if (!payload.name.trim()) throw new BadRequestException('Tên khách sạn không được để trống.');
      data.name = payload.name.trim();
    }
    if (payload.location_id !== undefined) {
      const locationExists = await this.prisma.locations.findUnique({ where: { location_id: payload.location_id } });
      if (!locationExists) throw new BadRequestException('Địa điểm không hợp lệ.');
      data.location_id = payload.location_id;
    }
    if (payload.star_rating !== undefined) data.star_rating = Number(payload.star_rating) || 3;
    if (payload.address !== undefined) {
      if (!payload.address.trim()) throw new BadRequestException('Địa chỉ không được để trống.');
      data.address = payload.address.trim();
    }
    if (payload.phone !== undefined) data.phone = payload.phone?.trim() || null;
    if (payload.email !== undefined) data.email = payload.email?.trim() || null;
    if (payload.description !== undefined) data.description = payload.description?.trim() || null;
    if (payload.status !== undefined) data.status = Number(payload.status);

    return this.prisma.hotels.update({
      where: { hotel_id: id },
      data,
      include: {
        locations: { select: { location_id: true, name: true } },
        hotel_room_types: true,
      },
    });
  }

  async deleteHotel(id: number) {
    await this.getAdminHotel(id);

    const countUsed = await this.prisma.tour_schedule_hotels.count({ where: { hotel_id: id } });
    if (countUsed > 0) {
      throw new BadRequestException(
        `Khách sạn này đang được sử dụng trong ${countUsed} lịch trình tour. Bạn có thể chuyển trạng thái sang Tạm dừng thay vì xóa.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.hotel_room_types.deleteMany({ where: { hotel_id: id } });
      return tx.hotels.delete({ where: { hotel_id: id } });
    });
  }

  // ==========================================
  // ROOM TYPES CRUD
  // ==========================================
  async listHotelRoomTypesFull(hotelId: number) {
    return this.prisma.hotel_room_types.findMany({
      where: { hotel_id: hotelId },
      orderBy: { base_price: 'asc' },
      include: {
        _count: {
          select: {
            tour_schedule_hotels: true,
          },
        },
      },
    });
  }

  async createRoomType(hotelId: number, payload: RoomTypePayload) {
    await this.getAdminHotel(hotelId);
    if (!payload.name?.trim()) throw new BadRequestException('Tên loại phòng không được để trống.');

    return this.prisma.hotel_room_types.create({
      data: {
        hotel_id: hotelId,
        name: payload.name.trim(),
        base_price: Number(payload.base_price) || 0,
        extra_price: Number(payload.extra_price) || 0,
        breakfast_included: Boolean(payload.breakfast_included),
        description: payload.description?.trim() || null,
        status: typeof payload.status === 'number' ? payload.status : 1,
      },
    });
  }

  async updateRoomType(roomTypeId: number, payload: Partial<RoomTypePayload>) {
    const existing = await this.prisma.hotel_room_types.findUnique({ where: { room_type_id: roomTypeId } });
    if (!existing) throw new NotFoundException('Không tìm thấy loại phòng.');

    const data: any = {};
    if (payload.name !== undefined) {
      if (!payload.name.trim()) throw new BadRequestException('Tên loại phòng không được để trống.');
      data.name = payload.name.trim();
    }
    if (payload.base_price !== undefined) data.base_price = Number(payload.base_price) || 0;
    if (payload.extra_price !== undefined) data.extra_price = Number(payload.extra_price) || 0;
    if (payload.breakfast_included !== undefined) data.breakfast_included = Boolean(payload.breakfast_included);
    if (payload.description !== undefined) data.description = payload.description?.trim() || null;
    if (payload.status !== undefined) data.status = Number(payload.status);

    return this.prisma.hotel_room_types.update({
      where: { room_type_id: roomTypeId },
      data,
    });
  }

  async deleteRoomType(roomTypeId: number) {
    const countUsed = await this.prisma.tour_schedule_hotels.count({ where: { room_type_id: roomTypeId } });
    if (countUsed > 0) {
      throw new BadRequestException(
        `Loại phòng này đang được chọn trong ${countUsed} lịch trình tour. Bạn có thể chuyển trạng thái sang Tạm dừng thay vì xóa.`,
      );
    }
    return this.prisma.hotel_room_types.delete({ where: { room_type_id: roomTypeId } });
  }

  // ==========================================
  // TRANSPORTS CRUD
  // ==========================================
  async listAdminTransports(search?: string, type?: string, providerId?: number, status?: number) {
    const where: any = {};
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    if (type) where.transport_type = type;
    if (providerId) where.provider_id = providerId;
    if (typeof status === 'number') where.status = status;

    return this.prisma.transports.findMany({
      where,
      orderBy: [{ updated_at: 'desc' }, { transport_id: 'desc' }],
      include: {
        providers: { select: { provider_id: true, name: true, type: true } },
        _count: {
          select: {
            tour_schedule_transports: true,
            tours: true,
          },
        },
      },
    });
  }

  async createTransport(payload: TransportPayload) {
    if (!payload.name?.trim()) throw new BadRequestException('Tên phương tiện không được để trống.');
    if (!payload.provider_id) throw new BadRequestException('Vui lòng chọn đơn vị cung cấp.');

    const providerExists = await this.prisma.providers.findUnique({ where: { provider_id: payload.provider_id } });
    if (!providerExists) throw new BadRequestException('Đơn vị cung cấp không tồn tại.');

    return this.prisma.transports.create({
      data: {
        name: payload.name.trim(),
        transport_type: payload.transport_type || 'car',
        capacity: Number(payload.capacity) || 0,
        provider_id: payload.provider_id,
        status: typeof payload.status === 'number' ? payload.status : 1,
        description: payload.description?.trim() || null,
      },
      include: {
        providers: { select: { provider_id: true, name: true, type: true } },
      },
    });
  }

  async updateTransport(id: number, payload: Partial<TransportPayload>) {
    const existing = await this.prisma.transports.findUnique({ where: { transport_id: id } });
    if (!existing) throw new NotFoundException('Không tìm thấy phương tiện.');

    const data: any = {};
    if (payload.name !== undefined) {
      if (!payload.name.trim()) throw new BadRequestException('Tên phương tiện không được để trống.');
      data.name = payload.name.trim();
    }
    if (payload.transport_type !== undefined) data.transport_type = payload.transport_type;
    if (payload.capacity !== undefined) data.capacity = Number(payload.capacity) || 0;
    if (payload.provider_id !== undefined) {
      const providerExists = await this.prisma.providers.findUnique({ where: { provider_id: payload.provider_id } });
      if (!providerExists) throw new BadRequestException('Đơn vị cung cấp không tồn tại.');
      data.provider_id = payload.provider_id;
    }
    if (payload.status !== undefined) data.status = Number(payload.status);
    if (payload.description !== undefined) data.description = payload.description?.trim() || null;

    return this.prisma.transports.update({
      where: { transport_id: id },
      data,
      include: {
        providers: { select: { provider_id: true, name: true, type: true } },
      },
    });
  }

  async deleteTransport(id: number) {
    const countSchedule = await this.prisma.tour_schedule_transports.count({ where: { transport_id: id } });
    const countTours = await this.prisma.tours.count({ where: { transport_id: id } });
    if (countSchedule > 0 || countTours > 0) {
      throw new BadRequestException(
        `Phương tiện này đang được gán vào ${countSchedule + countTours} tour/lịch trình. Bạn có thể chuyển trạng thái sang Tạm dừng thay vì xóa.`,
      );
    }
    return this.prisma.transports.delete({ where: { transport_id: id } });
  }

  // ==========================================
  // PROVIDERS CRUD
  // ==========================================
  async listAdminProviders() {
    return this.prisma.providers.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            transports: true,
          },
        },
      },
    });
  }

  async createProvider(payload: ProviderPayload) {
    if (!payload.name?.trim()) throw new BadRequestException('Tên nhà cung cấp không được để trống.');

    const existing = await this.prisma.providers.findUnique({ where: { name: payload.name.trim() } });
    if (existing) throw new BadRequestException('Nhà cung cấp này đã tồn tại trên hệ thống.');

    return this.prisma.providers.create({
      data: {
        name: payload.name.trim(),
        type: payload.type || 'car',
        contact_info: payload.contact_info?.trim() || null,
        status: typeof payload.status === 'number' ? payload.status : 1,
      },
    });
  }

  async updateProvider(id: number, payload: Partial<ProviderPayload>) {
    const existing = await this.prisma.providers.findUnique({ where: { provider_id: id } });
    if (!existing) throw new NotFoundException('Không tìm thấy nhà cung cấp.');

    const data: any = {};
    if (payload.name !== undefined) {
      if (!payload.name.trim()) throw new BadRequestException('Tên nhà cung cấp không được để trống.');
      const duplicate = await this.prisma.providers.findFirst({
        where: { name: payload.name.trim(), NOT: { provider_id: id } },
      });
      if (duplicate) throw new BadRequestException('Tên nhà cung cấp đã được sử dụng.');
      data.name = payload.name.trim();
    }
    if (payload.type !== undefined) data.type = payload.type;
    if (payload.contact_info !== undefined) data.contact_info = payload.contact_info?.trim() || null;
    if (payload.status !== undefined) data.status = Number(payload.status);

    return this.prisma.providers.update({
      where: { provider_id: id },
      data,
    });
  }

  async deleteProvider(id: number) {
    const countTransports = await this.prisma.transports.count({ where: { provider_id: id } });
    if (countTransports > 0) {
      throw new BadRequestException(
        `Đối tác này đang có ${countTransports} phương tiện liên kết. Hãy xóa hoặc chuyển phương tiện sang đối tác khác trước.`,
      );
    }
    return this.prisma.providers.delete({ where: { provider_id: id } });
  }
}
