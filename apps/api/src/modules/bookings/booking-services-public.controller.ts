import { Controller, Get } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
@Controller("public/booking-services")
export class BookingServicesController {
    constructor(private readonly service: BookingsService) { }
    @Get()
    list() {
        return this.service.getExtraServices();
    }
}
