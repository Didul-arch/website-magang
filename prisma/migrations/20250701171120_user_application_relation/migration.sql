/*
  Warnings:

  - You are about to drop the column `created_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `internshipId` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `testSubmittedAt` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail` on the `vacancies` table. All the data in the column will be lost.
  - Made the column `vacancyId` on table `applications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `positionId` on table `vacancies` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VacancyLocation" AS ENUM ('ONSITE', 'REMOTE', 'HYBRID');

-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AiRecommendationStatus" AS ENUM ('RECOMMENDED', 'NOT_RECOMMENDED');

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_internshipId_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_vacancyId_fkey";

-- DropForeignKey
ALTER TABLE "vacancies" DROP CONSTRAINT "vacancies_positionId_fkey";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "created_at",
DROP COLUMN "internshipId",
DROP COLUMN "score",
DROP COLUMN "testSubmittedAt",
DROP COLUMN "updated_at",
ADD COLUMN     "applicantId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "vacancyId" SET NOT NULL;

-- AlterTable
ALTER TABLE "vacancies" DROP COLUMN "thumbnail",
ADD COLUMN     "applicants" JSONB[] DEFAULT ARRAY[]::JSONB[],
ALTER COLUMN "positionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "vacancies" ADD CONSTRAINT "vacancies_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_vacancyId_fkey" FOREIGN KEY ("vacancyId") REFERENCES "vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
