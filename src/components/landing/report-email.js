import { Icon } from "@/components/icons";
import { claudeReport, project, today, formatBDT } from "@/lib/demo-data";

// Preview of the 10 pm daily report email the owner receives.
export function ReportEmail({ compact = false }) {
  const paragraphs = claudeReport.split("\n\n");
  const shown = compact ? paragraphs.slice(0, 2) : paragraphs;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl shadow-stone-900/5">
      <div className="flex items-center gap-3 border-b border-stone-100 px-5 py-3.5">
        <span className="grid size-9 place-items-center rounded-full bg-emerald-600 text-white">
          <Icon name="eye" className="size-4" strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">Daily report · {project.name}</p>
          <p className="truncate text-xs text-stone-500">reports@sitewatch.bd · 10:00 pm Dhaka · 5:00 pm London</p>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Spent today" value={formatBDT(today.cashSpent)} warn />
          <Stat label="Workers" value={today.masons + today.helpers} warn />
          <Stat label="Budget used" value="64%" />
        </div>

        <div className="space-y-2.5 text-sm leading-relaxed text-stone-700">
          {shown.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>

        {!compact && (
          <div className="grid grid-cols-4 gap-2">
            {["from-stone-300 to-stone-500", "from-amber-200 to-amber-500", "from-slate-300 to-slate-600", "from-orange-200 to-orange-500"].map(
              (tone) => (
                <div key={tone} className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${tone}`} />
              ),
            )}
          </div>
        )}

        <p className="flex items-center gap-1.5 text-xs text-stone-400">
          <Icon name="sparkle" className="size-3.5" />
          Summary written by Claude from today&apos;s log
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, warn }) {
  return (
    <div className={`rounded-xl px-2 py-2.5 ${warn ? "bg-amber-50" : "bg-stone-50"}`}>
      <p className="text-[11px] text-stone-500">{label}</p>
      <p className={`mt-0.5 flex items-center justify-center gap-1 text-sm font-semibold ${warn ? "text-amber-800" : "text-stone-900"}`}>
        {warn && <Icon name="alert" className="size-3.5" strokeWidth={2.2} />}
        {value}
      </p>
    </div>
  );
}
