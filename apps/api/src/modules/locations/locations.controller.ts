import { Controller, Get } from '@nestjs/common';
import { LocationsPublicService } from './locations-public.service';

@Controller('locations')
export class LocationsController {
  constructor(
    private readonly locationsPublicService: LocationsPublicService,
  ) {}

  @Get('featured-destinations')
  getFeaturedDestinations() {
    return this.locationsPublicService.getFeaturedDestinations();
  }

  @Get('nav')
  getNavigationData() {
    return this.locationsPublicService.getNavigationData();
  }
}
