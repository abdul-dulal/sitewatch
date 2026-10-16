import { Icon } from "@/components/icons";

// Static preview of the manager's evening log form (mobile-first).
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[280px] rounded-[2.6rem] border border-stone-800 bg-stone-900 p-2.5 shadow-2xl shadow-stone-900/30">
      <div className="absolute left-1/2 top-3.5 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-stone-900" />
      <div className="overflow-hidden rounded-[2.1rem] bg-white">
        <div className="bg-emerald-600 px-5 pb-4 pt-9 text-white">
          <p className="text-xs opacity-80">Rahman Residence · Dream home</p>
          <p className="mt-0.5 text-lg font-semibold">Today&apos;s log</p>
          <p className="text-xs opacity-80">Thursday, 15 October</p>
        </div>

        <div className="space-y-3 p-4 text-sm">
          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">Workers</p>
            <div className="grid grid-cols-2 gap-2">
              <Counter label="Masons" value="11" />
              <Counter label="Helpers" value="17" />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">
              Materials used
            </p>
            <div className="space-y-1.5">
              <Row label="Cement" value="38 bags" />
              <Row label="Rod" value="0.4 t" />
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 px-3 py-2">
            <p className="text-xs text-stone-500">Cash spent today</p>
            <p className="text-lg font-semibold text-stone-900">$595</p>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-stone-500">
              Photos (4)
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                "from-stone-300 to-stone-500",
                "from-amber-200 to-amber-500",
                "from-slate-300 to-slate-600",
                "from-orange-200 to-orange-500",
              ].map((tone) => (
                <div
                  key={tone}
                  className={`aspect-square rounded-lg bg-gradient-to-br ${tone}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            tabIndex={-1}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-base font-semibold text-white"
          >
            <Icon name="check" className="size-4" strokeWidth={2.5} />
            Submit log
          </button>
        </div>
      </div>
    </div>
  );
}

function Counter({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 px-2 py-1.5">
      <span className="grid size-7 place-items-center rounded-lg bg-stone-100 text-stone-500">
        <Icon name="minus" className="size-3.5" strokeWidth={2.5} />
      </span>
      <span className="text-center leading-tight">
        <span className="block text-base font-semibold">{value}</span>
        <span className="block text-[10px] text-stone-500">{label}</span>
      </span>
      <span className="grid size-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon name="plus" className="size-3.5" strokeWidth={2.5} />
      </span>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-1.5">
      <span>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
