import { cn } from "../utils/cn";

export function Brand({ inverse = false, compact = false }: { inverse?: boolean; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "relative grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border",
          inverse ? "border-white/20 bg-white/10 text-[#e7c98b]" : "border-emerald-900/10 bg-[#123f32] text-[#e7c98b]",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 40 40" className="h-7 w-7" fill="none">
          <path d="M20 3.5 25.2 14.8 36.5 20 25.2 25.2 20 36.5 14.8 25.2 3.5 20 14.8 14.8 20 3.5Z" stroke="currentColor" strokeWidth="1.4" />
          <path d="m11.5 11.5 12.9 2.6 4.1 12.9-12.9-2.6-4.1-12.9Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="20" cy="20" r="3.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={cn("block font-display text-[25px] font-semibold tracking-[-0.04em]", inverse ? "text-white" : "text-[#153e32]")}>Noor</span>
          <span className={cn("mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em]", inverse ? "text-white/50" : "text-[#738079]")}>Quran · Roman Urdu</span>
        </span>
      )}
    </div>
  );
}
