import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type {
  HotelPayload,
  ProviderPayload,
  RoomTypePayload,
  TransportPayload,
} from 'shared';
import { AdminAuthGuard } from '../auth/admin.guard';
import { CatalogsAdminService } from './catalogs-admin.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class CatalogsAdminController {
  constructor(private readonly service: CatalogsAdminService) {}

  // ==========================================
  // EXISTING READ-ONLY CATALOGS (Backward compatibility)
  // ==========================================
  @Get('admin/catalogs/hotels')
  listHotels() {
    return this.service.listHotels();
  }

  @Get('admin/catalogs/hotels/:id/room-types')
  listRoomTypes(@Param('id') id: string) {
    return this.service.listHotelRoomTypes(Number(id));
  }

  @Get('admin/catalogs/transports')
  listAllTransports() {
    return this.service.listAllTransports();
  }

  @Get('admin/transports')
  async listTransportOptions() {
    return { items: await this.service.listAllTransports() };
  }

  // ==========================================
  // HOTELS MANAGEMENT
  // ==========================================
  @Get('admin/services/hotels')
  listAdminHotels(
    @Query('search') search?: string,
    @Query('locationId') locationId?: string,
    @Query('starRating') starRating?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listAdminHotels(
      search,
      locationId ? Number(locationId) : undefined,
      starRating ? Number(starRating) : undefined,
      status !== undefined && status !== '' ? Number(status) : undefined,
    );
  }

  @Get('admin/services/hotels/:id')
  getAdminHotel(@Param('id') id: string) {
    return this.service.getAdminHotel(Number(id));
  }

  @Post('admin/services/hotels')
  createHotel(@Body() data: HotelPayload) {
    return this.service.createHotel(data);
  }

  @Put('admin/services/hotels/:id')
  updateHotel(@Param('id') id: string, @Body() data: Partial<HotelPayload>) {
    return this.service.updateHotel(Number(id), data);
  }

  @Delete('admin/services/hotels/:id')
  deleteHotel(@Param('id') id: string) {
    return this.service.deleteHotel(Number(id));
  }

  // ==========================================
  // ROOM TYPES MANAGEMENT
  // ==========================================
  @Get('admin/services/hotels/:id/room-types')
  listHotelRoomTypesFull(@Param('id') id: string) {
    return this.service.listHotelRoomTypesFull(Number(id));
  }

  @Post('admin/services/hotels/:id/room-types')
  createRoomType(@Param('id') hotelId: string, @Body() data: RoomTypePayload) {
    return this.service.createRoomType(Number(hotelId), data);
  }

  @Put('admin/services/room-types/:id')
  updateRoomType(@Param('id') id: string, @Body() data: Partial<RoomTypePayload>) {
    return this.service.updateRoomType(Number(id), data);
  }

  @Delete('admin/services/room-types/:id')
  deleteRoomType(@Param('id') id: string) {
    return this.service.deleteRoomType(Number(id));
  }

  // ==========================================
  // TRANSPORTS MANAGEMENT
  // ==========================================
  @Get('admin/services/transports')
  listAdminTransports(
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listAdminTransports(
      search,
      type,
      providerId ? Number(providerId) : undefined,
      status !== undefined && status !== '' ? Number(status) : undefined,
    );
  }

  @Post('admin/services/transports')
  createTransport(@Body() data: TransportPayload) {
    return this.service.createTransport(data);
  }

  @Put('admin/services/transports/:id')
  updateTransport(@Param('id') id: string, @Body() data: Partial<TransportPayload>) {
    return this.service.updateTransport(Number(id), data);
  }

  @Delete('admin/services/transports/:id')
  deleteTransport(@Param('id') id: string) {
    return this.service.deleteTransport(Number(id));
  }

  // ==========================================
  // PROVIDERS MANAGEMENT
  // ==========================================
  @Get('admin/services/providers')
  listAdminProviders() {
    return this.service.listAdminProviders();
  }

  @Post('admin/services/providers')
  createProvider(@Body() data: ProviderPayload) {
    return this.service.createProvider(data);
  }

  @Put('admin/services/providers/:id')
  updateProvider(@Param('id') id: string, @Body() data: Partial<ProviderPayload>) {
    return this.service.updateProvider(Number(id), data);
  }

  @Delete('admin/services/providers/:id')
  deleteProvider(@Param('id') id: string) {
    return this.service.deleteProvider(Number(id));
  }
}
