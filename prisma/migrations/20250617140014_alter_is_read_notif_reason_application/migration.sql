-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "reason" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;
