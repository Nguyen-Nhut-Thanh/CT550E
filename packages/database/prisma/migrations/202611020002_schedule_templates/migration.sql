CREATE TABLE "tour_schedule_templates" (
  "tour_id" INTEGER NOT NULL,
  "data" JSONB NOT NULL,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "tour_schedule_templates_pkey" PRIMARY KEY ("tour_id"),
  CONSTRAINT "tour_schedule_templates_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("tour_id") ON DELETE CASCADE ON UPDATE CASCADE
);
