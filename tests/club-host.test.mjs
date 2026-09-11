import assert from "node:assert/strict";
import test from "node:test";
import { findClubIdByDomain, getClubDomains, clubOrigin } from "../src/lib/club-host.ts";
import { findClubData } from "../src/lib/demo-data.ts";

test("registered domains resolve IDs independently of club slugs", () => {
  assert.equal(findClubIdByDomain("montpellier-fc.localhost:3000"), "montpellier-fc");
  assert.equal(findClubIdByDomain("OAKWOOD-UNITED.LOCALHOST:3100"), "club-oakwood");
  assert.equal(findClubIdByDomain("oakwood-united.localhost."), "club-oakwood");
});

test("only explicitly registered domains resolve", () => {
  for (const host of ["localhost:3000", "club-oakwood.localhost", "montpellier-fc.localhost.evil.com", "a.montpellier-fc.localhost", "app.montpellier.com", "https://montpellier-fc.localhost"]) {
    assert.equal(findClubIdByDomain(host), undefined);
  }
});

test("domain resolution still requires membership to return club records", () => {
  const clubId = findClubIdByDomain("oakwood-united.localhost:3000");
  assert.equal(findClubData(clubId, ["montpellier-fc"]), undefined);
  assert.equal(findClubData(clubId, ["club-oakwood"]).club.id, "club-oakwood");
});

test("domain listings and switcher origins use registered addresses", () => {
  assert.deepEqual(getClubDomains("club-oakwood"), [{ clubId: "club-oakwood", hostname: "oakwood-united.localhost" }]);
  assert.deepEqual(getClubDomains("missing"), []);
  assert.equal(clubOrigin("oakwood-united.localhost", "montpellier-fc.localhost:3100"), "http://oakwood-united.localhost:3100");
  assert.equal(clubOrigin("app.montpellier.com", "oakwood-united.localhost:3000"), "https://app.montpellier.com");
});
