import { useState } from "react";
import { ArrowRight, Bookmark, Download, FileText, StickyNote, Trash2 } from "lucide-react";
import { SURAHS, TOTAL_AYAHS } from "../data/surahs";
import type { Bookmark as BookmarkType } from "../types";
import { referenceParts } from "../lib/quran";
import { cn } from "../utils/cn";
import Overlay from "./Overlay";

interface Props {
  bookmarks: BookmarkType[];
  notes: Record<string, string>;
  readCount: number;
  onClose: () => void;
  onOpen: (surah: number, ayah: number) => void;
  onDelete: (ref: string) => void;
  onDeleteNote: (ref: string) => void;
  onExport: () => void;
  onClearProgress: () => void;
}

export default function LibraryPanel({ bookmarks, notes, readCount, onClose, onOpen, onDelete, onDeleteNote, onExport, onClearProgress }: Props) {
  const [tab, setTab] = useState<"saved" | "notes">("saved");
  const noteEntries = Object.entries(notes).filter(([, note]) => note.trim()).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
  const openRef = (ref: string) => { const parts = referenceParts(ref); if (parts) onOpen(parts.surah, parts.ayah); };

  return (
    <Overlay title="Aap ki library" subtitle="Bookmarks, notes aur parhne ka record — sirf is device par" onClose={onClose} side>
      <div className="grid grid-cols-3 divide-x divide-[var(--line)] border-b border-[var(--line)] bg-[var(--soft)]/50 text-center">
        <div className="p-4"><p className="font-display text-2xl font-semibold">{bookmarks.length}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-[var(--muted)]">Saved</p></div>
        <div className="p-4"><p className="font-display text-2xl font-semibold">{noteEntries.length}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-[var(--muted)]">Notes</p></div>
        <div className="p-4"><p className="font-display text-2xl font-semibold">{readCount}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-[var(--muted)]">Parhi gayi</p></div>
      </div>
      <div className="flex items-center gap-2 border-b border-[var(--line)] p-4">
        <div className="grid flex-1 grid-cols-2 rounded-xl bg-[var(--soft)] p-1"><button onClick={() => setTab("saved")} className={cn("rounded-lg py-2 text-xs font-bold", tab === "saved" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]")}>Bookmarks</button><button onClick={() => setTab("notes")} className={cn("rounded-lg py-2 text-xs font-bold", tab === "notes" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]")}>Zaati notes</button></div>
        {tab === "saved" && <button onClick={onExport} disabled={!bookmarks.length} className="icon-button disabled:opacity-30" title="Bookmarks TXT download karein" aria-label="Bookmarks download karein"><Download size={16} /></button>}
      </div>
      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "saved" && (bookmarks.length ? <div className="space-y-3">{[...bookmarks].sort((a, b) => b.savedAt - a.savedAt).map((item) => <article key={item.ref} className="rounded-2xl border border-[var(--line)] p-4"><div className="flex items-center gap-2"><span className="text-[10px] font-bold text-[#a27b37]">{SURAHS[item.surah - 1].name} · {item.ref}</span><button onClick={() => onDelete(item.ref)} className="icon-button ml-auto h-7 w-7" aria-label={`Bookmark ${item.ref} delete karein`}><Trash2 size={13} /></button></div><p dir="rtl" lang="ar" className="mt-3 line-clamp-2 font-arabic text-2xl leading-relaxed">{item.arabic}</p><p className="mt-2 line-clamp-3 text-xs leading-5 text-[var(--ink-soft)]">{item.roman}</p><button onClick={() => openRef(item.ref)} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#27634f]">Ayah kholein <ArrowRight size={12} /></button></article>)}</div> : <div className="grid min-h-[350px] place-items-center text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]"><Bookmark size={22} /></span><h3 className="mt-4 font-display text-xl font-semibold">Abhi koi bookmark nahi</h3><p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-[var(--muted)]">Reader mein kisi bhi ayah par bookmark icon dabayein. Ayah ka text yahan save ho jayega.</p></div></div>)}
        {tab === "notes" && (noteEntries.length ? <div className="space-y-3">{noteEntries.map(([ref, note]) => { const parts = referenceParts(ref); return <article key={ref} className="rounded-2xl border border-[#d7c39c] bg-[var(--note)] p-4"><div className="flex items-center gap-2"><span className="flex items-center gap-1.5 text-[10px] font-bold text-[#9b783c]"><StickyNote size={12} />{parts ? `${SURAHS[parts.surah - 1].name} · ${ref}` : ref}</span><button onClick={() => onDeleteNote(ref)} className="icon-button ml-auto h-7 w-7" aria-label={`Note ${ref} delete karein`}><Trash2 size={13} /></button></div><p className="mt-3 whitespace-pre-wrap text-[13px] leading-6">{note}</p><button onClick={() => openRef(ref)} className="mt-3 flex items-center gap-1.5 text-[10px] font-bold text-[#27634f]">Ayah par wapas jayein <ArrowRight size={12} /></button></article>; })}</div> : <div className="grid min-h-[350px] place-items-center text-center"><div><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--soft)] text-[var(--muted)]"><FileText size={22} /></span><h3 className="mt-4 font-display text-xl font-semibold">Aap ke notes yahan aayein ge</h3><p className="mx-auto mt-2 max-w-[260px] text-xs leading-5 text-[var(--muted)]">Ayah ke note icon par apna reflection likhein. Notes translation se alag aur private rehte hain.</p></div></div>)}
      </div>
      <footer className="shrink-0 border-t border-[var(--line)] p-4"><div className="mb-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--soft-strong)]"><div className="h-full bg-[#b6975d]" style={{ width: `${(readCount / TOTAL_AYAHS) * 100}%` }} /></div><span className="text-[9px] text-[var(--muted)]">{((readCount / TOTAL_AYAHS) * 100).toFixed(1)}% Quran</span></div><button onClick={onClearProgress} disabled={!readCount} className="w-full text-center text-[10px] font-semibold text-[var(--muted)] transition hover:text-red-600 disabled:opacity-30">Parhne ka record reset karein</button></footer>
    </Overlay>
  );
}
