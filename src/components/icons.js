// Small inline icon set (24x24, stroke-based) so we don't pull in an icon library.
const paths = {
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  box: "M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8",
  users:
    "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M22 20v-1a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  wallet:
    "M3 7a2 2 0 0 1 2-2h13v4 M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2Z M16 14h.01",
  camera:
    "M4 7h3l2-3h6l2 3h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  phone: "M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z M11 18h2",
  mail: "M3 5h18v14H3V5Z M3 6l9 7 9-7",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  alert: "M12 9v4 M12 17h.01 M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.4 0Z",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 6v6l4 2",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4",
  chart: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8Z",
  sparkle: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z",
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z",
  layers: "M12 2 2 7l10 5 10-5-10-5Z M2 17l10 5 10-5 M2 12l10 5 10-5",
  image: "M3 5h18v14H3V5Z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z M21 15l-5-5L5 19",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z",
  workflow: "M4 4h6v6H4V4Z M14 14h6v6h-6v-6Z M7 10v4a3 3 0 0 0 3 3h4 M17 14v-4a3 3 0 0 0-3-3h-4",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  plus: "M12 5v14 M5 12h14",
  minus: "M5 12h14",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M12 16v-4 M12 8h.01",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
};

export function Icon({ name, className = "size-5", strokeWidth = 1.8 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

export function Logo({ className = "", dark = false }) {
  return (
    <span className={`flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="grid size-8 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-600/30">
        <Icon name="eye" className="size-4.5" strokeWidth={2.2} />
      </span>
      <span className={dark ? "text-white" : "text-stone-900"}>
        SiteWatch<span className="text-emerald-600"> BD</span>
      </span>
    </span>
  );
}
