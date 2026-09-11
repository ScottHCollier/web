// Replace these records with verified domain registrations when domain management is connected.
const clubDomains = [
  { clubId: "montpellier-fc", hostname: "montpellier-fc.localhost" },
  { clubId: "club-oakwood", hostname: "oakwood-united.localhost" },
] as const;

function normalizeHostname(host: string): string {
  return host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");
}

export function findClubIdByDomain(host: string): string | undefined {
  const hostname = normalizeHostname(host);
  return clubDomains.find((domain) => domain.hostname === hostname)?.clubId;
}

export function getClubDomains(clubId: string) {
  return clubDomains.filter((domain) => domain.clubId === clubId);
}

export function clubOrigin(hostname: string, requestHost: string): string {
  const local = hostname.endsWith(".localhost");
  const port = local ? requestHost.match(/:\d+$/)?.[0] ?? ":3000" : "";
  return `${local ? "http" : "https"}://${hostname}${port}`;
}
