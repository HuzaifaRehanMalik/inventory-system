import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import { AppError } from "@/lib/api/errors";
import {
  calculateReceivedQuantity,
  calculateSoldQuantity,
  calculateStockStatus,
  InventoryQuantityError,
} from "@/lib/inventory/calculations";
import { logInventoryEvent } from "@/lib/inventory/logging";
import { prisma } from "@/lib/prisma";
import type {
  CreateCategoryInput,
  CreateCustomerInput,
  CreateProductInput,
  CreateSupplierInput,
  StockInInput,
  StockOutInput,
  UpdateBusinessSettingsInput,
  UpdateProductInput,
} from "@/validations/inventory";

const TRANSACTION_OPTIONS = {
  isolationLevel: "Serializable" as const,
  maxWait: 10_000,
  timeout: 10_000,
};

function errorCode(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
}

async function serializableTransaction<T>(
  operation: (transaction: Prisma.TransactionClient) => Promise<T>,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, TRANSACTION_OPTIONS);
    } catch (error) {
      if (errorCode(error) === "P2034") {
        continue;
      }

      throw error;
    }
  }

  throw new AppError(
    409,
    "INVENTORY_CONFLICT",
    "Inventory changed during this request. Please try again.",
  );
}

async function assertOwnedCategory(
  transaction: Prisma.TransactionClient,
  ownerId: string,
  categoryId?: string,
) {
  if (!categoryId) {
    return;
  }

  const category = await transaction.category.findFirst({
    where: { id: categoryId, ownerId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError(404, "CATEGORY_NOT_FOUND", "Category was not found.");
  }
}

export async function createProduct(
  ownerId: string,
  input: CreateProductInput,
) {
  try {
    const result = await serializableTransaction(async (transaction) => {
      await assertOwnedCategory(transaction, ownerId, input.categoryId);
      let initialQuantity: number;

      try {
        initialQuantity = calculateReceivedQuantity(0, input.initialQuantity);
      } catch (error) {
        throw quantityAppError(error);
      }

      const initialStatus = calculateStockStatus(
        initialQuantity,
        input.minimumStock,
      );

      logInventoryEvent({
        operation: "create_product",
        stage: "database_operation",
        userId: ownerId,
        quantity: initialQuantity,
        newQuantity: initialQuantity,
        databaseOperation:
          "create Product, Inventory, opening InventoryTransaction, and InventoryActivity",
      });

      const product = await transaction.product.create({
        data: {
          ownerId,
          name: input.name,
          sku: input.sku,
          description: input.description,
          categoryId: input.categoryId,
          unitPrice: new Prisma.Decimal(input.unitPrice),
          minimumStock: input.minimumStock,
          inventory: {
            create: {
              quantity: initialQuantity,
              averageUnitCost: new Prisma.Decimal(0),
              status: initialStatus,
            },
          },
          transactions:
            initialQuantity > 0
              ? {
                  create: {
                    type: "STOCK_IN",
                    quantity: initialQuantity,
                    previousQuantity: 0,
                    newQuantity: initialQuantity,
                    unitCost: new Prisma.Decimal(0),
                    referenceNumber: "OPENING-STOCK",
                    notes: "Opening quantity recorded when the product was added.",
                    occurredAt: new Date(),
                    performedById: ownerId,
                  },
                }
              : undefined,
          activities: {
            create: [
              {
                ownerId,
                performedById: ownerId,
                type: "PRODUCT_ADDED",
                message: `${input.name} was added to inventory.`,
              },
              ...(initialQuantity > 0
                ? [
                    {
                      ownerId,
                      performedById: ownerId,
                      type: "STOCK_RECEIVED" as const,
                      message: `${initialQuantity} opening units of ${input.name} were received.`,
                    },
                  ]
                : []),
            ],
          },
        },
        select: {
          id: true,
          name: true,
          sku: true,
          inventory: { select: { quantity: true } },
          transactions: {
            orderBy: { createdAt: "asc" },
            take: 1,
            select: { id: true },
          },
        },
      });

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        newQuantity: product.inventory?.quantity ?? initialQuantity,
        transactionId: product.transactions[0]?.id,
      };
    });

    logInventoryEvent({
      operation: "create_product",
      stage: "database_committed",
      userId: ownerId,
      productId: result.id,
      quantity: input.initialQuantity,
      newQuantity: result.newQuantity,
      transactionId: result.transactionId,
      databaseOperation: "serializable inventory creation transaction",
    });

    return result;
  } catch (error) {
    if (errorCode(error) === "P2002") {
      throw new AppError(
        409,
        "SKU_ALREADY_EXISTS",
        "A product with this SKU already exists.",
      );
    }

    throw error;
  }
}

export async function updateProduct(
  ownerId: string,
  productId: string,
  input: UpdateProductInput,
) {
  try {
    return await serializableTransaction(async (transaction) => {
      const product = await transaction.product.findFirst({
        where: { id: productId, ownerId, active: true },
        select: {
          id: true,
          name: true,
          inventory: { select: { quantity: true } },
        },
      });

      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", "Product was not found.");
      }

      await assertOwnedCategory(transaction, ownerId, input.categoryId);
      const quantity = product.inventory?.quantity ?? 0;

      const updated = await transaction.product.update({
        where: { id: product.id },
        data: {
          name: input.name,
          sku: input.sku,
          description: input.description,
          categoryId: input.categoryId ?? null,
          unitPrice: new Prisma.Decimal(input.unitPrice),
          minimumStock: input.minimumStock,
          inventory: {
            update: {
              status: calculateStockStatus(quantity, input.minimumStock),
            },
          },
          activities: {
            create: {
              ownerId,
              performedById: ownerId,
              type: "PRODUCT_UPDATED",
              message: `${input.name} was updated.`,
            },
          },
        },
        select: { id: true, name: true, sku: true },
      });

      return updated;
    });
  } catch (error) {
    if (errorCode(error) === "P2002") {
      throw new AppError(
        409,
        "SKU_ALREADY_EXISTS",
        "A product with this SKU already exists.",
      );
    }

    throw error;
  }
}

