-- CreateTable
CREATE TABLE "_UserLikedTracks" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserLikedTracks_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserLikedTracks_B_index" ON "_UserLikedTracks"("B");

-- AddForeignKey
ALTER TABLE "_UserLikedTracks" ADD CONSTRAINT "_UserLikedTracks_A_fkey" FOREIGN KEY ("A") REFERENCES "Track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserLikedTracks" ADD CONSTRAINT "_UserLikedTracks_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
