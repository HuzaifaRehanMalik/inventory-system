import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { InventoryStockStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import type { InventorySearchInput } from "@/validations/inventory";

export const DEFAULT_BUSINESS_SETTINGS = {
  companyName: "My Business",
  currency: "USD",
  defaultLowStockThreshold: 5,
  preventNegativeStock: true,
} as const;

const INVENTORY_PAGE_SIZE = 20;

type DashboardInventorySummary = {
  totalProducts: bigint;
  totalInventoryQuantity: bigint;
  lowStockItems: bigint;
  totalInventoryValue: Prisma.Decimal;
};

export async function getDashboardData(ownerId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    settings,
    inventorySummaryRows,
    movementTotals,
    pendingOrders,
    recentActivity,
  ] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { userId: ownerId } }),
    prisma.$queryRaw<DashboardInventorySummary[]>(Prisma.sql`
      SELECT
        COUNT(product."id")::bigint AS "totalProducts",
        COALESCE(SUM(inventory."quantity"), 0)::bigint AS "totalInventoryQuantity",
        COUNT(*) FILTER (
          WHERE inventory."status" IN ('LOW_STOCK', 'OUT_OF_STOCK')
        )::bigint AS "lowStockItems",
        COALESCE(
          SUM(inventory."quantity" * inventory."averageUnitCost"),
          0
        )::decimal(30, 2) AS "totalInventoryValue"
      FROM "Product" AS product
      LEFT JOIN "Inventory" AS inventory
        ON inventory."productId" = product."id"
      WHERE product."ownerId" = ${ownerId}
        AND product."active" = true
    `),
    prisma.inventoryTransaction.groupBy({
      by: ["type"],
      where: {
        product: { ownerId },
        occurredAt: { gte: today },
      },
      _sum: { quantity: true },
    }),
    prisma.order.count({ where: { ownerId, status: "PENDING" } }),
    prisma.inventoryActivity.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        type: true,
        message: true,
        createdAt: true,
        product: { select: { id: true, name: true } },
        performedBy: { select: { name: true } },
      },
    }),
  ]);

  const inventorySummary = inventorySummaryRows[0];
  const movementByType = new Map(
    movementTotals.map((movement) => [
      movement.type,
      movement._sum.quantity ?? 0,
    ]),
  );

  return {
    settings: settings ?? DEFAULT_BUSINESS_SETTINGS,
    metrics: {
      totalProducts: Number(inventorySummary?.totalProducts ?? 0),
      totalInventoryQuantity: Number(
        inventorySummary?.totalInventoryQuantity ?? 0,
      ),
      lowStockItems: Number(inventorySummary?.lowStockItems ?? 0),
      totalInventoryValue:
        inventorySummary?.totalInventoryValue.toNumber() ?? 0,
      stockInToday: movementByType.get("STOCK_IN") ?? 0,
      stockOutToday: movementByType.get("STOCK_OUT") ?? 0,
      pendingOrders,
    },
    recentActivity,
  };
}

