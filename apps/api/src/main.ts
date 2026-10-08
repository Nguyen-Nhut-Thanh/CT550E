import "reflect-metadata";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(__dirname, "../../../.env") });

import { Logger, Module, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { connectMongo, disconnectMongo, prisma } from "database";
import { BannersModule } from "./modules/banners/banners.module";
import { FlashDealsModule } from "./modules/flash-deals/flash-deals.module";
import { ToursModule } from "./modules/tours/tours.module";
import { FeaturedToursModule } from "./modules/featured-tours/featured-tours.module";
import { LocationsModule } from "./modules/locations/locations.module";
import { MailModule } from "./modules/mail/mail.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";

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
  ]
})
class AppModule {}

const logger = new Logger("Startup");

function logError(message: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error(`${message}: ${detail}`);
}

async function connectDatabases(): Promise<void> {
  logger.log("Đang kết nối PostgreSQL...");
  await prisma.$connect();
  logger.log("Kết nối PostgreSQL thành công.");

  logger.log("Đang kết nối MongoDB...");
  await connectMongo();
  logger.log("Kết nối MongoDB thành công.");
}

async function bootstrap(): Promise<void> {
  const port = Number(process.env.API_PORT ?? 4000);

  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    );
    app.enableCors({
      origin: ["http://localhost:3000"],
      credentials: true
    });
    await app.listen(port);
    await connectDatabases();

    const shutdown = async (): Promise<void> => {
      await app.close();
      const [postgresqlResult, mongoResult] = await Promise.allSettled([
        prisma.$disconnect(),
        disconnectMongo()
      ]);

      if (postgresqlResult.status === "fulfilled") {
        logger.log("Đóng PostgreSQL thành công.");
      } else {
        logError("Không thể đóng PostgreSQL", postgresqlResult.reason);
      }

      if (mongoResult.status === "fulfilled") {
        logger.log("Đóng MongoDB thành công.");
      } else {
        logError("Không thể đóng MongoDB", mongoResult.reason);
      }

      process.exit(0);
    };

    process.once("SIGINT", () => void shutdown());
    process.once("SIGTERM", () => void shutdown());
  } catch (error) {
    logError("Không thể kết nối cơ sở dữ liệu", error);
    await prisma.$disconnect().catch((disconnectError: unknown) => {
      logError("Không thể đóng PostgreSQL", disconnectError);
    });
    await disconnectMongo().catch((disconnectError: unknown) => {
      logError("Không thể đóng MongoDB", disconnectError);
    });
    process.exitCode = 1;
  }
}

void bootstrap();