export async function recordStockIn(ownerId: string, input: StockInInput) {
  const result = await serializableTransaction(async (transaction) => {
    const product = await transaction.product.findFirst({
      where: { id: input.productId, ownerId, active: true },
      select: {
        id: true,
        name: true,
        minimumStock: true,
        inventory: {
          select: { quantity: true, averageUnitCost: true },
        },
      },
    });

    if (!product?.inventory) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product was not found.");
    }

    const previousQuantity = product.inventory.quantity;
    let newQuantity: number;

    try {
      newQuantity = calculateReceivedQuantity(previousQuantity, input.quantity);
    } catch (error) {
      throw quantityAppError(error);
    }

    const purchasePrice = new Prisma.Decimal(input.purchasePrice);
    const previousValue = product.inventory.averageUnitCost.mul(previousQuantity);
    const incomingValue = purchasePrice.mul(input.quantity);
    const averageUnitCost = previousValue
      .add(incomingValue)
      .div(newQuantity)
      .toDecimalPlaces(2);

    logInventoryEvent({
      operation: "stock_in",
      stage: "database_operation",
      userId: ownerId,
      productId: product.id,
      quantity: input.quantity,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
      purchasePrice: input.purchasePrice,
      previousQuantity,
      newQuantity,
      databaseOperation:
        "update Inventory and create InventoryTransaction and InventoryActivity",
    });

    await transaction.inventory.update({
      where: { productId: product.id },
      data: {
        quantity: newQuantity,
        averageUnitCost,
        status: calculateStockStatus(newQuantity, product.minimumStock),
      },
    });

    const inventoryTransaction = await transaction.inventoryTransaction.create({
      data: {
        productId: product.id,
        type: "STOCK_IN",
        quantity: input.quantity,
        previousQuantity,
        newQuantity,
        unitCost: purchasePrice,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
        occurredAt: input.occurredAt,
        performedById: ownerId,
      },
      select: { id: true },
    });

    await transaction.inventoryActivity.create({
      data: {
        ownerId,
        performedById: ownerId,
        productId: product.id,
        type: "STOCK_RECEIVED",
        message: `${input.quantity} units of ${product.name} were received.`,
      },
    });

    return {
      transactionId: inventoryTransaction.id,
      productId: product.id,
      productName: product.name,
      previousQuantity,
      newQuantity,
    };
  });

  logInventoryEvent({
    operation: "stock_in",
    stage: "database_committed",
    userId: ownerId,
    productId: result.productId,
    quantity: input.quantity,
    occurredAt: input.occurredAt.toISOString(),
    referenceNumber: input.referenceNumber,
    previousQuantity: result.previousQuantity,
    newQuantity: result.newQuantity,
    transactionId: result.transactionId,
    databaseOperation: "serializable stock receipt transaction",
  });

  return result;
}

