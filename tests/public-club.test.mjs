import assert from "node:assert/strict";
import test from "node:test";
import {
  demoClubs,
  findClubData,
  findPublicClubData,
} from "../src/lib/demo-data.ts";
import { dashboardHref, dashboardNavigation } from "../src/lib/navigation.ts";

test("public content is available independently of private membership", () => {
  for (const club of demoClubs) {
    assert.equal(findClubData(club.id, []), undefined);
    const data = findPublicClubData(club.id);
    assert.equal(data.club.id, club.id);
    assert.deepEqual(Object.keys(data).sort(), [
      "club",
      "fixtures",
      "news",
      "teams",
    ]);
    assert.ok(data.teams.every((team) => team.id.startsWith(club.id)));
    assert.ok(data.fixtures.every((fixture) => fixture.id.startsWith(club.id)));
    const privateData = findClubData(club.id, [club.id]);
    assert.ok(
      data.news.every(
        (news) => !privateData.posts.some((post) => post.id === news.id),
      ),
    );
  }
  assert.equal(findPublicClubData("missing"), undefined);
});

test("all workspace navigation stays under dashboard, including account settings", () => {
  assert.equal(dashboardHref(), "/dashboard");
  const routes = dashboardNavigation.map(([path]) => dashboardHref(path));
  for (const page of [
    "players",
    "teams",
    "fixtures",
    "payments",
    "settings",
    "club-settings",
    "feed",
    "availability",
    "registrations",
    "documents",
  ]) {
    assert.ok(routes.includes(`/dashboard/${page}`));
  }
  assert.equal(
    dashboardNavigation.find(([path]) => path === "settings")[3],
    "member",
  );
  assert.equal(
    dashboardNavigation.find(([path]) => path === "club-settings")[3],
    "admin",
  );
});
