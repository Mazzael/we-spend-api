-- AlterTable
ALTER TABLE "users" ADD COLUMN     "couple_id" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;
