-- CreateEnum
CREATE TYPE "InventoryTransactionType" AS ENUM ('STOCK_IN', 'STOCK_OUT');

-- CreateEnum
CREATE TYPE "InventoryStockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK');

-- CreateEnum
CREATE TYPE "InventoryActivityType" AS ENUM ('PRODUCT_ADDED', 'PRODUCT_UPDATED', 'STOCK_RECEIVED', 'STOCK_REMOVED', 'LOW_STOCK_WARNING', 'SETTINGS_UPDATED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('SALE', 'PURCHASE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" VARCHAR(160) NOT NULL,
    "sku" VARCHAR(80) NOT NULL,
    "description" VARCHAR(1000),
    "unitPrice" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "minimumStock" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Product_unitPrice_check" CHECK ("unitPrice" >= 0),
    CONSTRAINT "Product_minimumStock_check" CHECK ("minimumStock" >= 0)
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "status" "InventoryStockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK',
    "averageUnitCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Inventory_quantity_check" CHECK ("quantity" >= 0),
    CONSTRAINT "Inventory_averageUnitCost_check" CHECK ("averageUnitCost" >= 0)
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(40),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(40),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "InventoryTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "previousQuantity" INTEGER NOT NULL,
    "newQuantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "supplierId" TEXT,
    "customerId" TEXT,
    "counterpartyName" VARCHAR(160),
    "referenceNumber" VARCHAR(120),
    "notes" VARCHAR(2000),
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "performedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InventoryTransaction_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "InventoryTransaction_previousQuantity_check" CHECK ("previousQuantity" >= 0),
    CONSTRAINT "InventoryTransaction_newQuantity_check" CHECK ("newQuantity" >= 0),
    CONSTRAINT "InventoryTransaction_unitCost_check" CHECK ("unitCost" >= 0)
);

-- CreateTable
CREATE TABLE "InventoryActivity" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "performedById" TEXT NOT NULL,
    "productId" TEXT,
    "type" "InventoryActivityType" NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InventoryActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" VARCHAR(120) NOT NULL,
    "totalAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Order_totalAmount_check" CHECK ("totalAmount" >= 0)
);

-- CreateTable
CREATE TABLE "BusinessSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" VARCHAR(160) NOT NULL DEFAULT 'My Business',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "defaultLowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "preventNegativeStock" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "BusinessSettings_defaultLowStockThreshold_check" CHECK ("defaultLowStockThreshold" >= 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_ownerId_name_key" ON "Category"("ownerId", "name");
CREATE INDEX "Category_ownerId_createdAt_idx" ON "Category"("ownerId", "createdAt");
CREATE UNIQUE INDEX "Product_ownerId_sku_key" ON "Product"("ownerId", "sku");
CREATE INDEX "Product_ownerId_name_idx" ON "Product"("ownerId", "name");
CREATE INDEX "Product_ownerId_categoryId_idx" ON "Product"("ownerId", "categoryId");
CREATE INDEX "Product_ownerId_active_idx" ON "Product"("ownerId", "active");
CREATE UNIQUE INDEX "Inventory_productId_key" ON "Inventory"("productId");
CREATE INDEX "Inventory_quantity_idx" ON "Inventory"("quantity");
CREATE INDEX "Inventory_status_idx" ON "Inventory"("status");
CREATE INDEX "Inventory_updatedAt_idx" ON "Inventory"("updatedAt");
CREATE UNIQUE INDEX "Supplier_ownerId_name_key" ON "Supplier"("ownerId", "name");
CREATE INDEX "Supplier_ownerId_active_idx" ON "Supplier"("ownerId", "active");
CREATE UNIQUE INDEX "Customer_ownerId_name_key" ON "Customer"("ownerId", "name");
CREATE INDEX "Customer_ownerId_active_idx" ON "Customer"("ownerId", "active");
CREATE INDEX "InventoryTransaction_productId_createdAt_idx" ON "InventoryTransaction"("productId", "createdAt");
CREATE INDEX "InventoryTransaction_performedById_createdAt_idx" ON "InventoryTransaction"("performedById", "createdAt");
CREATE INDEX "InventoryTransaction_type_occurredAt_idx" ON "InventoryTransaction"("type", "occurredAt");
CREATE INDEX "InventoryTransaction_supplierId_idx" ON "InventoryTransaction"("supplierId");
CREATE INDEX "InventoryTransaction_customerId_idx" ON "InventoryTransaction"("customerId");
CREATE INDEX "InventoryActivity_ownerId_createdAt_idx" ON "InventoryActivity"("ownerId", "createdAt");
CREATE INDEX "InventoryActivity_productId_createdAt_idx" ON "InventoryActivity"("productId", "createdAt");
CREATE INDEX "InventoryActivity_performedById_idx" ON "InventoryActivity"("performedById");
CREATE UNIQUE INDEX "Order_ownerId_type_referenceNumber_key" ON "Order"("ownerId", "type", "referenceNumber");
CREATE INDEX "Order_ownerId_status_idx" ON "Order"("ownerId", "status");
CREATE INDEX "Order_ownerId_createdAt_idx" ON "Order"("ownerId", "createdAt");
CREATE UNIQUE INDEX "BusinessSettings_userId_key" ON "BusinessSettings"("userId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryTransaction" ADD CONSTRAINT "InventoryTransaction_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryActivity" ADD CONSTRAINT "InventoryActivity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryActivity" ADD CONSTRAINT "InventoryActivity_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryActivity" ADD CONSTRAINT "InventoryActivity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessSettings" ADD CONSTRAINT "BusinessSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
