"use client";

import { useState } from "react";
import { formatK, formatUSD } from "@/lib/demo-data";

// Chart palette: validated categorical slots 1-3 in fixed order (blue, orange, aqua); text stays in ink tokens.
// Aqua sits below 3:1 on white, so the labour chart always shows a legend and per-bar tooltip.
const SERIES_1 = "#2a78d6";
const SERIES_2 = "#eb6834";
const SERIES_3 = "#1baf7a";
const GRID = "#e7e5e4";
const AXIS_TEXT = "#78716c";

/* ---------- Budget burn: cumulative spend vs total budget (single series) ---------- */

export function BudgetChart({ data, totalBudget }) {
  const [active, setActive] = useState(null);
  const last = data.length - 1;

  const W = 640;
  const H = 260;
  const pad = { top: 20, right: 16, bottom: 28, left: 48 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const peak = Math.max(totalBudget, ...data.map((d) => d.spent));
  const { max: yMax, ticks } = niceScale(peak * 1.08);

  const x = (i) => pad.left + (i / (data.length - 1)) * innerW;
  const y = (v) => pad.top + innerH - (v / yMax) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(d.spent)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  const point = active === null ? null : data[active];
  const leftPct = active === null ? 0 : (x(active) / W) * 100;

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.left) / innerW) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        onPointerMove={handleMove}
        onPointerLeave={() => setActive(null)}
        role="img"
        aria-label={`Cumulative spend, reaching ${formatUSD(data[data.length - 1].spent)}${totalBudget > 0 ? ` of ${formatUSD(totalBudget)} budget` : ""}`}
      >
        <defs>
          <linearGradient id="burnFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={SERIES_1} stopOpacity="0.18" />
            <stop offset="100%" stopColor={SERIES_1} stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            <text x={pad.left - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
              {t === 0 ? "0" : t >= 1000 ? `$${t / 1000}k` : `$${t}`}
            </text>
          </g>
        ))}

        {/* Total budget reference */}
        {totalBudget > 0 && (
          <>
        <line
          x1={pad.left}
          x2={W - pad.right}
          y1={y(totalBudget)}
          y2={y(totalBudget)}
          stroke="#57534e"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <text x={pad.left + 6} y={y(totalBudget) - 7} fontSize="11" fontWeight="600" fill="#44403c">
          Total budget {formatK(totalBudget)}
        </text>
          </>
        )}

        <path d={area} fill="url(#burnFill)" />
        <path d={line} fill="none" stroke={SERIES_1} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) =>
          (i % 2 === 0 && i < data.length - 2) || i === data.length - 1 ? (
            <text key={d.week} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill={AXIS_TEXT}>
              {d.label}
            </text>
          ) : null,
        )}

        {/* Latest value, direct-labelled */}
        <circle cx={x(last)} cy={y(data[last].spent)} r="4.5" fill={SERIES_1} stroke="#fff" strokeWidth="2" />
        {point === null && (
          <text x={x(last) - 10} y={y(data[last].spent) - 12} textAnchor="end" fontSize="12" fontWeight="600" fill="#1c1917">
            {formatK(data[last].spent)} spent
          </text>
        )}

        {/* Crosshair */}
        {point && (
          <>
            <line x1={x(active)} x2={x(active)} y1={pad.top} y2={pad.top + innerH} stroke="#a8a29e" strokeWidth="1" />
            <circle cx={x(active)} cy={y(point.spent)} r="5" fill={SERIES_1} stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>

      {point && (
        <div
          className="pointer-events-none absolute top-10 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs shadow-lg shadow-stone-900/10"
          style={{
            left: `${leftPct}%`,
            transform: leftPct > 60 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
          }}
        >
          <p className="font-medium text-stone-500">
            {point.week} · {point.label}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-stone-900">{formatUSD(point.spent)}</p>
          {totalBudget > 0 && <p className="text-stone-500">{Math.round((point.spent / totalBudget) * 100)}% of budget</p>}
        </div>
      )}
    </div>
  );
}

/* ---------- Labour: stacked bars, masons + helpers + other ---------- */

const LABOUR_SERIES = [
  { key: "mason", label: "Masons", color: SERIES_1 },
  { key: "helper", label: "Helpers", color: SERIES_2 },
  { key: "other", label: "Other", color: SERIES_3 },
];

