-- Add roomCode column with default empty string
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "roomCode" TEXT NOT NULL DEFAULT '';

-- Give existing rows a unique code
UPDATE "Room" SET "roomCode" = upper(substring(md5(random()::text), 1, 6)) WHERE "roomCode" = '';

-- Add unique constraint
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomCode_key" UNIQUE ("roomCode");

-- Add maxUsers column
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "maxUsers" INTEGER NOT NULL DEFAULT 3;