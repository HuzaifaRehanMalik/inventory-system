ALTER TABLE "InventoryTransaction"
ADD COLUMN "idempotencyKey" VARCHAR(128);

CREATE UNIQUE INDEX "InventoryTransaction_performedById_type_idempotencyKey_key"
ON "InventoryTransaction" ("performedById", "type", "idempotencyKey");