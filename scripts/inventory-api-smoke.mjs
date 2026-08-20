import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";

import { hash } from "bcrypt";
import { Pool } from "pg";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3301";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for the inventory API smoke test.");
}

const database = new Pool({ connectionString, max: 1 });
const suffix = randomUUID().replaceAll("-", "").slice(0, 16);
const email = `inventory-smoke-${suffix}@example.test`;
const registrationEmail = `registration-smoke-${suffix}@example.test`;
const password = `Inventory-Smoke-${suffix}!`;
const newPassword = `Inventory-Reset-${suffix}!`;
let userId;
let productId;
let registrationUserId;
const representativeQuantities = [1, 10, 100, 1_000_000_001];
const additionalOpeningQuantities = [1, 100, 10_000];
const additionalProducts = [];
const representativeQuantityTotal = representativeQuantities.reduce(
  (total, quantity) => total + quantity,
  0,
);

try {
  userId = `smoke_${suffix}`;
  await database.query(
    `INSERT INTO "User" (
      "id", "name", "email", "emailVerified", "passwordHash", "role",
      "status", "sessionVersion", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, NOW(), $4, 'USER', 'ACTIVE', 0, NOW(), NOW())`,
    [userId, "Inventory Smoke Test", email, await hash(password, 12)],
  );

  const registration = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      name: "Registration Smoke Test",
      email: registrationEmail,
      password,
      confirmPassword: password,
    }),
  });
  await expectStatus(registration, 201, "signup");

  const registeredUser = await database.query(
    `SELECT "id", "emailVerified" FROM "User" WHERE "email" = $1`,
    [registrationEmail],
  );
  assert.equal(registeredUser.rowCount, 1, "signup must create an account");
  assert.equal(
    registeredUser.rows[0].emailVerified,
    null,
    "signup must retain the existing verification requirement",
  );
  registrationUserId = registeredUser.rows[0].id;

  const login = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      email,
      password,
      rememberMe: false,
      callbackUrl: "/",
    }),
  });
  await expectStatus(login, 200, "login");
  const sessionCookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  assert.notEqual(sessionCookie, "", "login must issue a session cookie");

  const invalidOpeningQuantity = await inventoryRequest(
    "/api/products",
    "POST",
    {
      name: "Invalid Opening Quantity",
      sku: `INVALID-${suffix}`,
      unitPrice: 12.5,
      minimumStock: 2,
      initialQuantity: -1,
    },
    sessionCookie,
  );
  await expectStatus(invalidOpeningQuantity, 422, "negative opening quantity");

  const created = await inventoryRequest(
    "/api/products",
    "POST",
    {
      name: `API Smoke Item ${suffix}`,
      sku: `SMOKE-${suffix}`,
      description: "Temporary item created by the inventory API smoke test.",
      unitPrice: 25.5,
      minimumStock: 3,
      initialQuantity: 10,
    },
    sessionCookie,
  );
  const createdPayload = await expectStatus(created, 201, "add stock");
  productId = createdPayload.data.id;

  for (const initialQuantity of additionalOpeningQuantities) {
    const name = `API Smoke Item ${initialQuantity} ${suffix}`;
    const additionalProduct = await inventoryRequest(
      "/api/products",
      "POST",
      {
        name,
        sku: `SMOKE-${initialQuantity}-${suffix}`,
        unitPrice: 5,
        minimumStock: 1,
        initialQuantity,
      },
      sessionCookie,
    );
    const additionalPayload = await expectStatus(
      additionalProduct,
      201,
      `add opening quantity ${initialQuantity}`,
    );
    additionalProducts.push({
      id: additionalPayload.data.id,
      name,
      quantity: initialQuantity,
    });

    const additionalDatabaseProduct = await readDatabaseProduct(
      additionalPayload.data.id,
    );
    assert.equal(additionalDatabaseProduct.quantity, initialQuantity);
    assert.equal(additionalDatabaseProduct.movements.length, 1);
    assert.equal(additionalDatabaseProduct.movements[0].type, "STOCK_IN");
    assert.equal(
      additionalDatabaseProduct.movements[0].newQuantity,
      initialQuantity,
    );
  }

  await assertQuantityInputMarkup(
    "/products/new",
    "initialQuantity",
    sessionCookie,
  );
  await assertQuantityInputMarkup("/stock-in", "quantity", sessionCookie);
  await assertQuantityInputMarkup("/stock-out", "quantity", sessionCookie);

  const edited = await inventoryRequest(
    `/api/products/${productId}`,
    "PATCH",
    {
      name: `API Smoke Item Updated ${suffix}`,
      sku: `SMOKE-${suffix}`,
      description: "Updated during the API smoke test.",
      unitPrice: 27,
      minimumStock: 4,
    },
    sessionCookie,
  );
  await expectStatus(edited, 200, "edit stock");

  const zeroReceive = await inventoryRequest(
    "/api/inventory/stock-in",
    "POST",
    movementBody(productId, 0, { purchasePrice: 20 }),
    sessionCookie,
  );
  await expectStatus(zeroReceive, 422, "zero received quantity");

  const negativeReceive = await inventoryRequest(
    "/api/inventory/stock-in",
    "POST",
    movementBody(productId, -1, { purchasePrice: 20 }),
    sessionCookie,
  );
  await expectStatus(negativeReceive, 422, "negative received quantity");

  const received = await inventoryRequest(
    "/api/inventory/stock-in",
    "POST",
    movementBody(productId, 5, { purchasePrice: 20 }),
    sessionCookie,
  );
  const receivedPayload = await expectStatus(received, 201, "receive stock");
  assert.equal(receivedPayload.data.newQuantity, 15);

  const overSale = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 16),
    sessionCookie,
  );
  const overSalePayload = await expectStatus(overSale, 409, "oversell protection");
  assert.equal(overSalePayload.error.code, "INSUFFICIENT_STOCK");

  const zeroSale = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 0),
    sessionCookie,
  );
  await expectStatus(zeroSale, 422, "zero sale quantity");

  const sold = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 4),
    sessionCookie,
  );
  const soldPayload = await expectStatus(sold, 201, "sell stock");
  assert.equal(soldPayload.data.newQuantity, 11);

  const concurrentProduct = await inventoryRequest(
    "/api/products",
    "POST",
    {
      name: `Concurrent Sale Item ${suffix}`,
      sku: `CONCURRENT-${suffix}`,
      unitPrice: 10,
      minimumStock: 2,
      initialQuantity: 10,
    },
    sessionCookie,
  );
  const concurrentProductPayload = await expectStatus(
    concurrentProduct,
    201,
    "create concurrent sale product",
  );
  const concurrentSales = await Promise.all(
    [1, 2].map((attempt) =>
      inventoryRequest(
        "/api/inventory/stock-out",
        "POST",
        movementBody(concurrentProductPayload.data.id, 6, {
          referenceNumber: `CONCURRENT-${attempt}-${suffix}`,
        }),
        sessionCookie,
      ),
    ),
  );
  const concurrentSaleResults = await Promise.all(
    concurrentSales.map(async (response) => ({
      status: response.status,
      payload: await response.json(),
    })),
  );
  assert.deepEqual(
    concurrentSaleResults.map((result) => result.status).sort(),
    [201, 409],
    `concurrent oversell must commit once: ${JSON.stringify(concurrentSaleResults)}`,
  );
  const rejectedConcurrentSale = concurrentSaleResults.find(
    (result) => result.status === 409,
  );
  assert.equal(
    ["INSUFFICIENT_STOCK", "INVENTORY_CONFLICT"].includes(
      rejectedConcurrentSale?.payload.error.code,
    ),
    true,
    "concurrent oversell must return a safe conflict response",
  );
  const concurrentDatabaseProduct = await readDatabaseProduct(
    concurrentProductPayload.data.id,
  );
  assert.equal(concurrentDatabaseProduct.quantity, 4);
  assert.equal(
    concurrentDatabaseProduct.movements.filter(
      (movement) => movement.type === "STOCK_OUT",
    ).length,
    1,
    "concurrent oversell must persist only one sale",
  );

  let exercisedQuantity = soldPayload.data.newQuantity;
  for (const quantity of representativeQuantities) {
    const response = await inventoryRequest(
      "/api/inventory/stock-in",
      "POST",
      movementBody(productId, quantity, { purchasePrice: 20 }),
      sessionCookie,
    );
    const payload = await expectStatus(response, 201, `receive quantity ${quantity}`);
    exercisedQuantity += quantity;
    assert.equal(payload.data.newQuantity, exercisedQuantity);
  }

  for (const quantity of representativeQuantities) {
    const response = await inventoryRequest(
      "/api/inventory/stock-out",
      "POST",
      movementBody(productId, quantity),
      sessionCookie,
    );
    const payload = await expectStatus(response, 201, `sell quantity ${quantity}`);
    exercisedQuantity -= quantity;
    assert.equal(payload.data.newQuantity, exercisedQuantity);
  }
  assert.equal(exercisedQuantity, 11);

  const duplicateReference = `DUPLICATE-${suffix}`;
  for (const purchasePrice of [20, 21]) {
    const response = await inventoryRequest(
      "/api/inventory/stock-in",
      "POST",
      movementBody(productId, 1, {
        purchasePrice,
        referenceNumber: duplicateReference,
      }),
      sessionCookie,
    );
    const payload = await expectStatus(
      response,
      201,
      "duplicate stock reference",
    );
    exercisedQuantity += 1;
    assert.equal(payload.data.newQuantity, exercisedQuantity);
  }

  const balanceDuplicateReceipts = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 2, {
      referenceNumber: `BALANCE-${suffix}`,
    }),
    sessionCookie,
  );
  const balancePayload = await expectStatus(
    balanceDuplicateReceipts,
    201,
    "balance duplicate receipts",
  );
  exercisedQuantity -= 2;
  assert.equal(balancePayload.data.newQuantity, exercisedQuantity);
  assert.equal(exercisedQuantity, 11);

  const missingProduct = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody("cm00000000000000000000", 1),
    sessionCookie,
  );
  await expectStatus(missingProduct, 404, "invalid product ID");

  const invalidOrigin = await fetch(`${baseUrl}/api/inventory/stock-in`, {
    method: "POST",
    headers: {
      Origin: "https://invalid-origin.example",
      "Content-Type": "application/json",
      Cookie: sessionCookie,
    },
    body: JSON.stringify(
      movementBody(productId, 1, { purchasePrice: 20 }),
    ),
  });
  await expectStatus(invalidOrigin, 403, "same-origin protection");

  const inventoryFirstVisit = await authenticatedPage(
    "/inventory",
    sessionCookie,
  );
  assert.match(inventoryFirstVisit, new RegExp(`API Smoke Item Updated ${suffix}`));
  for (const product of additionalProducts) {
    assert.match(inventoryFirstVisit, new RegExp(product.name));
  }

  const inventoryRefresh = await authenticatedPage("/inventory", sessionCookie);
  assert.match(inventoryRefresh, new RegExp(`API Smoke Item Updated ${suffix}`));
  const inventoryDetail = await authenticatedPage(
    `/inventory/${productId}`,
    sessionCookie,
  );
  assert.match(inventoryDetail, new RegExp(`API Smoke Item Updated ${suffix}`));
  await authenticatedPage(
    `/inventory/${additionalProducts[1].id}`,
    sessionCookie,
  );
  const missingInventoryDetail = await fetch(
    `${baseUrl}/inventory/cm00000000000000000000`,
    {
      headers: { Cookie: sessionCookie },
      redirect: "manual",
    },
  );
  assert.equal(
    missingInventoryDetail.status,
    404,
    "unknown inventory product must return not found without crashing",
  );
  const invalidInventoryDetail = await fetch(
    `${baseUrl}/inventory/not-a-product-id`,
    {
      headers: { Cookie: sessionCookie },
      redirect: "manual",
    },
  );
  assert.equal(
    invalidInventoryDetail.status,
    404,
    "malformed inventory product ID must return not found without crashing",
  );
  await authenticatedPage("/settings", sessionCookie);
  const inventoryAfterNavigation = await authenticatedPage(
    "/inventory",
    sessionCookie,
  );
  assert.match(
    inventoryAfterNavigation,
    new RegExp(`API Smoke Item Updated ${suffix}`),
  );

  const dashboard = await fetch(`${baseUrl}/`, {
    headers: { Cookie: sessionCookie },
    redirect: "manual",
  });
  assert.equal(dashboard.status, 200, "authenticated dashboard must load");
  const dashboardHtml = await dashboard.text();
  assert.match(dashboardHtml, /Product performance comparison/);
  assert.match(dashboardHtml, new RegExp(`API Smoke Item Updated ${suffix}`));
  for (const href of [
    "/",
    "/inventory",
    "/products/new",
    "/stock-in",
    "/stock-out",
    "/settings",
  ]) {
    assert.match(
      dashboardHtml,
      new RegExp(`href="${href.replaceAll("/", "\\/")}"`),
      `dashboard navigation must include ${href}`,
    );
  }

  for (const compatibilityPath of ["/dashboard", "/home", "/reports"]) {
    const response = await fetch(`${baseUrl}${compatibilityPath}`, {
      headers: { Cookie: sessionCookie },
      redirect: "manual",
    });
    assert.equal(
      response.status,
      307,
      `${compatibilityPath} must preserve its compatibility redirect`,
    );
    assert.equal(
      new URL(response.headers.get("location"), baseUrl).pathname,
      "/",
      `${compatibilityPath} must redirect to the dashboard`,
    );
  }

  for (const existingPage of [
    "/categories",
    "/customers",
    "/purchases",
    "/sales",
    "/stock-transfers",
    "/suppliers",
    "/users",
    "/profile",
    "/change-password",
  ]) {
    await authenticatedPage(existingPage, sessionCookie);
  }

  const databaseProduct = await readDatabaseProduct(productId);
  assert.equal(databaseProduct.active, true);
  assert.equal(databaseProduct.quantity, 11);
  assert.equal(
    databaseProduct.movements
      .filter((movement) => movement.type === "STOCK_IN")
      .reduce((total, movement) => total + movement.quantity, 0),
    17 + representativeQuantityTotal,
  );
  assert.equal(
    databaseProduct.movements
      .filter((movement) => movement.type === "STOCK_OUT")
      .reduce((total, movement) => total + movement.quantity, 0),
    6 + representativeQuantityTotal,
  );
  assert.equal(
    databaseProduct.movements.every((movement) => movement.newQuantity >= 0),
    true,
  );
  assert.equal(
    databaseProduct.movements.filter(
      (movement) => movement.referenceNumber === duplicateReference,
    ).length,
    2,
    "duplicate reference values should remain valid movement metadata",
  );

  const invalidDeleteId = await inventoryRequest(
    "/api/products/not-a-product-id",
    "DELETE",
    undefined,
    sessionCookie,
  );
  await expectStatus(invalidDeleteId, 422, "invalid delete product ID");

  const unauthorizedProductId = `cm${suffix}0001`;
  await insertHistoryFreeProduct(
    registrationUserId,
    unauthorizedProductId,
    `Unauthorized Delete Item ${suffix}`,
    `UNAUTHORIZED-${suffix}`,
  );
  const unauthorizedDelete = await inventoryRequest(
    `/api/products/${unauthorizedProductId}`,
    "DELETE",
    undefined,
    sessionCookie,
  );
  await expectStatus(unauthorizedDelete, 404, "cross-owner product delete");
  assert.equal(await databaseProductExists(unauthorizedProductId), true);

  const historyFreeProductId = `cm${suffix}0002`;
  await insertHistoryFreeProduct(
    userId,
    historyFreeProductId,
    `History Free Item ${suffix}`,
    `HISTORY-FREE-${suffix}`,
  );
  const permanentlyDeleted = await inventoryRequest(
    `/api/products/${historyFreeProductId}`,
    "DELETE",
    undefined,
    sessionCookie,
  );
  const permanentDeletePayload = await expectStatus(
    permanentlyDeleted,
    200,
    "permanent product delete",
  );
  assert.equal(permanentDeletePayload.data.disposition, "deleted");
  assert.equal(permanentDeletePayload.data.hadHistory, false);
  assert.equal(await databaseProductExists(historyFreeProductId), false);
  assert.equal(await databaseProductActivityCount(historyFreeProductId), 0);

  const duplicateDeleteProductId = `cm${suffix}0003`;
  await insertHistoryFreeProduct(
    userId,
    duplicateDeleteProductId,
    `Duplicate Delete Item ${suffix}`,
    `DOUBLE-DELETE-${suffix}`,
  );
  const duplicateDeleteResponses = await Promise.all([
    inventoryRequest(
      `/api/products/${duplicateDeleteProductId}`,
      "DELETE",
      undefined,
      sessionCookie,
    ),
    inventoryRequest(
      `/api/products/${duplicateDeleteProductId}`,
      "DELETE",
      undefined,
      sessionCookie,
    ),
  ]);
  const duplicateDeleteResults = await Promise.all(
    duplicateDeleteResponses.map(async (response) => ({
      status: response.status,
      payload: await response.json(),
    })),
  );
  assert.deepEqual(
    duplicateDeleteResults.map((result) => result.status).sort(),
    [200, 404],
    `duplicate deletion must process once: ${JSON.stringify(duplicateDeleteResults)}`,
  );
  assert.equal(await databaseProductExists(duplicateDeleteProductId), false);

  const stockOnlyProduct = additionalProducts[0];
  const archivedStockOnly = await inventoryRequest(
    `/api/products/${stockOnlyProduct.id}`,
    "DELETE",
    undefined,
    sessionCookie,
  );
  const stockOnlyPayload = await expectStatus(
    archivedStockOnly,
    200,
    "archive product with received stock",
  );
  assert.equal(stockOnlyPayload.data.disposition, "archived");
  assert.equal(stockOnlyPayload.data.hadHistory, true);
  const archivedStockOnlyProduct = await readDatabaseProduct(
    stockOnlyProduct.id,
  );
  assert.equal(archivedStockOnlyProduct.active, false);
  assert.equal(archivedStockOnlyProduct.movements.length, 1);

  const deleted = await inventoryRequest(
    `/api/products/${productId}`,
    "DELETE",
    undefined,
    sessionCookie,
  );
  const deletedPayload = await expectStatus(deleted, 200, "delete stock");
  assert.equal(deletedPayload.data.disposition, "archived");
  assert.equal(deletedPayload.data.hadHistory, true);

  const deletedProduct = await readDatabaseProduct(productId);
  assert.equal(deletedProduct.active, false);
  assert.equal(deletedProduct.quantity, 11);
  assert.equal(deletedProduct.movements.length, 14);

  const repeatedDelete = await inventoryRequest(
    `/api/products/${productId}`,
    "DELETE",
    undefined,
    sessionCookie,
  );
  const repeatedDeletePayload = await expectStatus(
    repeatedDelete,
    409,
    "repeated archived product delete",
  );
  assert.equal(repeatedDeletePayload.error.code, "PRODUCT_ALREADY_REMOVED");

  const inventoryAfterDelete = await authenticatedPage(
    "/inventory",
    sessionCookie,
  );
  assert.doesNotMatch(
    inventoryAfterDelete,
    new RegExp(`API Smoke Item Updated ${suffix}`),
  );
  assert.doesNotMatch(inventoryAfterDelete, new RegExp(stockOnlyProduct.name));

  const productsAfterDelete = await authenticatedPage(
    "/products",
    sessionCookie,
  );
  assert.doesNotMatch(
    productsAfterDelete,
    new RegExp(`API Smoke Item Updated ${suffix}`),
  );

  const analyticsAfterDelete = await authenticatedPage("/", sessionCookie);
  assert.match(analyticsAfterDelete, /Inventory analytics/);
  assert.match(
    analyticsAfterDelete,
    new RegExp(`API Smoke Item Updated ${suffix}`),
    "archived movements must remain visible in historical analytics",
  );
  const activeProductCount = await database.query(
    `SELECT COUNT(*)::int AS "count" FROM "Product" WHERE "ownerId" = $1 AND "active" = true`,
    [userId],
  );
  assert.match(
    analyticsAfterDelete,
    new RegExp(
      `Total products[\\s\\S]{0,500}>${activeProductCount.rows[0].count.toLocaleString()}<`,
    ),
    "dashboard active product count must refresh after deletion",
  );

  const sellDeleted = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 1),
    sessionCookie,
  );
  await expectStatus(sellDeleted, 404, "sale against deleted stock");

  const forgotPassword = await fetch(`${baseUrl}/api/auth/forgot-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email }),
  });
  await expectStatus(forgotPassword, 202, "forgot password");
  const createdResetToken = await database.query(
    `SELECT "id" FROM "PasswordResetToken" WHERE "userId" = $1`,
    [userId],
  );
  assert.equal(
    createdResetToken.rowCount,
    1,
    "forgot password must create a reset token",
  );

  const malformedReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      token: "invalid",
      password: newPassword,
      confirmPassword: newPassword,
    }),
  });
  await expectStatus(malformedReset, 422, "malformed password reset token");

  const expiredResetToken = `${randomUUID().replaceAll("-", "")}${randomUUID().replaceAll("-", "")}`;
  const expiredResetTokenHash = createHash("sha256")
    .update(expiredResetToken)
    .digest("hex");
  await database.query(`DELETE FROM "PasswordResetToken" WHERE "userId" = $1`, [userId]);
  await database.query(
    `INSERT INTO "PasswordResetToken" (
      "id", "userId", "tokenHash", "expires", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, NOW() - INTERVAL '1 minute', NOW(), NOW())`,
    [`expired_reset_${suffix}`, userId, expiredResetTokenHash],
  );
  const expiredReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      token: expiredResetToken,
      password: newPassword,
      confirmPassword: newPassword,
    }),
  });
  await expectStatus(expiredReset, 400, "expired password reset token");
  const expiredResetRecord = await database.query(
    `SELECT 1 FROM "PasswordResetToken" WHERE "tokenHash" = $1`,
    [expiredResetTokenHash],
  );
  assert.equal(
    expiredResetRecord.rowCount,
    0,
    "expired password reset token must be removed",
  );

  const resetToken = `${randomUUID().replaceAll("-", "")}${randomUUID().replaceAll("-", "")}`;
  const resetTokenHash = createHash("sha256").update(resetToken).digest("hex");
  await database.query(`DELETE FROM "PasswordResetToken" WHERE "userId" = $1`, [userId]);
  await database.query(
    `INSERT INTO "PasswordResetToken" (
      "id", "userId", "tokenHash", "expires", "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes', NOW(), NOW())`,
    [`reset_${suffix}`, userId, resetTokenHash],
  );

  const resetPassword = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      token: resetToken,
      password: newPassword,
      confirmPassword: newPassword,
    }),
  });
  await expectStatus(resetPassword, 200, "password reset");

  const reusedReset = await fetch(`${baseUrl}/api/auth/reset-password`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      token: resetToken,
      password: newPassword,
      confirmPassword: newPassword,
    }),
  });
  await expectStatus(reusedReset, 400, "consumed password reset token");

  const loginAfterReset = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      email,
      password: newPassword,
      rememberMe: false,
      callbackUrl: "/",
    }),
  });
  await expectStatus(loginAfterReset, 200, "login after password reset");
  const resetSessionCookie = loginAfterReset.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  assert.notEqual(
    resetSessionCookie,
    "",
    "login after password reset must issue a session cookie",
  );

  const logout = await fetch(`${baseUrl}/api/auth/logout`, {
    method: "POST",
    headers: {
      ...jsonHeaders(),
      Cookie: resetSessionCookie,
    },
  });
  await expectStatus(logout, 200, "logout");
  assert.match(
    logout.headers.getSetCookie().join("; "),
    /(?:Max-Age=0|Expires=Thu, 01 Jan 1970)/i,
    "logout must clear the session cookie",
  );

  const loggedOutInventory = await fetch(`${baseUrl}/inventory`, {
    redirect: "manual",
  });
  assert.equal(
    [302, 307].includes(loggedOutInventory.status),
    true,
    "logged-out inventory access must redirect",
  );
  assert.match(
    loggedOutInventory.headers.get("location") ?? "",
    /\/login\?callbackUrl=%2Finventory/,
    "protected inventory must redirect to login with a callback",
  );

  for (const protectedPath of [
    `/inventory/${productId}`,
    "/stock-in",
    "/stock-out",
  ]) {
    const response = await fetch(`${baseUrl}${protectedPath}`, {
      redirect: "manual",
    });
    assert.equal(
      [302, 307].includes(response.status),
      true,
      `logged-out ${protectedPath} access must redirect`,
    );
    assert.match(
      response.headers.get("location") ?? "",
      new RegExp(
        `/login\\?callbackUrl=${encodeURIComponent(protectedPath).replaceAll(
          "/",
          "\\/",
        )}`,
      ),
      `${protectedPath} must preserve its login callback`,
    );
  }

  const unauthorized = await inventoryRequest(
    "/api/inventory/stock-out",
    "POST",
    movementBody(productId, 1),
  );
  await expectStatus(unauthorized, 401, "unauthorized sale");

  process.stdout.write(
    `${JSON.stringify({
      login: "passed",
      signup: "passed",
      forgotPassword: "passed",
      passwordReset: "passed",
      resetTokenValidation: "passed",
      logout: "passed",
      loggedOutProtection: "passed",
      addStock: "passed",
      editStock: "passed",
      receiveStock: "passed",
      sellStock: "passed",
      concurrentStockUpdates: "passed",
      deleteStock: "passed",
      permanentDelete: "passed",
      archiveWithStock: "passed",
      archiveWithSales: "passed",
      deleteAuthorization: "passed",
      duplicateDeleteProtection: "passed",
      deleteRefresh: "passed",
      analyticsPage: "passed",
      quantityInputMarkup: "passed",
      validationAndAuthorization: "passed",
      sameOriginProtection: "passed",
      duplicateReferences: "passed",
      multipleProducts: "passed",
      inventoryRefreshAndNavigation: "passed",
      inventoryDetailRoutes: "passed",
      authenticatedPageInventory: "passed",
      navigationLinks: "passed",
      representativeQuantities,
      additionalOpeningQuantities,
      finalQuantity: 11,
      receivedUnits: 17 + representativeQuantityTotal,
      soldUnits: 6 + representativeQuantityTotal,
    })}\n`,
  );
} finally {
  if (userId || registrationEmail) {
    await database.query("BEGIN");

    try {
      await database.query(
        `DELETE FROM "InventoryTransaction" WHERE "performedById" = $1`,
        [userId],
      );
      await database.query(
        `DELETE FROM "User" WHERE "email" IN ($1, $2)`,
        [email, registrationEmail],
      );
      await database.query("COMMIT");
    } catch (error) {
      await database.query("ROLLBACK");
      throw error;
    }
  }
  await database.end();
}

