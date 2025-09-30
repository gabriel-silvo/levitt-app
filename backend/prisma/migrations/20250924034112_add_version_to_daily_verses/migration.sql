/*
  Warnings:

  - Added the required column `version` to the `daily_verses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."daily_verses" ADD COLUMN     "version" TEXT NOT NULL;
