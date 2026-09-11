export function dashboardHref(path = "") {
  return `/dashboard${path ? `/${path}` : ""}`;
}

export const dashboardNavigation = [
  ["", "Dashboard", "home", "member"],
  ["feed", "Club feed", "feed", "member"],
  ["teams", "Teams", "players", "member"],
  ["fixtures", "Fixtures", "calendar", "member"],
  ["availability", "Availability", "calendar", "member"],
  ["notifications", "Notifications", "bell", "member"],
  ["registrations", "Registrations", "document", "coach"],
  ["payments", "Payments", "wallet", "admin"],
  ["documents", "Documents", "document", "member"],
  ["players", "Players", "players", "coach"],
  ["club-settings", "Club admin", "settings", "admin"],
  ["newsletter", "Newsletter", "mail", "admin"],
  ["settings", "Settings", "settings", "member"],
] as const;