async function readDatabaseProduct(id) {
  const productResult = await database.query(
    `SELECT product."active", inventory."quantity"
     FROM "Product" AS product
     INNER JOIN "Inventory" AS inventory
       ON inventory."productId" = product."id"
     WHERE product."id" = $1`,
    [id],
  );
  assert.equal(productResult.rowCount, 1, "smoke-test product must exist");

  const movementResult = await database.query(
    `SELECT "type", "quantity", "newQuantity", "referenceNumber"
     FROM "InventoryTransaction"
     WHERE "productId" = $1
     ORDER BY "createdAt" ASC`,
    [id],
  );

  return {
    active: productResult.rows[0].active,
    quantity: productResult.rows[0].quantity,
    movements: movementResult.rows.map((movement) => ({
      type: movement.type,
      quantity: movement.quantity,
      newQuantity: movement.newQuantity,
      referenceNumber: movement.referenceNumber,
    })),
  };
}

async function insertHistoryFreeProduct(ownerId, id, name, sku) {
  await database.query("BEGIN");

  try {
    await database.query(
      `INSERT INTO "Product" (
        "id", "ownerId", "name", "sku", "unitPrice", "minimumStock",
        "active", "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, 0, 0, true, NOW(), NOW())`,
      [id, ownerId, name, sku],
    );
    await database.query(
      `INSERT INTO "Inventory" (
        "id", "productId", "quantity", "status", "averageUnitCost",
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, 0, 'OUT_OF_STOCK', 0, NOW(), NOW())`,
      [`inventory_${id}`, id],
    );
    await database.query(
      `INSERT INTO "InventoryActivity" (
        "id", "ownerId", "performedById", "productId", "type", "message", "createdAt"
      ) VALUES ($1, $2, $2, $3, 'PRODUCT_ADDED', $4, NOW())`,
      [`activity_${id}`, ownerId, id, `${name} was added to inventory.`],
    );
    await database.query("COMMIT");
  } catch (error) {
    await database.query("ROLLBACK");
    throw error;
  }
}

