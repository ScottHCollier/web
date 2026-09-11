# Final Third

A grassroots football clubhouse built with Next.js App Router, React, and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open `http://montpellier-fc.localhost:3000` for the club’s public website, or `/dashboard` for the member workspace. Public pages include `/news`, `/teams`, `/fixtures`, and `/contact`. Dashboard sections use paths such as `/dashboard/players`, `/dashboard/payments`, and `/dashboard/settings`; the club switcher changes subdomains and opens the selected club’s dashboard. Bare `localhost:3000` and unknown club hosts return not-found.

Public routes live in `src/app/(public)` with their own layout. The member workspace lives in `src/app/dashboard`, including the existing feed, availability, registrations, and documents pages. Both resolve the club from the request Host header. Public pages use an explicit public data projection and do not require demo membership; dashboard pages retain membership checks. The hardcoded domain registry in `src/lib/club-host.ts` maps exact hostnames to club IDs through `findClubIdByDomain`; club slugs are not inferred from domains. Settings lists the registered domain and previews future custom-domain management. Only the two demo localhost domains are registered today. Future verified custom domains can use the same lookup, with DNS/TLS configured separately. Non-local club links use HTTPS.

## Club scope

- `src/types/club.ts` defines the club identity and tenant-owned records.
- `src/lib/current-club.ts` resolves a club on the server and checks demo membership before returning records. It looks up the request domain, then loads records by club ID. Both the layout and each page call this boundary; unknown or unavailable clubs return not-found.
- `src/lib/demo-data.ts` contains fictional records scoped by `clubId`.
- `src/lib/public-club.ts` resolves public club content independently of the demo identity. Public news is separate from the member feed; player records, payments, and registrations are excluded. Contact details are a placeholder until supplied.
- `src/lib/navigation.ts` defines dashboard routes for the sidebar and search.
- `src/lib/club-themes.ts` defines a complete light/dark palette per club. Settings shows the same palette with previews and color swatches; editing is a placeholder. Update the hardcoded palette here for now. The root layout applies domain-specific CSS variables to both the public site and dashboard, including overlays and popovers. Theme tokens cover surfaces/text, primary/secondary brand colors, accents, button background/hover/text, status colors, backdrops, and shadows. Components use semantic Tailwind colors and the shared `.panel` / `.button-primary` styles. Future database themes can use the same `ClubTheme` shape and `themeVariables` adapter.
- `src/lib/roles.ts` contains the shared role hierarchy. Club memberships and roles now come from the authenticated API user.
- `src/components/club-provider.tsx` exposes the resolved club through `useClub()` for client components. The provider remounts when the club changes, resetting local demo state.
- The shared shell builds navigation within the current club hostname and applies club colours and badge (initials when no badge is supplied).

## Demo limitations

The `/login` page proxies registration and login to the API and stores the signed access token in an HTTP-only cookie. The dashboard validates that token and its club memberships through `/api/v1/auth/me` on the server. New accounts have no memberships until a club administrator assigns one. Set `API_URL` when the API is not available at `http://localhost:8000`. Availability responses are persisted through the API, with team and fixture filters, response summaries, and optional notes in the Matchday view. Payment records, registration invites, and private documents are persisted through the API. Appearance settings persist in local storage per origin, so each club subdomain has its own preference.

Every database query and mutation must independently verify membership and scope records by the resolved club ID. Add role checks for administration and enforce tenant access at the database layer. Never treat the URL slug, client context, or a submitted club ID as authorization.

## Checks

```bash
npm run lint
npx next typegen
npx tsc --noEmit
node --experimental-strip-types --test tests/*.test.mjs
npm run build
```

The data isolation tests require Node 22.6 or newer. The existing Google font setup requires network access during a production build.
