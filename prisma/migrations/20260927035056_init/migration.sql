-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MODARATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'DEACTIVATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('EXECUTIVE', 'ELECTION');

-- CreateTable
CREATE TABLE "users" (
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "postId" TEXT NOT NULL,
    "postTitle" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "committeeId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("postId")
);

-- CreateTable
CREATE TABLE "user_posts" (
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "committeeId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_posts_pkey" PRIMARY KEY ("postId","userId")
);

-- CreateTable
CREATE TABLE "committees" (
    "committeeId" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "committees_pkey" PRIMARY KEY ("committeeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_posts_userId_committeeId_key" ON "user_posts"("userId", "committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "committees_year_key" ON "committees"("year");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("committeeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_posts" ADD CONSTRAINT "user_posts_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "committees"("committeeId") ON DELETE CASCADE ON UPDATE CASCADE;
