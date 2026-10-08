import { config } from "dotenv";
import { resolve } from "node:path";
import { prisma } from "database";

config({ path: resolve(__dirname, "../.env") });

async function check() {
  await prisma.$connect();
  const toursCount = await prisma.tours.count();
  const schedulesCount = await prisma.tour_schedules.count();
  const itinerariesCount = await prisma.tour_itineraries.count();
  const locationsCount = await prisma.locations.count();
  const bannersCount = await prisma.banners.count();
  const reviewsCount = await prisma.reviews.count();

  console.log("DB Counts:", {
    toursCount,
    schedulesCount,
    itinerariesCount,
    locationsCount,
    bannersCount,
    reviewsCount
  });

  const sampleTours = await prisma.tours.findMany({
    take: 5,
    select: { tour_id: true, code: true, name: true, tour_schedules: { select: { tour_schedule_id: true, start_date: true } } }
  });
  console.log("Sample Tours:", JSON.stringify(sampleTours, null, 2));

  await prisma.$disconnect();
}

check().catch(console.error);
