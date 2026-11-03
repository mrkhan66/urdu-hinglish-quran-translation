import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCheck, ChevronLeft, ChevronRight, Download, List, LoaderCircle, Printer, RefreshCw, Search, Settings2, X } from "lucide-react";
import { SURAHS } from "../data/surahs";
import type { Chapter, QuranAyah } from "../lib/quran";
import type { AudioState, ReaderSettings } from "../types";
import { cn } from "../utils/cn";
import AyahCard from "./AyahCard";

interface Props {
  chapter: Chapter | null;
  loading: boolean;
  loadProgress: { loaded: number; total: number };
  error: string;
  selectedSurah: number;
  settings: ReaderSettings;
  bookmarkedRefs: Set<string>;
  readRefs: Record<string, boolean>;
  notes: Record<string, string>;
  audio: AudioState | null;
  highlightedAyah: number | null;
  navigationKey: number;
  onRetry: () => void;
  onOpenIndex: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onSelectSurah: (surah: number) => void;
  onGoToAyah: (ayah: number) => void;
  onVisible: (ayah: QuranAyah) => void;
  onPlay: (ayah: QuranAyah) => void;
  onBookmark: (ayah: QuranAyah) => void;
  onRead: (ayah: QuranAyah) => void;
  onNote: (ref: string, note: string) => void;
  onMarkChapter: () => void;
  onExport: () => void;
  onToast: (message: string) => void;
}

