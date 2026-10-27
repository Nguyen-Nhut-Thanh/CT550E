ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "content_blocks" JSONB,
  ADD COLUMN IF NOT EXISTS "author_display_name" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "published_at" TIMESTAMP(6),
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "cover_position" VARCHAR(10) NOT NULL DEFAULT 'center';
UPDATE "posts" SET "published_at" = "created_at" WHERE "status" = 1 AND "published_at" IS NULL;
