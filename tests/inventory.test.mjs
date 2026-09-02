import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  errorDetailsForLog,
  errorResponse,
} from "../lib/api/errors.ts";
import {
  buildDailyInventoryTrend,
  buildProductPerformance,
  calculateReceivedQuantity,
  calculateSoldQuantity,
  calculateStockStatus,
  DATABASE_QUANTITY_MAX,
  InventoryQuantityError,
} from "../lib/inventory/calculations.ts";
import { dateInputValue } from "../lib/inventory/date.ts";
import {
  createProductSchema,
  productIdSchema,
  stockInSchema,
  stockOutSchema,
  updateProductSchema,
} from "../validations/inventory.ts";

const productId = "cm12345678901234567890";
const validProduct = {
  name: "Barcode Scanner",
  sku: "SCAN-001",
  unitPrice: 10,
  minimumStock: 0,
};

test("Add Stock validates required fields and opening quantity", () => {
  const valid = createProductSchema.parse({
    name: "Barcode Scanner",
    sku: "scan-001",
    categoryId: "",
    description: "",
    unitPrice: 99.995,
    minimumStock: 3,
    initialQuantity: 12,
  });

  assert.equal(valid.sku, "SCAN-001");
  assert.equal(valid.initialQuantity, 12);
  assert.equal(valid.unitPrice, 100);
  assert.equal(valid.categoryId, undefined);

  assert.equal(
    createProductSchema.safeParse({
      name: "",
      sku: "",
      unitPrice: 0,
      minimumStock: 0,
      initialQuantity: 0,
    }).success,
    false,
  );
  assert.equal(
    createProductSchema.safeParse({
      ...validProduct,
      initialQuantity: 0,
    }).success,
    false,
  );
  assert.equal(
    createProductSchema.safeParse({
      ...validProduct,
      initialQuantity: -1,
    }).success,
    false,
  );
  assert.equal(
    createProductSchema.safeParse({
      ...validProduct,
      initialQuantity: 1.5,
    }).success,
    false,
  );
});

test("Edit Stock rejects invalid product information", () => {
  const base = {
    name: "Barcode Scanner",
    sku: "SCAN-001",
    unitPrice: 10,
    minimumStock: 2,
  };

  assert.equal(updateProductSchema.safeParse(base).success, true);
  assert.equal(
    updateProductSchema.safeParse({ ...base, unitPrice: -0.01 }).success,
    false,
  );
  assert.equal(
    updateProductSchema.safeParse({ ...base, minimumStock: -1 }).success,
    false,
  );
});

test("Delete Product validates product identifiers", () => {
  assert.equal(productIdSchema.safeParse(productId).success, true);
  assert.equal(productIdSchema.safeParse("").success, false);
  assert.equal(productIdSchema.safeParse("not-a-product-id").success, false);
});

test("Receive Stock accepts only positive whole quantities and valid IDs", () => {
  const base = {
    productId,
    quantity: 5,
    purchasePrice: 10,
    occurredAt: "2026-08-12",
  };

  assert.equal(stockInSchema.safeParse(base).success, true);
  assert.equal(stockInSchema.safeParse({ ...base, quantity: 0 }).success, false);
  assert.equal(stockInSchema.safeParse({ ...base, quantity: -2 }).success, false);
  assert.equal(stockInSchema.safeParse({ ...base, quantity: 1.2 }).success, false);
  assert.equal(
    stockInSchema.safeParse({ ...base, productId: "not-a-product-id" }).success,
    false,
  );
});

test("movement references are optional and duplicate values remain supported", () => {
  const duplicateReference = "DELIVERY-2026-001";
  const base = {
    productId,
    quantity: 1,
    occurredAt: "2026-08-12",
    referenceNumber: duplicateReference,
  };

  assert.equal(
    stockInSchema.safeParse({ ...base, purchasePrice: 10 }).success,
    true,
  );
  assert.equal(
    stockInSchema.safeParse({ ...base, purchasePrice: 12 }).success,
    true,
  );
  assert.equal(stockOutSchema.safeParse(base).success, true);
});

test("all quantity schemas accept representative values without an artificial cap", () => {
  const validQuantities = [1, 10, 100, 1_000_000_001];

  for (const quantity of validQuantities) {
    assert.equal(
      createProductSchema.safeParse({
        ...validProduct,
        initialQuantity: quantity,
      }).success,
      true,
    );
    assert.equal(
      stockInSchema.safeParse({
        productId,
        quantity,
        purchasePrice: 10,
        occurredAt: "2026-08-12",
      }).success,
      true,
    );
    assert.equal(
      stockOutSchema.safeParse({
        productId,
        quantity,
        occurredAt: "2026-08-12",
      }).success,
      true,
    );
  }
});