export default function Reader(props: Props) {
  const { chapter, loading, loadProgress, error, selectedSurah, settings, bookmarkedRefs, readRefs, notes, audio, highlightedAyah, navigationKey } = props;
  const [localQuery, setLocalQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const meta = SURAHS[selectedSurah - 1];

  useEffect(() => setLocalQuery(""), [selectedSurah, navigationKey]);

  const visibleAyahs = useMemo(() => {
    if (!chapter) return [];
    const query = localQuery.trim().toLowerCase();
    if (!query) return chapter.ayahs;
    return chapter.ayahs.filter((ayah) =>
      ayah.roman.toLowerCase().includes(query) ||
      ayah.urdu.includes(localQuery.trim()) ||
      ayah.arabic.includes(localQuery.trim()) ||
      String(ayah.ayah) === query ||
      `${ayah.surah}:${ayah.ayah}` === query,
    );
  }, [chapter, localQuery]);

  useEffect(() => {
    if (!chapter || !containerRef.current) return;
    const elements = containerRef.current.querySelectorAll<HTMLElement>("[data-ayah]");
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const number = Number((visible.target as HTMLElement).dataset.ayah);
      const ayah = chapter.ayahs[number - 1];
      if (ayah) props.onVisible(ayah);
    }, { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.15, 0.5] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [chapter, localQuery, props.onVisible]);

  const chapterReadCount = chapter?.ayahs.filter((ayah) => readRefs[`${ayah.surah}:${ayah.ayah}`]).length ?? 0;

  return (
    <section id="reader" ref={containerRef} className="scroll-mt-24 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
      <div className="reader-toolbar sticky top-[73px] z-20 flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--surface-glass)] px-4 py-3 backdrop-blur-xl sm:px-5">
        <button onClick={props.onOpenIndex} className="button-secondary h-10 px-3 lg:hidden"><List size={16} /><span className="hidden sm:inline">Surahs</span></button>
        <button onClick={props.onOpenSearch} className="button-secondary h-10 flex-1 justify-start px-3 text-[var(--muted)] sm:flex-none sm:px-4"><Search size={15} /><span className="text-xs font-medium">Quran mein talash</span><kbd className="ml-3 hidden rounded border border-[var(--line)] px-1.5 py-0.5 text-[9px] sm:inline">/</kbd></button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={props.onExport} disabled={!chapter} className="icon-button" title="Is surah ko TXT download karein" aria-label="Surah download karein"><Download size={16} /></button>
          <button onClick={() => window.print()} disabled={!chapter} className="icon-button hidden sm:grid" title="Print ya PDF save karein" aria-label="Surah print karein"><Printer size={16} /></button>
          <button onClick={props.onOpenSettings} className="icon-button" title="Reading settings" aria-label="Reading settings kholein"><Settings2 size={17} /></button>
        </div>
      </div>

      <header className="relative overflow-hidden border-b border-[var(--line)] px-6 py-10 text-center sm:px-10 sm:py-12">
        <div className="surah-header-pattern" aria-hidden="true" />
        <div className="relative">
          <div className="mb-5 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a27b37]">
            <button onClick={() => props.onSelectSurah(selectedSurah - 1)} disabled={selectedSurah === 1} className="icon-button h-8 w-8 disabled:opacity-20" aria-label="Pichhli surah"><ChevronLeft size={16} /></button>
            Surah {meta.number} <span className="h-1 w-1 rounded-full bg-[#c2a36a]" /> {meta.type}
            <button onClick={() => props.onSelectSurah(selectedSurah + 1)} disabled={selectedSurah === 114} className="icon-button h-8 w-8 disabled:opacity-20" aria-label="Agli surah"><ChevronRight size={16} /></button>
          </div>
          <p lang="ar" dir="rtl" className="font-arabic text-5xl leading-normal text-[var(--ink)] sm:text-6xl">{meta.arabic}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{meta.name}</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">{meta.meaning} · {meta.ayahs} ayat</p>
          {chapter && (
            <div className="mx-auto mt-6 flex max-w-sm items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--soft-strong)]"><div className="h-full rounded-full bg-[#c2a36a] transition-all duration-500" style={{ width: `${(chapterReadCount / meta.ayahs) * 100}%` }} /></div>
              <span className="text-[9px] font-semibold tabular-nums text-[var(--muted)]">{chapterReadCount}/{meta.ayahs} parhi gayi</span>
            </div>
          )}
        </div>
      </header>

      {chapter && !loading && (
        <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--soft)]/50 px-5 py-3 sm:flex-row sm:items-center sm:px-8">
          <label className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input value={localQuery} onChange={(event) => setLocalQuery(event.target.value)} className="field h-10 pl-9 pr-9 text-xs" placeholder={`${meta.name} mein lafz ya ayah number talash karein`} aria-label="Is surah mein talash" />
            {localQuery && <button onClick={() => setLocalQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-label="Surah ki talash saaf karein"><X size={13} /></button>}
          </label>
          <div className="flex items-center gap-2">
            <select value={highlightedAyah ?? ""} onChange={(event) => props.onGoToAyah(Number(event.target.value))} className="field h-10 w-[126px] text-xs" aria-label="Ayah par jayein">
              <option value="" disabled>Ayah par jayein</option>
              {Array.from({ length: meta.ayahs }, (_, index) => <option key={index + 1} value={index + 1}>Ayah {index + 1}</option>)}
            </select>
            <button onClick={props.onMarkChapter} className="button-secondary h-10 px-3 text-[10px]" title="Is surah ki tamam ayat ko parhi gayi mark karein"><CheckCheck size={14} /><span className="hidden xl:inline">Surah parhi gayi</span></button>
          </div>
        </div>
      )}

      {loading && (
        <div className="px-6 py-12 sm:px-10">
          <div className="mx-auto max-w-md text-center">
            <LoaderCircle className="mx-auto animate-spin text-[#a27b37]" size={26} />
            <h2 className="mt-4 font-display text-2xl font-semibold">{meta.name} load ho rahi hai</h2>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Arabic, Roman Urdu aur Urdu tarjuma source se hasil kiya ja raha hai.</p>
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--soft-strong)]"><div className="h-full bg-[#1f5c48] transition-all duration-300" style={{ width: `${loadProgress.total ? (loadProgress.loaded / loadProgress.total) * 100 : 4}%` }} /></div>
            <p className="mt-2 text-[10px] tabular-nums text-[var(--muted)]">{loadProgress.loaded} / {loadProgress.total} ayat</p>
          </div>
          <div className="mt-10 space-y-8 opacity-40">{[1, 2, 3].map((item) => <div key={item} className="space-y-4"><div className="ml-auto h-8 w-4/5 rounded bg-[var(--soft-strong)]" /><div className="h-4 w-full rounded bg-[var(--soft)]" /><div className="h-4 w-3/4 rounded bg-[var(--soft)]" /></div>)}</div>
        </div>
      )}

      {error && !loading && (
        <div className="px-6 py-20 text-center sm:px-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-700 dark:text-red-300"><BookOpen size={23} /></span>
          <h2 className="mt-5 font-display text-2xl font-semibold">Surah abhi load nahi ho saki</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">{error}</p>
          <button onClick={props.onRetry} className="button-primary mt-6"><RefreshCw size={15} /> Dobara koshish karein</button>
          <p className="mt-4 text-[10px] text-[var(--muted)]">Pehle se khuli hui surahs offline cache mein mil sakti hain.</p>
        </div>
      )}

      {chapter && !loading && !error && (
        <>
          {selectedSurah !== 1 && selectedSurah !== 9 && !localQuery && (
            <div className="border-b border-[var(--line)] px-6 py-8 text-center">
              <p lang="ar" dir="rtl" className="font-arabic text-[34px] leading-loose text-[var(--ink-soft)]">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            </div>
          )}
          {localQuery && <div className="border-b border-[var(--line)] px-8 py-3 text-[11px] text-[var(--muted)]">{visibleAyahs.length} ayat milin — “{localQuery}”</div>}
          <div className={cn("mx-auto", settings.width === "focused" ? "max-w-[860px]" : "max-w-none")}>
            {visibleAyahs.map((ayah) => {
              const ref = `${ayah.surah}:${ayah.ayah}`;
              const currentAudio = audio?.ayah.global === ayah.global;
              return <AyahCard key={ref} ayah={ayah} settings={settings} bookmarked={bookmarkedRefs.has(ref)} read={Boolean(readRefs[ref])} note={notes[ref] ?? ""} currentAudio={currentAudio} playing={Boolean(currentAudio && audio?.playing)} highlighted={highlightedAyah === ayah.ayah} onPlay={() => props.onPlay(ayah)} onBookmark={() => props.onBookmark(ayah)} onRead={() => props.onRead(ayah)} onNote={(note) => props.onNote(ref, note)} onToast={props.onToast} />;
            })}
          </div>
          {visibleAyahs.length === 0 && <div className="px-8 py-16 text-center"><Search className="mx-auto text-[var(--muted)]" size={25} /><p className="mt-4 font-display text-xl font-semibold">Is surah mein koi natija nahi</p><p className="mt-2 text-xs text-[var(--muted)]">Roman Urdu, Urdu ya Arabic spelling se dobara talash karein.</p><button onClick={() => setLocalQuery("")} className="button-secondary mt-5">Talash saaf karein</button></div>}
          <footer className="border-t border-[var(--line)] bg-[var(--soft)]/40 px-6 py-8 sm:px-10">
            <p className="mx-auto max-w-2xl text-center text-[10px] leading-5 text-[var(--muted)]">Arabic matn: Tanzil Project · Roman Urdu: Syed Abul A'la Maududi, Quranic Universal Library (Tarteel) · Urdu: Fateh Muhammad Jalandhry, Tanzil. Tarjuma Arabic Quran ka badal nahi; ghair-tijarati istemal.</p>
            <div className="mt-7 flex items-center justify-between gap-3">
              <button onClick={() => props.onSelectSurah(selectedSurah - 1)} disabled={selectedSurah === 1} className="button-secondary disabled:opacity-30"><ArrowLeft size={15} /><span className="hidden sm:inline">{selectedSurah > 1 ? SURAHS[selectedSurah - 2].name : "Pichhli"}</span></button>
              <span className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--muted)]">Surah {selectedSurah} / 114</span>
              <button onClick={() => props.onSelectSurah(selectedSurah + 1)} disabled={selectedSurah === 114} className="button-primary disabled:opacity-30"><span className="hidden sm:inline">{selectedSurah < 114 ? SURAHS[selectedSurah].name : "Agli"}</span><ArrowRight size={15} /></button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
