-- CreateTable
CREATE TABLE "public"."daily_verses" (
    "id" TEXT NOT NULL,
    "day_of_year" INTEGER NOT NULL,
    "verse_text" TEXT NOT NULL,
    "verse_reference" TEXT NOT NULL,

    CONSTRAINT "daily_verses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_verses_day_of_year_key" ON "public"."daily_verses"("day_of_year");
