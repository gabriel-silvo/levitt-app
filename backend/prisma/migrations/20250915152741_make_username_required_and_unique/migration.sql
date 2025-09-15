-- CreateEnum
CREATE TYPE "public"."MinistryRole" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('scale', 'rehearsal');

-- CreateEnum
CREATE TYPE "public"."StudyStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "phone_number" TEXT,
    "birth_date" TIMESTAMP(3),
    "avatar_url" TEXT,
    "google_id" TEXT,
    "apple_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."churches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_skills" (
    "user_id" TEXT NOT NULL,
    "skill_id" TEXT NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("user_id","skill_id")
);

-- CreateTable
CREATE TABLE "public"."ministries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "church_id" TEXT,
    "leader_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ministries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ministry_members" (
    "user_id" TEXT NOT NULL,
    "ministry_id" TEXT NOT NULL,
    "role" "public"."MinistryRole" NOT NULL DEFAULT 'member',

    CONSTRAINT "ministry_members_pkey" PRIMARY KEY ("user_id","ministry_id")
);

-- CreateTable
CREATE TABLE "public"."songs" (
    "id" TEXT NOT NULL,
    "ministry_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "default_key" TEXT,
    "default_bpm" INTEGER,
    "lyrics" TEXT,
    "chords_url" TEXT,
    "youtube_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "ministry_id" TEXT NOT NULL,
    "parent_event_id" TEXT,
    "type" "public"."EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_songs" (
    "event_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "key_override" TEXT,
    "notes" TEXT,

    CONSTRAINT "event_songs_pkey" PRIMARY KEY ("event_id","song_id")
);

-- CreateTable
CREATE TABLE "public"."event_participants" (
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "assigned_skill_id" TEXT,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."user_study_tracking" (
    "user_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "song_id" TEXT NOT NULL,
    "status" "public"."StudyStatus" NOT NULL DEFAULT 'pending',
    "last_studied_at" TIMESTAMP(3),

    CONSTRAINT "user_study_tracking_pkey" PRIMARY KEY ("user_id","event_id","song_id")
);

-- CreateTable
CREATE TABLE "public"."user_availability" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_study_resources" (
    "id" TEXT NOT NULL,
    "trackingUserId" TEXT NOT NULL,
    "trackingEventId" TEXT NOT NULL,
    "trackingSongId" TEXT NOT NULL,
    "added_by_user_id" TEXT NOT NULL,
    "resource_url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_study_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "public"."users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_apple_id_key" ON "public"."users"("apple_id");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "public"."skills"("name");

-- AddForeignKey
ALTER TABLE "public"."user_skills" ADD CONSTRAINT "user_skills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_skills" ADD CONSTRAINT "user_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ministries" ADD CONSTRAINT "ministries_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ministries" ADD CONSTRAINT "ministries_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ministry_members" ADD CONSTRAINT "ministry_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ministry_members" ADD CONSTRAINT "ministry_members_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "public"."ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."songs" ADD CONSTRAINT "songs_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "public"."ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_ministry_id_fkey" FOREIGN KEY ("ministry_id") REFERENCES "public"."ministries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_parent_event_id_fkey" FOREIGN KEY ("parent_event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_songs" ADD CONSTRAINT "event_songs_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_songs" ADD CONSTRAINT "event_songs_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_participants" ADD CONSTRAINT "event_participants_assigned_skill_id_fkey" FOREIGN KEY ("assigned_skill_id") REFERENCES "public"."skills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_study_tracking" ADD CONSTRAINT "user_study_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_study_tracking" ADD CONSTRAINT "user_study_tracking_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_study_tracking" ADD CONSTRAINT "user_study_tracking_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_availability" ADD CONSTRAINT "user_availability_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_study_resources" ADD CONSTRAINT "user_study_resources_trackingUserId_trackingEventId_tracki_fkey" FOREIGN KEY ("trackingUserId", "trackingEventId", "trackingSongId") REFERENCES "public"."user_study_tracking"("user_id", "event_id", "song_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_study_resources" ADD CONSTRAINT "user_study_resources_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
