/*
  Warnings:

  - The values [EXPORT] on the enum `LogType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LogType_new" AS ENUM ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'IMPORT');
ALTER TABLE "system_logs" ALTER COLUMN "tipe" TYPE "LogType_new" USING ("tipe"::text::"LogType_new");
ALTER TYPE "LogType" RENAME TO "LogType_old";
ALTER TYPE "LogType_new" RENAME TO "LogType";
DROP TYPE "public"."LogType_old";
COMMIT;

-- AlterTable
ALTER TABLE "admins" ALTER COLUMN "email" DROP DEFAULT;
