import "server-only";

import { Prisma } from "@/app/generated/prisma/client";
import type { InventoryStockStatus } from "@/app/generated/prisma/enums";
import {
  buildDailyInventoryTrend,
  buildProductPerformance,
  type DailyMovementTotal,
} from "@/lib/inventory/calculations";
import { logInventoryEvent } from "@/lib/inventory/logging";
import { prisma } from "@/lib/prisma";
import type { InventorySearchInput } from "@/validations/inventory";

export const DEFAULT_BUSINESS_SETTINGS = {
  companyName: "My Business",
  currency: "USD",
  defaultLowStockThreshold: 5,
  preventNegativeStock: true,
} as const;

const INVENTORY_PAGE_SIZE = 20;

type DailyMovementSummaryRow = {
  day: string;
  type: "STOCK_IN" | "STOCK_OUT";
  quantity: bigint;
};

export async function getDashboardData(ownerId: string) {
  const trendDays = 30;
  const trendStart = new Date();
  trendStart.setUTCHours(0, 0, 0, 0);
  trendStart.setUTCDate(trendStart.getUTCDate() - (trendDays - 1));

  const [
    settings,
    products,
    productMovementTotals,
    trendRows,
    recentMovements,
  ] = await Promise.all([
    prisma.businessSettings.findUnique({ where: { userId: ownerId } }),
    prisma.product.findMany({
      where: { ownerId, active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        minimumStock: true,
        inventory: { select: { quantity: true, status: true } },
      },
    }),
    prisma.inventoryTransaction.groupBy({
      by: ["productId", "type"],
      where: { product: { ownerId } },
      _sum: { quantity: true },
    }),
    prisma.$queryRaw<DailyMovementSummaryRow[]>(Prisma.sql`
      SELECT
        TO_CHAR(
          DATE_TRUNC('day', movement."occurredAt" AT TIME ZONE 'UTC'),
          'YYYY-MM-DD'
        ) AS "day",
        movement."type" AS "type",
        SUM(movement."quantity")::bigint AS "quantity"
      FROM "InventoryTransaction" AS movement
      INNER JOIN "Product" AS product
        ON product."id" = movement."productId"
      WHERE product."ownerId" = ${ownerId}
        AND movement."occurredAt" >= ${trendStart}
      GROUP BY "day", movement."type"
      ORDER BY "day" ASC
    `),
    prisma.inventoryTransaction.findMany({
      where: { product: { ownerId } },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
      take: 8,
      select: {
        id: true,
        type: true,
        quantity: true,
        previousQuantity: true,
        newQuantity: true,
        occurredAt: true,
        createdAt: true,
        product: { select: { id: true, name: true, sku: true } },
        performedBy: { select: { name: true } },
      },
    }),
  ]);

  const movementByType = productMovementTotals.reduce(
    (totals, movement) => {
      totals.set(
        movement.type,
        (totals.get(movement.type) ?? 0) + (movement._sum.quantity ?? 0),
      );
      return totals;
    },
    new Map<"STOCK_IN" | "STOCK_OUT", number>(),
  );
  const activeProductIds = new Set(products.map((product) => product.id));
  const productPerformance = buildProductPerformance(
    products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      minimumStock: product.minimumStock,
      quantity: product.inventory?.quantity ?? 0,
      status: product.inventory?.status ?? "OUT_OF_STOCK",
    })),
    productMovementTotals
      .filter((movement) => activeProductIds.has(movement.productId))
      .map((movement) => ({
        productId: movement.productId,
        type: movement.type,
        quantity: movement._sum.quantity ?? 0,
      })),
  );
  const lowStockProducts = productPerformance
    .filter((product) => product.status !== "IN_STOCK")
    .sort(
      (left, right) =>
        left.quantity - right.quantity || left.name.localeCompare(right.name),
    );
  const lowestSellingProducts = [...productPerformance].sort(
    (left, right) =>
      left.unitsSold - right.unitsSold || left.name.localeCompare(right.name),
  );
  const dailyMovementRows: DailyMovementTotal[] = trendRows.map((row) => ({
    day: row.day,
    type: row.type,
    quantity: Number(row.quantity),
  }));

  const dashboard = {
    settings: settings ?? DEFAULT_BUSINESS_SETTINGS,
    metrics: {
      totalProducts: products.length,
      totalInventoryQuantity: productPerformance.reduce(
        (total, product) => total + product.quantity,
        0,
      ),
      totalUnitsReceived: movementByType.get("STOCK_IN") ?? 0,
      totalUnitsSold: movementByType.get("STOCK_OUT") ?? 0,
      lowStockItems: lowStockProducts.length,
    },
    productPerformance,
    bestSellingProducts: productPerformance.slice(0, 5),
    lowestSellingProducts: lowestSellingProducts.slice(0, 5),
    lowStockProducts: lowStockProducts.slice(0, 8),
    inventoryTrend: buildDailyInventoryTrend(
      dailyMovementRows,
      trendStart,
      trendDays,
    ),
    recentMovements,
  };

  logInventoryEvent({
    operation: "dashboard_query",
    stage: "query_succeeded",
    userId: ownerId,
    productCount: products.length,
    rowCount: recentMovements.length,
    newQuantity: dashboard.metrics.totalInventoryQuantity,
    databaseOperation:
      "read products, inventory movements, settings, and dashboard aggregates",
  });

  return dashboard;
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
        activities: {
          where: { type: { not: "PRODUCT_ADDED" } },
          take: 1,
          select: { id: true },
        },
        _count: { select: { transactions: true } },
      },
    }),
    prisma.category.findMany({
      where: { ownerId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const inventoryPage = {
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
      hasHistory:
        product._count.transactions > 0 ||
        (product.inventory?.quantity ?? 0) > 0 ||
        product.activities.length > 0,
    })),
    categories,
    pagination: {
      page: filters.page,
      pageSize: INVENTORY_PAGE_SIZE,
      total,
      totalPages: Math.max(1, Math.ceil(total / INVENTORY_PAGE_SIZE)),
    },
  };

  logInventoryEvent({
    operation: "inventory_query",
    stage: "query_succeeded",
    userId: ownerId,
    productCount: total,
    rowCount: inventoryPage.rows.length,
    databaseOperation: "read filtered inventory products and quantities",
  });

  return inventoryPage;
}