async function databaseProductExists(id) {
  const result = await database.query(
    `SELECT 1 FROM "Product" WHERE "id" = $1`,
    [id],
  );
  return result.rowCount === 1;
}

async function databaseProductActivityCount(id) {
  const result = await database.query(
    `SELECT COUNT(*)::int AS "count" FROM "InventoryActivity" WHERE "productId" = $1`,
    [id],
  );
  return result.rows[0].count;
}

function jsonHeaders() {
  return {
    Origin: baseUrl,
    "Content-Type": "application/json",
  };
}

function movementBody(movementProductId, quantity, extra = {}) {
  return {
    productId: movementProductId,
    quantity,
    occurredAt: new Date().toISOString(),
    ...extra,
  };
}

function inventoryRequest(path, method, body, sessionCookie) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...jsonHeaders(),
      ...(sessionCookie ? { Cookie: sessionCookie } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function authenticatedPage(path, sessionCookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Cookie: sessionCookie },
    redirect: "manual",
  });
  assert.equal(response.status, 200, `${path} must render successfully`);
  return response.text();
}

async function assertQuantityInputMarkup(path, inputName, sessionCookie) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Cookie: sessionCookie },
  });
  assert.equal(response.status, 200, `${path} must render successfully`);

  const html = await response.text();
  const input = html.match(
    new RegExp(`<input[^>]*\\bname="${inputName}"[^>]*>`, "i"),
  )?.[0];

  assert.ok(input, `${path} must render the ${inputName} input`);
  assert.match(input, /\btype="number"/, `${path} quantity must be numeric`);
  assert.match(input, /\brequired(?:="")?(?=\s|>)/, `${path} quantity must be required`);
  assert.match(input, /\bmin="1"/, `${path} quantity must be positive`);
  assert.match(input, /\bstep="1"/, `${path} quantity must be whole`);
  assert.doesNotMatch(input, /\bmax=/, `${path} quantity must not set max`);
}

async function expectStatus(response, expectedStatus, operation) {
  const payload = await response.json();

  assert.equal(
    response.status,
    expectedStatus,
    `${operation} returned ${response.status}: ${JSON.stringify(payload)}`,
  );
  return payload;
}
