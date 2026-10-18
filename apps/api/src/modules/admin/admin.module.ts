import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { MailModule } from '../mail/mail.module';
import { ToursController } from './tours/tours.controller';
import { LocationsController } from './locations/locations.controller';
import { BannersController } from './banners/banners.controller';
import { FlashDealsController } from './flash-deals/flash-deals.controller';
import { UsersController } from './users/users.controller';
import { PostsController } from './posts/posts.controller';
import { VouchersController } from './vouchers/vouchers.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { ToursAdminService } from './tours/tours-admin.service';
import { LocationsAdminService } from './locations/locations-admin.service';
import { BannersService } from './banners/banners.service';
import { FlashDealsService } from './flash-deals/flash-deals.service';
import { UsersService } from './users/users.service';
import { PostsService } from './posts/posts.service';
import { VouchersService } from './vouchers/vouchers.service';
import { DashboardService } from './dashboard/dashboard.service';
import { LocationsPublicService } from '../locations/locations-public.service';
@Module({ imports: [MailModule], controllers: [ToursController,LocationsController,BannersController,FlashDealsController,UsersController,PostsController,VouchersController,DashboardController], providers: [PrismaService,ToursAdminService,LocationsAdminService,BannersService,FlashDealsService,UsersService,PostsService,VouchersService,DashboardService,LocationsPublicService] })
export class AdminModule {}