export async function getProducts(ownerId: string) {
  return prisma.product
    .findMany({
      where: { ownerId, active: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        unitPrice: true,
        minimumStock: true,
        active: true,
        category: { select: { name: true } },
        inventory: { select: { quantity: true, status: true } },
        activities: {
          where: { type: { not: "PRODUCT_ADDED" } },
          take: 1,
          select: { id: true },
        },
        _count: { select: { transactions: true } },
      },
    })
    .then((products) =>
      products.map(({ activities, _count, ...product }) => ({
        ...product,
        unitPrice: product.unitPrice.toNumber(),
        hasHistory:
          _count.transactions > 0 ||
          (product.inventory?.quantity ?? 0) > 0 ||
          activities.length > 0,
      })),
    );
}

export async function getProductDetail(ownerId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, ownerId, active: true },
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
      activities: {
        where: { type: { not: "PRODUCT_ADDED" } },
        take: 1,
        select: { id: true },
      },
      _count: { select: { transactions: true } },
    },
  });

  if (!product) {
    logInventoryEvent({
      operation: "inventory_query",
      stage: "product_not_found",
      userId: ownerId,
      productId,
      rowCount: 0,
      databaseOperation: "read product inventory and movement history",
    });
    return null;
  }

  const { activities, _count, ...productFields } = product;
  const detail = {
    ...productFields,
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
    hasHistory:
      _count.transactions > 0 ||
      (product.inventory?.quantity ?? 0) > 0 ||
      activities.length > 0,
  };

  logInventoryEvent({
    operation: "inventory_query",
    stage: "product_query_succeeded",
    userId: ownerId,
    productId,
    newQuantity: detail.inventory?.quantity ?? 0,
    rowCount: detail.transactions.length,
    databaseOperation: "read product inventory and movement history",
  });

  return detail;
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
  return { products: await getStockProductOptions(ownerId) };
}

export async function getStockOutFormData(ownerId: string) {
  return { products: await getStockProductOptions(ownerId) };
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
