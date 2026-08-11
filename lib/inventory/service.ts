import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { InventoryStockStatus } from "@/app/generated/prisma/enums";
import { AppError } from "@/lib/api/errors";
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

function stockStatus(
  quantity: number,
  minimumStock: number,
): InventoryStockStatus {
  if (quantity === 0) {
    return "OUT_OF_STOCK";
  }

  return quantity <= minimumStock ? "LOW_STOCK" : "IN_STOCK";
}

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
      if (errorCode(error) === "P2034" && attempt < 2) {
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
    return await serializableTransaction(async (transaction) => {
      await assertOwnedCategory(transaction, ownerId, input.categoryId);

      return transaction.product.create({
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
              quantity: 0,
              averageUnitCost: new Prisma.Decimal(0),
              status: "OUT_OF_STOCK",
            },
          },
          activities: {
            create: {
              ownerId,
              performedById: ownerId,
              type: "PRODUCT_ADDED",
              message: `${input.name} was added to the product catalog.`,
            },
          },
        },
        select: { id: true, name: true, sku: true },
      });
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

export async function updateProduct(
  ownerId: string,
  productId: string,
  input: UpdateProductInput,
) {
  try {
    return await serializableTransaction(async (transaction) => {
      const product = await transaction.product.findFirst({
        where: { id: productId, ownerId },
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
          active: input.active,
          inventory: {
            update: {
              status: stockStatus(quantity, input.minimumStock),
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
  return serializableTransaction(async (transaction) => {
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

    const supplier = input.supplierId
      ? await transaction.supplier.findFirst({
          where: { id: input.supplierId, ownerId, active: true },
          select: { id: true, name: true },
        })
      : null;

    if (input.supplierId && !supplier) {
      throw new AppError(404, "SUPPLIER_NOT_FOUND", "Supplier was not found.");
    }

    const previousQuantity = product.inventory.quantity;
    const newQuantity = previousQuantity + input.quantity;
    const purchasePrice = new Prisma.Decimal(input.purchasePrice);
    const previousValue = product.inventory.averageUnitCost.mul(previousQuantity);
    const incomingValue = purchasePrice.mul(input.quantity);
    const averageUnitCost = previousValue
      .add(incomingValue)
      .div(newQuantity)
      .toDecimalPlaces(2);

    await transaction.inventory.update({
      where: { productId: product.id },
      data: {
        quantity: newQuantity,
        averageUnitCost,
        status: stockStatus(newQuantity, product.minimumStock),
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
        supplierId: supplier?.id,
        counterpartyName: supplier?.name,
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
      newQuantity,
    };
  });
}

export async function recordStockOut(ownerId: string, input: StockOutInput) {
  return serializableTransaction(async (transaction) => {
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

    if (input.quantity > available) {
      throw new AppError(
        409,
        "INSUFFICIENT_STOCK",
        `Insufficient stock. Only ${available} units are available.`,
      );
    }

    const customer = input.customerId
      ? await transaction.customer.findFirst({
          where: { id: input.customerId, ownerId, active: true },
          select: { id: true, name: true },
        })
      : null;

    if (input.customerId && !customer) {
      throw new AppError(404, "CUSTOMER_NOT_FOUND", "Customer was not found.");
    }

    const newQuantity = available - input.quantity;
    const updated = await transaction.inventory.updateMany({
      where: {
        productId: product.id,
        quantity: { gte: input.quantity },
      },
      data: {
        quantity: { decrement: input.quantity },
        status: stockStatus(newQuantity, product.minimumStock),
      },
    });

    if (updated.count !== 1) {
      throw new AppError(
        409,
        "INSUFFICIENT_STOCK",
        `Insufficient stock. Only ${available} units are available.`,
      );
    }

    const counterpartyName = customer?.name ?? input.recipientName;
    const inventoryTransaction = await transaction.inventoryTransaction.create({
      data: {
        productId: product.id,
        type: "STOCK_OUT",
        quantity: input.quantity,
        previousQuantity: available,
        newQuantity,
        unitCost: product.inventory.averageUnitCost,
        customerId: customer?.id,
        counterpartyName,
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
        message: `${input.quantity} units of ${product.name} were removed.`,
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
      newQuantity,
    };
  });
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
