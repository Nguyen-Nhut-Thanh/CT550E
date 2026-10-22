import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { BannersModule } from './modules/banners/banners.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ChatModule } from './modules/chat/chat.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { FeaturedToursModule } from './modules/featured-tours/featured-tours.module';
import { FlashDealsModule } from './modules/flash-deals/flash-deals.module';
import { LocationsModule } from './modules/locations/locations.module';
import { MailModule } from './modules/mail/mail.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PostsModule } from './modules/posts/posts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { ToursModule } from './modules/tours/tours.module';
import { UsersModule } from './modules/users/users.module';
import { VouchersModule } from './modules/vouchers/vouchers.module';

@Module({
  imports: [
    MailModule,
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
export class AppModule {}