export async function recordStockOut(ownerId: string, input: StockOutInput) {
  const result = await serializableTransaction(async (transaction) => {
    const product = await transaction.product.findFirst({
      where: { id: input.productId, ownerId, active: true },
      select: {
        id: true,
        name: true,
        minimumStock: true,
        inventory: {
          select: { quantity: true, averageUnitCost: true },
        },
      },
    });

    if (!product?.inventory) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product was not found.");
    }

    const available = product.inventory.quantity;
    let newQuantity: number;

    try {
      newQuantity = calculateSoldQuantity(available, input.quantity);
    } catch (error) {
      throw quantityAppError(error);
    }

    logInventoryEvent({
      operation: "stock_out",
      stage: "database_operation",
      userId: ownerId,
      productId: product.id,
      quantity: input.quantity,
      occurredAt: input.occurredAt.toISOString(),
      referenceNumber: input.referenceNumber,
      previousQuantity: available,
      newQuantity,
      databaseOperation:
        "guarded Inventory decrement and create InventoryTransaction and InventoryActivity",
    });

    const updated = await transaction.inventory.updateMany({
      where: {
        productId: product.id,
        quantity: { gte: input.quantity },
      },
      data: {
        quantity: { decrement: input.quantity },
        status: calculateStockStatus(newQuantity, product.minimumStock),
      },
    });

    if (updated.count !== 1) {
      throw new AppError(
        409,
        "INSUFFICIENT_STOCK",
        `Insufficient stock. Only ${available} units are available.`,
      );
    }

    const inventoryTransaction = await transaction.inventoryTransaction.create({
      data: {
        productId: product.id,
        type: "STOCK_OUT",
        quantity: input.quantity,
        previousQuantity: available,
        newQuantity,
        unitCost: product.inventory.averageUnitCost,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
        occurredAt: input.occurredAt,
        performedById: ownerId,
      },
      select: { id: true },
    });

    const activities: Prisma.InventoryActivityCreateManyInput[] = [
      {
        ownerId,
        performedById: ownerId,
        productId: product.id,
        type: "STOCK_REMOVED",
        message: `${input.quantity} units of ${product.name} were sold.`,
      },
    ];

    if (newQuantity <= product.minimumStock) {
      activities.push({
        ownerId,
        performedById: ownerId,
        productId: product.id,
        type: "LOW_STOCK_WARNING",
        message:
          newQuantity === 0
            ? `${product.name} is out of stock.`
            : `${product.name} is low on stock with ${newQuantity} units remaining.`,
      });
    }

    await transaction.inventoryActivity.createMany({ data: activities });

    return {
      transactionId: inventoryTransaction.id,
      productId: product.id,
      productName: product.name,
      previousQuantity: available,
      newQuantity,
    };
  });

  logInventoryEvent({
    operation: "stock_out",
    stage: "database_committed",
    userId: ownerId,
    productId: result.productId,
    quantity: input.quantity,
    occurredAt: input.occurredAt.toISOString(),
    referenceNumber: input.referenceNumber,
    previousQuantity: result.previousQuantity,
    newQuantity: result.newQuantity,
    transactionId: result.transactionId,
    databaseOperation: "serializable stock sale transaction",
  });

  return result;
}

