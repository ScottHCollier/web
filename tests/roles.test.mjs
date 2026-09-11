import assert from "node:assert/strict";
import test from "node:test";
import { canAccessRole } from "../src/lib/roles.ts";

test("roles determine which navigation levels are available", () => {
  assert.equal(canAccessRole("member", "member"), true);
  assert.equal(canAccessRole("member", "coach"), false);
  assert.equal(canAccessRole("coach", "coach"), true);
  assert.equal(canAccessRole("coach", "admin"), false);
  assert.equal(canAccessRole("owner", "admin"), true);
});
