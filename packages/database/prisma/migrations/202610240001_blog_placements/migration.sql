CREATE TABLE "blog_placements" (
  "slot" INTEGER NOT NULL CHECK ("slot" BETWEEN 1 AND 9),
  "post_id" INTEGER NOT NULL,
  CONSTRAINT "blog_placements_pkey" PRIMARY KEY ("slot"),
  CONSTRAINT "blog_placements_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("post_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "blog_placements_post_id_key" ON "blog_placements"("post_id");
