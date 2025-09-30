/*
  Warnings:

  - You are about to drop the column `day_of_year` on the `daily_verses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[month,day]` on the table `daily_verses` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `day` to the `daily_verses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `month` to the `daily_verses` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."daily_verses_day_of_year_key";

-- AlterTable
ALTER TABLE "public"."daily_verses" DROP COLUMN "day_of_year",
ADD COLUMN     "day" INTEGER NOT NULL,
ADD COLUMN     "month" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "daily_verses_month_day_key" ON "public"."daily_verses"("month", "day");