export async function deleteProduct(ownerId: string, productId: string) {
  const result = await serializableTransaction(async (transaction) => {
    const product = await transaction.product.findFirst({
      where: { id: productId, ownerId },
      select: {
        id: true,
        name: true,
        active: true,
        inventory: { select: { quantity: true } },
        _count: { select: { transactions: true } },
      },
    });

    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", "Product was not found.");
    }

    if (!product.active) {
      throw new AppError(
        409,
        "PRODUCT_ALREADY_REMOVED",
        "This product has already been archived.",
      );
    }

    const historicalActivityCount = await transaction.inventoryActivity.count({
      where: {
        productId: product.id,
        type: { not: "PRODUCT_ADDED" },
      },
    });
    const hasHistory =
      product._count.transactions > 0 ||
      (product.inventory?.quantity ?? 0) > 0 ||
      historicalActivityCount > 0;

    if (hasHistory) {
      await transaction.product.update({
        where: { id: product.id },
        data: {
          active: false,
          activities: {
            create: {
              ownerId,
              performedById: ownerId,
              type: "PRODUCT_UPDATED",
              message: `${product.name} was archived to preserve its inventory history.`,
            },
          },
        },
      });

      return {
        id: product.id,
        disposition: "archived" as const,
        hadHistory: true,
      };
    }

    await transaction.inventoryActivity.deleteMany({
      where: { productId: product.id, type: "PRODUCT_ADDED" },
    });
    await transaction.product.delete({ where: { id: product.id } });

    return {
      id: product.id,
      disposition: "deleted" as const,
      hadHistory: false,
    };
  });

  logInventoryEvent({
    operation: "delete_product",
    stage: "database_committed",
    userId: ownerId,
    productId: result.id,
    deletionDisposition: result.disposition,
    databaseOperation:
      result.disposition === "archived"
        ? "mark Product inactive and preserve inventory history"
        : "delete history-free Product and empty Inventory",
  });

  return result;
}

function quantityAppError(error: unknown) {
  if (!(error instanceof InventoryQuantityError)) {
    return error;
  }

  if (error.code === "INSUFFICIENT_STOCK") {
    return new AppError(409, error.code, error.message);
  }

  if (error.code === "QUANTITY_LIMIT_EXCEEDED") {
    return new AppError(422, error.code, error.message);
  }

  return new AppError(422, "INVALID_QUANTITY", error.message);
}

export async function createCategory(
  ownerId: string,
  input: CreateCategoryInput,
) {
  try {
    return await prisma.category.create({
      data: { ownerId, name: input.name },
      select: { id: true, name: true },
    });
  } catch (error) {
    if (errorCode(error) === "P2002") {
      throw new AppError(
        409,
        "CATEGORY_ALREADY_EXISTS",
        "A category with this name already exists.",
      );
    }

    throw error;
  }
}

export async function createSupplier(
  ownerId: string,
  input: CreateSupplierInput,
) {
  try {
    return await prisma.supplier.create({
      data: { ownerId, ...input },
      select: { id: true, name: true },
    });
  } catch (error) {
    if (errorCode(error) === "P2002") {
      throw new AppError(
        409,
        "SUPPLIER_ALREADY_EXISTS",
        "A supplier with this name already exists.",
      );
    }

    throw error;
  }
}

export async function createCustomer(
  ownerId: string,
  input: CreateCustomerInput,
) {
  try {
    return await prisma.customer.create({
      data: { ownerId, ...input },
      select: { id: true, name: true },
    });
  } catch (error) {
    if (errorCode(error) === "P2002") {
      throw new AppError(
        409,
        "CUSTOMER_ALREADY_EXISTS",
        "A customer with this name already exists.",
      );
    }

    throw error;
  }
}

export async function updateBusinessSettings(
  ownerId: string,
  input: UpdateBusinessSettingsInput,
) {
  return prisma.$transaction(async (transaction) => {
    const settings = await transaction.businessSettings.upsert({
      where: { userId: ownerId },
      update: input,
      create: { userId: ownerId, ...input },
      select: {
        companyName: true,
        currency: true,
        defaultLowStockThreshold: true,
        preventNegativeStock: true,
      },
    });

    await transaction.inventoryActivity.create({
      data: {
        ownerId,
        performedById: ownerId,
        type: "SETTINGS_UPDATED",
        message: "Inventory settings were updated.",
      },
    });

    return settings;
  });
}
