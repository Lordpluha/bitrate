-- AlterTable
ALTER TABLE "SupportConversation" ADD COLUMN     "externalId" VARCHAR(64);

-- CreateIndex
CREATE UNIQUE INDEX "SupportConversation_channel_externalId_key" ON "SupportConversation"("channel", "externalId");
