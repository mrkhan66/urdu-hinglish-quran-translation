import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, CornerDownLeft, LoaderCircle, Search } from "lucide-react";
import { QUICK_REFS, SURAHS } from "../data/surahs";
import { isValidReference, referenceParts, searchQuran, stripHtml, type SearchResult } from "../lib/quran";
import Overlay from "./Overlay";

interface Props {
  onClose: () => void;
  onOpen: (surah: number, ayah: number) => void;
}

export default function SearchPalette({ onClose, onOpen }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { window.setTimeout(() => inputRef.current?.focus(), 120); }, []);

  const openRef = (ref: string) => {
    const parts = referenceParts(ref);
    if (parts) onOpen(parts.surah, parts.ayah);
  };

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return;
    if (isValidReference(value)) { openRef(value); return; }
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      setResults(await searchQuran(value));
    } catch (reason) {
      setResults([]);
      setError(reason instanceof Error ? reason.message : "Talash mukammal nahi ho saki.");
    } finally {
      setLoading(false);
    }
  };

  const validRef = isValidReference(query);

  return (
    <Overlay title="Quran mein talash" subtitle="Roman Urdu, اردو، Arabic ya reference — misal 2:255" onClose={onClose} wide>
      <div className="border-b border-[var(--line)] p-5 sm:px-6">
        <form onSubmit={submit} className="flex gap-2">
          <label className="relative min-w-0 flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} className="field h-13 pl-11 pr-4 text-sm" placeholder="sabr, rehmat, صبر یا 2:255..." aria-label="Quran search query" /></label>
          <button type="submit" disabled={!query.trim() || loading} className="button-primary h-13 px-5 disabled:opacity-40">{loading ? <LoaderCircle size={17} className="animate-spin" /> : <CornerDownLeft size={17} />}<span className="hidden sm:inline">Talash</span></button>
        </form>
        {!searched && <div className="mt-4 flex flex-wrap gap-2">{["sabr", "rehmat", "shukr", "tauba", "ilm", "namaz"].map((term) => <button key={term} onClick={() => { setQuery(term); window.setTimeout(() => inputRef.current?.focus(), 0); }} className="rounded-full border border-[var(--line)] px-3 py-1.5 text-[10px] font-semibold text-[var(--muted)] transition hover:border-[#a98b51] hover:text-[var(--ink)]">{term}</button>)}</div>}
      </div>
      <div className="nice-scroll min-h-[280px] flex-1 overflow-y-auto p-4 sm:p-5">
        {validRef && <button onClick={() => openRef(query)} className="mb-4 flex w-full items-center gap-4 rounded-2xl border border-[#c7ab74] bg-[var(--selected)] p-4 text-left"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#1d5544] text-white"><BookOpen size={17} /></span><span className="flex-1"><span className="block text-xs font-bold">Direct ayah kholein: {query}</span><span className="mt-1 block text-[10px] text-[var(--muted)]">Surah aur ayah number verify ho gaya</span></span><ArrowRight size={16} /></button>}
        {loading && <div className="grid min-h-[240px] place-items-center text-center"><div><LoaderCircle className="mx-auto animate-spin text-[#a27b37]" size={26} /><p className="mt-4 text-xs text-[var(--muted)]">Mukammal Quran index mein talash ho rahi hai...</p></div></div>}
        {error && !loading && <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center"><p className="text-sm font-semibold text-red-700 dark:text-red-300">Talash nahi ho saki</p><p className="mt-2 text-xs leading-5 text-[var(--muted)]">{error}</p><button onClick={() => submit()} className="button-secondary mt-4">Dobara koshish karein</button></div>}
        {!loading && !error && searched && results.length === 0 && <div className="grid min-h-[240px] place-items-center text-center"><div><Search className="mx-auto text-[var(--muted)]" size={28} /><p className="mt-4 font-display text-xl font-semibold">Koi ayah nahi mili</p><p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[var(--muted)]">Chhota lafz, doosri spelling ya seedha reference try karein. Misal: “sabr” ya “2:255”.</p></div></div>}
        {!loading && results.length > 0 && <div><p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{results.length} ayah nataij</p><div className="space-y-2">{results.map((result) => <button key={result.ref} onClick={() => onOpen(result.surah, result.ayah)} className="group w-full rounded-2xl border border-[var(--line)] p-4 text-left transition hover:border-[#c4a76f] hover:bg-[var(--soft)]"><div className="flex items-center gap-2"><span className="rounded-full bg-[var(--selected)] px-2.5 py-1 text-[10px] font-bold text-[#8f6d32]">{SURAHS[result.surah - 1].name} · {result.ref}</span><ArrowRight size={13} className="ml-auto text-[var(--muted)] transition group-hover:translate-x-1" /></div>{result.arabic && <p dir="rtl" lang="ar" className="mt-3 line-clamp-2 font-arabic text-2xl leading-relaxed">{result.arabic}</p>}<p dir={!result.roman && result.urdu ? "rtl" : "ltr"} lang={!result.roman && result.urdu ? "ur" : "ur-Latn"} className={`mt-2 line-clamp-3 text-[13px] leading-6 text-[var(--ink-soft)] ${!result.roman && result.urdu ? "text-right font-arabic" : ""}`}>{stripHtml(result.roman || result.urdu) || "Ayah reader mein kholein"}</p></button>)}</div><p className="mt-4 px-2 text-center text-[9px] leading-4 text-[var(--muted)]">Search: Rasikh API · Roman translation: Maududi / QUL–Tarteel · Arabic: Tanzil</p></div>}
        {!searched && !validRef && <div><p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Aham ayat tak foran pohanchein</p><div className="grid gap-2 sm:grid-cols-2">{QUICK_REFS.map((item) => <button key={item.ref} onClick={() => openRef(item.ref)} className="group rounded-2xl border border-[var(--line)] p-4 text-left transition hover:border-[#c4a76f] hover:bg-[var(--soft)]"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#a27b37]">{item.ref}</span><ArrowRight size={13} className="text-[var(--muted)] transition group-hover:translate-x-1" /></div><p className="mt-2 text-sm font-bold">{item.title}</p><p className="mt-1 text-[11px] leading-5 text-[var(--muted)]">{item.note}</p></button>)}</div></div>}
      </div>
    </Overlay>
  );
}
