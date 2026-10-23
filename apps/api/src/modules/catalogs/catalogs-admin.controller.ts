import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../auth/admin.guard';
import { CatalogsAdminService } from "./catalogs-admin.service";
@Controller()
@UseGuards(AdminAuthGuard)
export class CatalogsAdminController {
    constructor(private readonly toursAdminService: CatalogsAdminService) { }
    @Get('admin/catalogs/hotels')
    listHotels() {
        return this.toursAdminService.listHotels();
    }
    @Get('admin/catalogs/hotels/:id/room-types')
    listRoomTypes(
    @Param('id')
    id: string) {
        return this.toursAdminService.listHotelRoomTypes(Number(id));
    }
    @Get('admin/catalogs/transports')
    listAllTransports() {
        return this.toursAdminService.listAllTransports();
    }
    @Get('admin/transports')
    async listTransportOptions() {
        return { items: await this.toursAdminService.listAllTransports() };
    }
}
