-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYE', 'CLIENT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ENTRADA', 'COCINA', 'RECOGER', 'ENTREGADO');

-- CreateTable
CREATE TABLE "Session" (
    "sid" VARCHAR(255) NOT NULL,
    "sess" JSONB NOT NULL,
    "expire" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sid")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rolE" "Role" NOT NULL DEFAULT 'CLIENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "numberOrden" SERIAL NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ENTRADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "imagen" TEXT,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "id_order" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_id_order_fkey" FOREIGN KEY ("id_order") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
