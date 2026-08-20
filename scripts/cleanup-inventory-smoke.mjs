import { Pool } from "pg";

const database = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

try {
  const users = await database.query(
    `SELECT "id" FROM "User"
     WHERE "email" LIKE 'inventory-smoke-%@example.test'
        OR "email" LIKE 'registration-smoke-%@example.test'`,
  );

  for (const user of users.rows) {
    await database.query("BEGIN");

    try {
      await database.query(
        `DELETE FROM "InventoryTransaction" WHERE "performedById" = $1`,
        [user.id],
      );
      await database.query(`DELETE FROM "User" WHERE "id" = $1`, [user.id]);
      await database.query("COMMIT");
    } catch (error) {
      await database.query("ROLLBACK");
      throw error;
    }
  }

  process.stdout.write(`Removed ${users.rowCount} temporary smoke-test user(s).\n`);
} finally {
  await database.end();
}