export function LabourChart({ data }) {
  const [active, setActive] = useState(null);

  // Hide the "Other" series when nobody was logged under it.
  const series = LABOUR_SERIES.filter((s) => s.key !== "other" || data.some((d) => d.other > 0));
  const total = (d) => series.reduce((sum, s) => sum + (d[s.key] ?? 0), 0);

  const W = 420;
  const H = 230;
  const pad = { top: 26, right: 8, bottom: 30, left: 30 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const { max: yMax, ticks: labourTicks } = niceScale(Math.max(10, ...data.map(total)) * 1.1);
  const slot = innerW / data.length;
  const barW = Math.min(36, slot * 0.56);
  const y = (v) => pad.top + innerH - (v / yMax) * innerH;
  const h = (v) => (v / yMax) * innerH;

  const prior = data.slice(0, -1);
  const avg = prior.length ? prior.reduce((s, d) => s + total(d), 0) / prior.length : null;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-stone-600">
        {series.map((s) => (
          <LegendItem key={s.key} color={s.color} label={s.label} />
        ))}
        {avg !== null && (
          <span className="flex items-center gap-1.5">
            <span className="w-4 border-t-[1.5px] border-dashed border-stone-500" />
            Avg of earlier days ({avg.toFixed(1)})
          </span>
        )}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full select-none" role="img" aria-label="Workers present per day">
          {labourTicks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={GRID} />
              <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill={AXIS_TEXT}>
                {t}
              </text>
            </g>
          ))}

          {data.map((d, i) => {
            const cx = pad.left + slot * i + slot / 2;
            const x0 = cx - barW / 2;
            const isLast = i === data.length - 1;
            const dim = active !== null && active !== i;
            // Stack non-empty segments from the baseline up; 2px surface gap between them,
            // rounded corners only on the topmost segment.
            const segments = series.filter((s) => d[s.key] > 0);
            let base = 0;
            return (
              <g
                key={`${d.date}-${i}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                opacity={dim ? 0.45 : 1}
                className="transition-opacity"
              >
                <rect x={pad.left + slot * i} y={pad.top} width={slot} height={innerH} fill="transparent" />
                {segments.map((s, j) => {
                  const v = d[s.key];
                  const top = base + v;
                  const gap = j > 0 ? 2 : 0;
                  const path = roundedTop(x0, y(top), barW, Math.max(0, h(v) - gap), j === segments.length - 1 ? 4 : 0);
                  base = top;
                  return <path key={s.key} d={path} fill={s.color} />;
                })}
                {isLast && (
                  <text x={cx} y={y(total(d)) - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1c1917">
                    {total(d)}
                  </text>
                )}
                <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill={isLast ? "#1c1917" : AXIS_TEXT} fontWeight={isLast ? 600 : 400}>
                  {d.day}
                </text>
              </g>
            );
          })}

          {avg !== null && (
            <line x1={pad.left} x2={W - pad.right} y1={y(avg)} y2={y(avg)} stroke="#57534e" strokeWidth="1.5" strokeDasharray="5 4" pointerEvents="none" />
          )}
        </svg>

        {active !== null && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs shadow-lg shadow-stone-900/10"
            style={{
              left: `${((pad.left + slot * active + slot / 2) / W) * 100}%`,
              transform: active >= data.length / 2 ? "translateX(calc(-100% - 22px))" : "translateX(22px)",
            }}
          >
            <p className="font-medium text-stone-500">
              {data[active].day}, {data[active].date}
            </p>
            {series.map((s) => (
              <p key={s.key} className="mt-1 flex items-center gap-1.5 text-stone-700">
                <span className="size-2 rounded-sm" style={{ background: s.color }} /> {s.label}
                <b className="ml-auto pl-3 text-stone-900">{data[active][s.key] ?? 0}</b>
              </p>
            ))}
            <p className="mt-1 border-t border-stone-100 pt-1 font-semibold text-stone-900">Total {total(data[active])}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

// Rect path with only the top corners rounded (data-end rounding, flat baseline).
function roundedTop(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, Math.max(h, 0));
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
}

// Round axis: a 1/2/2.5/5 × 10ⁿ step giving about four gridlines up to `value`.
function niceScale(value) {
  const raw = Math.max(value, 1) / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  const max = Math.ceil(value / step) * step;
  const ticks = [];
  for (let t = 0; t <= max; t += step) ticks.push(t);
  return { max, ticks };
}