export async function getInventoryPage(
  ownerId: string,
  filters: InventorySearchInput,
) {
  const where: Prisma.ProductWhereInput = {
    ownerId,
    active: true,
    ...(filters.query
      ? {
          OR: [
            { name: { contains: filters.query, mode: "insensitive" } },
            { sku: { contains: filters.query, mode: "insensitive" } },
            {
              category: {
                is: {
                  name: { contains: filters.query, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
    ...(filters.category ? { categoryId: filters.category } : {}),
    ...(filters.status !== "ALL"
      ? { inventory: { is: { status: filters.status } } }
      : {}),
  };

  const direction = filters.direction;
  const orderBy: Prisma.ProductOrderByWithRelationInput =
    filters.sort === "name"
      ? { name: direction }
      : filters.sort === "quantity"
        ? { inventory: { quantity: direction } }
        : filters.sort === "price"
          ? { unitPrice: direction }
          : { inventory: { updatedAt: direction } };
  const skip = (filters.page - 1) * INVENTORY_PAGE_SIZE;

  const [total, products, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: INVENTORY_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        sku: true,
        unitPrice: true,
        minimumStock: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        inventory: {
          select: {
            quantity: true,
            status: true,
            averageUnitCost: true,
            updatedAt: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    rows: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      quantity: product.inventory?.quantity ?? 0,
      unitPrice: product.unitPrice.toNumber(),
      averageUnitCost: product.inventory?.averageUnitCost.toNumber() ?? 0,
      totalValue:
        (product.inventory?.quantity ?? 0) *
        (product.inventory?.averageUnitCost.toNumber() ?? 0),
      minimumStock: product.minimumStock,
      status:
        product.inventory?.status ??
        ("OUT_OF_STOCK" satisfies InventoryStockStatus),
      updatedAt: product.inventory?.updatedAt ?? product.updatedAt,
    })),
    categories,
    pagination: {
      page: filters.page,
      pageSize: INVENTORY_PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE)),
    },
  };
}

export async function getProducts(ownerId: string) {
  return prisma.product
    .findMany({
      where: { ownerId },
      orderBy: [{ active: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        sku: true,
        unitPrice: true,
        minimumStock: true,
        active: true,
        category: { select: { name: true } },
        inventory: { select: { quantity: true, status: true } },
      },
    })
    .then((products) =>
      products.map((product) => ({
        ...product,
        unitPrice: product.unitPrice.toNumber(),
      })),
    );
}

export async function getProductDetail(ownerId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId },
    select: {
      id: true,
      name: true,
      sku: true,
      description: true,
      unitPrice: true,
      minimumStock: true,
      active: true,
      createdAt: true,
      updatedAt: true,
      category: { select: { id: true, name: true } },
      inventory: {
        select: {
          quantity: true,
          status: true,
          averageUnitCost: true,
          updatedAt: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          quantity: true,
          previousQuantity: true,
          newQuantity: true,
          unitCost: true,
          counterpartyName: true,
          referenceNumber: true,
          notes: true,
          occurredAt: true,
          createdAt: true,
          performedBy: { select: { name: true } },
        },
      },
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    unitPrice: product.unitPrice.toNumber(),
    inventory: product.inventory
      ? {
          ...product.inventory,
          averageUnitCost: product.inventory.averageUnitCost.toNumber(),
        }
      : null,
    transactions: product.transactions.map((transaction) => ({
      ...transaction,
      unitCost: transaction.unitCost.toNumber(),
    })),
  };
}

export async function getProductFormData(ownerId: string) {
  const [categories, settings] = await Promise.all([
    prisma.category.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.businessSettings.findUnique({ where: { userId: ownerId } }),
  ]);

  return {
    categories,
    defaultLowStockThreshold:
      settings?.defaultLowStockThreshold ??
      DEFAULT_BUSINESS_SETTINGS.defaultLowStockThreshold,
  };
}

export async function getStockInFormData(ownerId: string) {
  const [products, suppliers] = await Promise.all([
    getStockProductOptions(ownerId),
    prisma.supplier.findMany({
      where: { ownerId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { products, suppliers };
}

export async function getStockOutFormData(ownerId: string) {
  const [products, customers] = await Promise.all([
    getStockProductOptions(ownerId),
    prisma.customer.findMany({
      where: { ownerId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { products, customers };
}

function getStockProductOptions(ownerId: string) {
  return prisma.product.findMany({
    where: { ownerId, active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      sku: true,
      inventory: { select: { quantity: true } },
    },
  });
}

export function getCategories(ownerId: string) {
  return prisma.category.findMany({
    where: { ownerId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });
}

export function getSuppliers(ownerId: string) {
  return prisma.supplier.findMany({
    where: { ownerId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
      _count: { select: { transactions: true } },
    },
  });
}

export function getCustomers(ownerId: string) {
  return prisma.customer.findMany({
    where: { ownerId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
      createdAt: true,
      _count: { select: { transactions: true } },
    },
  });
}

export async function getBusinessSettings(ownerId: string) {
  const settings = await prisma.businessSettings.findUnique({
    where: { userId: ownerId },
  });

  return settings ?? DEFAULT_BUSINESS_SETTINGS;
}
