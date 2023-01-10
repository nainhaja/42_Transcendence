-- CreateEnum
CREATE TYPE "Role" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "TypeChat" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED', 'DM');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ON', 'OFF', 'INGAME', 'INQUEUE');

-- CreateEnum
CREATE TYPE "ModeGame" AS ENUM ('MODE1', 'MODE2', 'MODE3');

-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('GREAT_WIRATE', 'LEGEND_WIRATE', 'DECENT_WIRATE', 'GREAT_LOSER', 'FIVE_WIN_STREAK', 'TEN_WIN_STREAK', 'GREAT_AVATAR', 'COMMUNICATOR');

-- CreateEnum
CREATE TYPE "MuteTime" AS ENUM ('ONE_MINUTE', 'FIVE_MINUTE', 'TEN_MINUTE', 'ONE_HOUR', 'ONE_DAY');

-- CreateEnum
CREATE TYPE "StatusGame" AS ENUM ('PLAYING', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "avatar_key" TEXT,
    "is_two_fa_enable" BOOLEAN NOT NULL,
    "two_fa_code" TEXT,
    "email" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL,
    "win" INTEGER NOT NULL,
    "lose" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "win_streak" INTEGER NOT NULL,
    "achievements" "Achievement"[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "type" "TypeChat" NOT NULL,
    "password" TEXT,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUser" (
    "chat_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "is_muted" BOOLEAN NOT NULL,
    "mute_time" "MuteTime",
    "is_banned" BOOLEAN NOT NULL,

    CONSTRAINT "ChatUser_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateTable
CREATE TABLE "MessageUser" (
    "chat_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageUser_pkey" PRIMARY KEY ("chat_id","user_id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "user1_score" INTEGER,
    "user2_score" INTEGER,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mode" "ModeGame" NOT NULL,
    "status" "StatusGame" NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- AddForeignKey
ALTER TABLE "ChatUser" ADD CONSTRAINT "ChatUser_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatUser" ADD CONSTRAINT "ChatUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUser" ADD CONSTRAINT "MessageUser_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageUser" ADD CONSTRAINT "MessageUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
