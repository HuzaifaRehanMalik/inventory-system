import assert from "node:assert/strict";
import test from "node:test";

import { getNavigationItems } from "../components/navigation-items.ts";

test("public navigation contains only public destinations", () => {
  const items = getNavigationItems(false);
  const hrefs = items.map((item) => item.href);

  assert.deepEqual(hrefs, ["/guide", "/login", "/register"]);
  assert.equal(hrefs.includes("/inventory"), false);
  assert.equal(hrefs.includes("/settings"), false);
});

test("authenticated navigation contains application destinations", () => {
  const items = getNavigationItems(true);
  const hrefs = items.map((item) => item.href);

  assert.deepEqual(hrefs, [
    "/",
    "/inventory",
    "/products",
    "/stock-in",
    "/stock-out",
    "/reports",
    "/settings",
    "/guide",
  ]);
  assert.equal(hrefs.includes("/login"), false);
  assert.equal(hrefs.includes("/register"), false);
});

test("the public Guide is present in both navigation states", () => {
  assert.equal(
    getNavigationItems(false).some((item) => item.href === "/guide"),
    true,
  );
  assert.equal(
    getNavigationItems(true).some((item) => item.href === "/guide"),
    true,
  );
});