test("all quantity schemas reject empty, non-numeric, non-positive, and decimal values", () => {
  const invalidQuantities = ["", "not-a-number", 0, -1, 1.5];

  for (const quantity of invalidQuantities) {
    assert.equal(
      createProductSchema.safeParse({
        ...validProduct,
        initialQuantity: quantity,
      }).success,
      false,
    );
    assert.equal(
      stockInSchema.safeParse({
        productId,
        quantity,
        purchasePrice: 10,
        occurredAt: "2026-08-12",
      }).success,
      false,
    );
    assert.equal(
      stockOutSchema.safeParse({
        productId,
        quantity,
        occurredAt: "2026-08-12",
      }).success,
      false,
    );
  }
});

test("quantity inputs have compatible native constraints and no max attribute", async () => {
  const formFiles = [
    "components/inventory/product-form.tsx",
    "components/inventory/stock-in-form.tsx",
    "components/inventory/stock-out-form.tsx",
  ];

  for (const formFile of formFiles) {
    const source = await readFile(new URL(`../${formFile}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\bmax\s*=/, `${formFile} must not set a quantity max`);
    assert.match(source, /min="1"/, `${formFile} must require a positive quantity`);
    assert.match(source, /step="1"/, `${formFile} must require a whole quantity`);
  }
});

test("Sell Stock cannot exceed availability or make inventory negative", () => {
  assert.equal(calculateSoldQuantity(10, 4), 6);
  assert.equal(calculateSoldQuantity(10, 10), 0);
  assert.throws(
    () => calculateSoldQuantity(10, 11),
    (error) =>
      error instanceof InventoryQuantityError &&
      error.code === "INSUFFICIENT_STOCK",
  );
  assert.throws(() => calculateSoldQuantity(10, 0), InventoryQuantityError);
  assert.throws(() => calculateSoldQuantity(10, -1), InventoryQuantityError);

  const validSale = stockOutSchema.safeParse({
    productId,
    quantity: 1,
    occurredAt: "2026-08-12",
  });
  assert.equal(validSale.success, true);
});

test("Receive Stock prevents overflow and invalid quantities", () => {
  assert.equal(calculateReceivedQuantity(10, 5), 15);
  assert.equal(calculateReceivedQuantity(10, 1_000_000_001), 1_000_000_011);
  assert.throws(() => calculateReceivedQuantity(10, 0), InventoryQuantityError);
  assert.throws(() => calculateReceivedQuantity(10, -1), InventoryQuantityError);
  assert.throws(
    () => calculateReceivedQuantity(DATABASE_QUANTITY_MAX, 1),
    (error) =>
      error instanceof InventoryQuantityError &&
      error.code === "QUANTITY_LIMIT_EXCEEDED",
  );
});

test("stock status and low-stock boundaries are calculated correctly", () => {
  assert.equal(calculateStockStatus(0, 5), "OUT_OF_STOCK");
  assert.equal(calculateStockStatus(5, 5), "LOW_STOCK");
  assert.equal(calculateStockStatus(6, 5), "IN_STOCK");
});

test("product performance identifies highest and lowest sales", () => {
  const products = [
    {
      id: "a",
      name: "Alpha",
      sku: "A",
      minimumStock: 2,
      quantity: 5,
      status: "IN_STOCK",
    },
    {
      id: "b",
      name: "Beta",
      sku: "B",
      minimumStock: 3,
      quantity: 1,
      status: "LOW_STOCK",
    },
    {
      id: "c",
      name: "Gamma",
      sku: "C",
      minimumStock: 1,
      quantity: 0,
      status: "OUT_OF_STOCK",
    },
  ];
  const performance = buildProductPerformance(products, [
    { productId: "a", type: "STOCK_IN", quantity: 15 },
    { productId: "a", type: "STOCK_OUT", quantity: 10 },
    { productId: "b", type: "STOCK_IN", quantity: 3 },
    { productId: "b", type: "STOCK_OUT", quantity: 2 },
  ]);

  assert.deepEqual(
    performance.map((product) => [product.name, product.unitsSold]),
    [
      ["Alpha", 10],
      ["Beta", 2],
      ["Gamma", 0],
    ],
  );
  assert.equal(performance[0].sellThroughRate, 66.7);
  assert.equal(performance.at(-1).unitsSold, 0);
});

test("sales trends and inventory movement fill missing days with real zeroes", () => {
  const trend = buildDailyInventoryTrend(
    [
      { day: "2026-08-10", type: "STOCK_IN", quantity: 10 },
      { day: "2026-08-10", type: "STOCK_OUT", quantity: 4 },
      { day: "2026-08-12", type: "STOCK_OUT", quantity: 3 },
    ],
    new Date("2026-08-10T00:00:00Z"),
    3,
  );

  assert.deepEqual(trend, [
    {
      day: "2026-08-10",
      unitsReceived: 10,
      unitsSold: 4,
      netMovement: 6,
    },
    {
      day: "2026-08-11",
      unitsReceived: 0,
      unitsSold: 0,
      netMovement: 0,
    },
    {
      day: "2026-08-12",
      unitsReceived: 0,
      unitsSold: 3,
      netMovement: -3,
    },
  ]);
});

test("inventory mutation routes retain the existing authentication guard", async () => {
  const routeFiles = [
    "app/api/products/route.ts",
    "app/api/products/[productId]/route.ts",
    "app/api/inventory/stock-in/route.ts",
    "app/api/inventory/stock-out/route.ts",
  ];

  for (const routeFile of routeFiles) {
    const source = await readFile(new URL(`../${routeFile}`, import.meta.url), "utf8");
    assert.match(source, /requireApiUser\(\)/, `${routeFile} must require a user`);
    assert.match(source, /assertSameOrigin\(request\)/, `${routeFile} must verify origin`);
  }
});

test("Delete Product preserves history and guards duplicate UI requests", async () => {
  const [service, route, component, schema] = await Promise.all([
    readFile(new URL("../lib/inventory/service.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/products/[productId]/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../components/inventory/delete-product-button.tsx",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8"),
  ]);

  assert.match(service, /where:\s*\{ id: productId, ownerId \}/);
  assert.match(service, /_count:\s*\{ select:\s*\{ transactions: true \} \}/);
  assert.match(service, /type:\s*\{ not: "PRODUCT_ADDED" \}/);
  assert.match(service, /disposition: "archived"/);
  assert.match(service, /transaction\.product\.delete/);
  assert.match(route, /productIdSchema\.parse/);
  assert.match(route, /requireApiUser\(\)/);
  assert.match(component, /role="alertdialog"/);
  assert.match(component, /requestInFlight\.current/);
  assert.match(component, /disabled=\{loading\}/);
  assert.match(component, /onClick=\{closeModal\}/);
  assert.match(component, /cancelRef\.current\?\.focus\(\)/);
  assert.match(component, /Delete Product\?/);
  assert.match(schema, /InventoryTransaction[\s\S]*onDelete: Restrict/);
  assert.match(schema, /InventoryActivity[\s\S]*onDelete: SetNull/);
});

test("product lists expose responsive Edit and Delete actions", async () => {
  const productPages = [
    "app/(protected)/(inventory-modules)/products/page.tsx",
    "app/(protected)/(inventory-modules)/inventory/page.tsx",
  ];

  for (const productPage of productPages) {
    const source = await readFile(
      new URL(`../${productPage}`, import.meta.url),
      "utf8",
    );
    assert.match(source, /DeleteProductButton/);
    assert.match(source, />\s*Edit\s*</);
    assert.match(source, /hidden[^"\n]*md:block/);
    assert.match(source, /md:hidden/);
    assert.match(source, /justify-end/);
  }
});

test("database failures return a generic server error without leaking details", async () => {
  const originalError = console.error;
  console.error = () => {};

  try {
    const response = errorResponse(
      new Error("password=secret connection refused"),
      "inventory database test",
    );
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.equal(payload.error.code, "INTERNAL_ERROR");
    assert.equal(payload.error.message, "Something went wrong. Please try again.");
    assert.equal(JSON.stringify(payload).includes("password=secret"), false);
  } finally {
    console.error = originalError;
  }
});

test("structured error details redact credentials, tokens, and email addresses", () => {
  const error = new Error(
    "password=secret token=eyJabc.def.ghi user@example.test postgres://user:pass@example.test/db",
  );
  const details = errorDetailsForLog(error);
  const serialized = JSON.stringify(details);

  assert.equal(serialized.includes("secret"), false);
  assert.equal(serialized.includes("eyJabc.def.ghi"), false);
  assert.equal(serialized.includes("user@example.test"), false);
  assert.equal(serialized.includes("user:pass"), false);
});

test("date inputs use the browser's local calendar date", () => {
  assert.equal(dateInputValue(new Date(2026, 7, 12, 23, 59, 59)), "2026-08-12");
});

test("primary navigation is visible on tablet and desktop breakpoints", async () => {
  const source = await readFile(
    new URL("../components/primary-navigation.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /md:flex/);
  assert.match(source, /md:hidden/);
  assert.doesNotMatch(source, /2xl:flex/);
});
