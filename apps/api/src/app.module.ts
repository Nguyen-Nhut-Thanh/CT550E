import { Module } from '@nestjs/common';
import { DatabaseModule } from './infrastructure/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannersModule } from './modules/banners/banners.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { CatalogsModule } from './modules/catalogs/catalogs.module';
import { ChatModule } from './modules/chat/chat.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { FeaturedToursModule } from './modules/featured-tours/featured-tours.module';
import { FlashDealsModule } from './modules/flash-deals/flash-deals.module';
import { LocationsModule } from './modules/locations/locations.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PostsModule } from './modules/posts/posts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { ToursModule } from './modules/tours/tours.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';
@Module({
    imports: [
        DatabaseModule,
        SchedulesModule,
        CatalogsModule,
        AuthModule,
        BannersModule,
        FlashDealsModule,
        ToursModule,
        FeaturedToursModule,
        LocationsModule,
        ReviewsModule,
        FavoritesModule,
        BookingsModule,
        PaymentModule,
        UsersModule,
        PostsModule,
        VouchersModule,
        DashboardModule,
        ChatModule,
    ],
})
export class AppModule {
}
