import { useMemo, useState } from "react";
import { BookOpen, MapPin, Search, X } from "lucide-react";
import { JUZ_STARTS, SURAHS } from "../data/surahs";
import { cn } from "../utils/cn";

interface Props {
  selected: number;
  onSelect: (surah: number, ayah?: number) => void;
  onClose?: () => void;
}

export default function SurahIndex({ selected, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Makki" | "Madani">("All");
  const [tab, setTab] = useState<"surah" | "juz">("surah");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return SURAHS.filter((surah) => {
      if (filter !== "All" && surah.type !== filter) return false;
      if (!normalized) return true;
      return (
        surah.name.toLowerCase().includes(normalized) ||
        surah.arabic.includes(query.trim()) ||
        surah.meaning.toLowerCase().includes(normalized) ||
        String(surah.number) === normalized
      );
    });
  }, [query, filter]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-[var(--line)] px-5 pb-4 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="eyebrow">Mukammal fehrist</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">Quran ka index</h2>
          </div>
          {onClose && (
            <button className="icon-button lg:hidden" onClick={onClose} aria-label="Index band karein">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="mb-3 grid grid-cols-2 rounded-xl bg-[var(--soft)] p-1">
          <button onClick={() => setTab("surah")} className={cn("rounded-lg py-2 text-xs font-bold transition", tab === "surah" ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm" : "text-[var(--muted)]")}>114 Surahs</button>
          <button onClick={() => setTab("juz")} className={cn("rounded-lg py-2 text-xs font-bold transition", tab === "juz" ? "bg-[var(--surface)] text-[var(--ink)] shadow-sm" : "text-[var(--muted)]")}>30 Paras</button>
        </div>
        {tab === "surah" && (
          <>
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="field h-11 pl-9 pr-9 text-sm" placeholder="Naam, number ya ma'ani..." aria-label="Surah talash karein" />
              {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-label="Talash saaf karein"><X size={14} /></button>}
            </label>
            <div className="mt-3 flex gap-1.5">
              {(["All", "Makki", "Madani"] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={cn("rounded-full border px-3 py-1.5 text-[10px] font-bold transition", filter === item ? "border-[#1e5a47] bg-[#1e5a47] text-white" : "border-[var(--line)] text-[var(--muted)] hover:border-[#1e5a47]")}>{item === "All" ? "Sab" : item}</button>
              ))}
              <span className="ml-auto self-center text-[10px] text-[var(--muted)]">{filtered.length} nataij</span>
            </div>
          </>
        )}
      </div>

      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "surah" ? (
          <div className="space-y-1">
            {filtered.map((surah) => (
              <button key={surah.number} onClick={() => onSelect(surah.number)} className={cn("group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-300", selected === surah.number ? "border-[#cfb477]/60 bg-[var(--selected)] shadow-sm" : "border-transparent hover:border-[var(--line)] hover:bg-[var(--soft)]")}>
                <span className={cn("grid h-9 w-9 shrink-0 rotate-45 place-items-center rounded-[10px] border text-[10px] font-bold transition", selected === surah.number ? "border-[#c4a363] bg-[#c4a363] text-[#173e32]" : "border-[var(--line)] text-[var(--muted)] group-hover:border-[#c4a363]")}><span className="-rotate-45">{surah.number}</span></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-bold">{surah.name}</span>
                  <span className="mt-1 block truncate text-[10px] text-[var(--muted)]">{surah.meaning} · {surah.ayahs} ayat</span>
                </span>
                <span className="font-arabic text-xl text-[var(--ink-soft)]" dir="rtl">{surah.arabic}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-5 py-12 text-center">
                <Search className="mx-auto mb-3 text-[var(--muted)]" size={25} />
                <p className="text-sm font-bold">Koi surah nahi mili</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Spelling badal kar ya number se talash karein.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {JUZ_STARTS.map((juz) => {
              const surah = SURAHS[juz.surah - 1];
              return (
                <button key={juz.juz} onClick={() => onSelect(juz.surah, juz.ayah)} className="group flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-[var(--line)] hover:bg-[var(--soft)]">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--soft)] font-display text-lg font-semibold text-[#a47f3f]">{juz.juz}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold">Para {juz.juz} <span className="font-normal text-[var(--muted)]">· {juz.label}</span></span>
                    <span className="mt-1 flex items-center gap-1 text-[10px] text-[var(--muted)]"><MapPin size={10} /> {surah.name}, ayah {juz.ayah}</span>
                  </span>
                  <BookOpen size={15} className="text-[var(--muted)] transition group-hover:text-[#a47f3f]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="border-t border-[var(--line)] px-5 py-3 text-[10px] leading-4 text-[var(--muted)]">Surah aur para metadata: Tanzil Project</div>
    </div>
  );
}
