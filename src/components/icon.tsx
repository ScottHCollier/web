import type { CSSProperties } from "react";

const paths: Record<string, string> = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  feed: "M4 4h16v13H9l-5 4V4Zm4 5h8M8 13h5",
  calendar:
    "M5 5h14a2 2 0 0 1 2 2v13H3V7a2 2 0 0 1 2-2ZM7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4",
  document: "M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6m-6 4h6",
  wallet:
    "M4 6h15v14H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13v2m2 5h-6v5h6m-3-2.5h.01",
  players:
    "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3m1-17a4 4 0 0 1 0 7m2 3a5 5 0 0 1 3 4v3",
  check: "m5 12 4 4L19 6",
  search: "M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm5.5-2 5 5",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  chevron: "m8 5 7 7-7 7",
  sparkles: "m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z",
  panel: "M3 4h18v16H3V4Zm6 0v16m4-11 3 3-3 3",
  settings:
    "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm0-5 1 2.1a7.2 7.2 0 0 1 1.9.8l2.2-.7 1.8 1.8-.7 2.2c.3.6.6 1.2.8 1.9l2.1 1v2.5l-2.1 1a7.2 7.2 0 0 1-.8 1.9l.7 2.2-1.8 1.8-2.2-.7a7.2 7.2 0 0 1-1.9.8l-1 2.1h-2.5l-1-2.1a7.2 7.2 0 0 1-1.9-.8l-2.2.7-1.8-1.8.7-2.2a7.2 7.2 0 0 1-.8-1.9l-2.1-1v-2.5l2.1-1c.2-.7.5-1.3.8-1.9l-.7-2.2 1.8-1.8 2.2.7a7.2 7.2 0 0 1 1.9-.8l1-2.1Z",
  logout:
    "M14 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-3m-4-3h10m0 0-3-3m3 3-3 3",
  account: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
};
export function Icon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] ?? paths.document} />
    </svg>
  );
}
