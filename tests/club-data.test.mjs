import assert from "node:assert/strict";
import test from "node:test";
import { demoClubs, findClubData } from "../src/lib/demo-data.ts";

test("a valid club ID does not grant access without membership", () => {
  assert.equal(findClubData("montpellier-fc", []), undefined);
  assert.equal(findClubData("club-oakwood", ["montpellier-fc"]), undefined);
  assert.equal(findClubData("missing-club", ["montpellier-fc"]), undefined);
});

test("every returned record belongs to the requested member club", () => {
  for (const club of demoClubs) {
    const data = findClubData(club.id, demoClubs.map(item => item.id));
    assert.equal(data.club.id, club.id);
    for (const key of ["players", "fixtures", "posts", "payments", "documents"]) {
      assert.ok(data[key].length > 0);
      assert.ok(data[key].every(record => record.clubId === club.id));
    }
  }
});

test("switching clubs returns distinct records", () => {
  const membership = demoClubs.map(club => club.id);
  const first = findClubData(demoClubs[0].id, membership);
  const second = findClubData(demoClubs[1].id, membership);
  const firstIds = new Set(first.players.map(player => player.id));
  assert.ok(second.players.every(player => !firstIds.has(player.id)));
});
