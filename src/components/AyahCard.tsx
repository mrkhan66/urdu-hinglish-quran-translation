import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, CheckCircle2, ChevronDown, Circle, Copy, Pause, Play, Share2, StickyNote } from "lucide-react";
import type { QuranAyah } from "../lib/quran";
import type { ReaderSettings } from "../types";
import { cn } from "../utils/cn";

interface Props {
  ayah: QuranAyah;
  settings: ReaderSettings;
  bookmarked: boolean;
  read: boolean;
  note: string;
  currentAudio: boolean;
  playing: boolean;
  highlighted: boolean;
  onPlay: () => void;
  onBookmark: () => void;
  onRead: () => void;
  onNote: (note: string) => void;
  onToast: (message: string) => void;
}

export default function AyahCard({ ayah, settings, bookmarked, read, note, currentAudio, playing, highlighted, onPlay, onBookmark, onRead, onNote, onToast }: Props) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));
  const ref = `${ayah.surah}:${ayah.ayah}`;
  const shareText = `${ayah.arabic}\n\n${ayah.roman}\n\n— Quran ${ref}\nTarjuma: Maududi (Roman Urdu), QUL/Tarteel · Arabic: Tanzil`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      onToast(`Ayah ${ref} copy ho gayi`);
    } catch {
      onToast("Copy nahi ho saka; text select karke copy karein");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `Quran ${ref}`, text: shareText });
      else {
        await navigator.clipboard.writeText(shareText);
        onToast("Share text copy ho gaya");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      onToast("Share nahi ho saka");
    }
  };

  return (
    <article id={`ayah-${ref.replace(":", "-")}`} data-ayah={ayah.ayah} className={cn("ayah-card group relative border-b border-[var(--line)] px-5 py-8 transition-colors duration-500 sm:px-8 lg:px-10", highlighted && "bg-[var(--selected)]", currentAudio && "bg-[var(--audio)]", read && "ayah-read")}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="ayah-number" aria-label={`Ayah ${ayah.ayah}`}>{ayah.ayah}</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Ayah {ref}</span>
          {ayah.juz > 0 && <span className="hidden rounded-full bg-[var(--soft)] px-2 py-1 text-[9px] font-semibold text-[var(--muted)] sm:inline">Para {ayah.juz}</span>}
          {read && <span className="flex items-center gap-1 text-[10px] font-semibold text-[#36755f]"><Check size={11} /> Parhi gayi</span>}
        </div>
        <div className="flex items-center gap-0.5 sm:opacity-70 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button onClick={onPlay} className={cn("icon-button h-9 w-9", currentAudio && "bg-[#1d5947] text-white hover:bg-[#1d5947]")} title={currentAudio && playing ? "Recitation rokien" : "Recitation sunein"} aria-label={currentAudio && playing ? `Ayah ${ref} ki recitation rokien` : `Ayah ${ref} ki recitation sunein`}>
            {currentAudio && playing ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>
          <button onClick={onBookmark} className={cn("icon-button h-9 w-9", bookmarked && "text-[#a27b37]")} title={bookmarked ? "Bookmark hatayein" : "Bookmark save karein"} aria-label={bookmarked ? `Ayah ${ref} bookmark hatayein` : `Ayah ${ref} bookmark karein`}>
            <Bookmark size={15} fill={bookmarked ? "currentColor" : "none"} />
          </button>
          <button onClick={copy} className="icon-button hidden h-9 w-9 sm:grid" title="Ayah copy karein" aria-label={`Ayah ${ref} copy karein`}><Copy size={14} /></button>
          <button onClick={share} className="icon-button hidden h-9 w-9 sm:grid" title="Ayah share karein" aria-label={`Ayah ${ref} share karein`}><Share2 size={14} /></button>
          <button onClick={() => setNoteOpen((open) => !open)} className={cn("icon-button h-9 w-9", note && "text-[#a27b37]")} title="Apna note" aria-label={`Ayah ${ref} par note`}><StickyNote size={15} /></button>
          <button onClick={onRead} className={cn("icon-button h-9 w-9", read && "text-[#36755f]")} title={read ? "Na-parhi mark karein" : "Parhi gayi mark karein"} aria-label={read ? `Ayah ${ref} na-parhi mark karein` : `Ayah ${ref} parhi gayi mark karein`}>
            {read ? <CheckCircle2 size={16} /> : <Circle size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {settings.showArabic && <p lang="ar" dir="rtl" className="quran-arabic" style={{ fontSize: `${settings.arabicSize}px` }}>{ayah.arabic}</p>}
        {settings.showRoman && (
          <div className="translation-block">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#a27b37]">Roman Urdu · Maududi</p>
            <p className="roman-text" style={{ fontSize: `${settings.translationSize}px` }}>{ayah.roman}</p>
          </div>
        )}
        {settings.showUrdu && (
          <div className="translation-block border-r-2 border-[#c9ab70] pr-4" dir="rtl">
            <p className="mb-2 text-[9px] font-bold tracking-[0.08em] text-[#a27b37]">اردو ترجمہ · جالندھری</p>
            <p lang="ur" className="urdu-text" style={{ fontSize: `${settings.translationSize + 3}px` }}>{ayah.urdu}</p>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        {noteOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-6 rounded-2xl border border-[#d9c69f] bg-[var(--note)] p-4">
              <label htmlFor={`note-${ref}`} className="mb-2 flex items-center justify-between text-[11px] font-bold text-[var(--ink-soft)]">Aap ka zaati note <span className="font-normal text-[var(--muted)]">Device par save hota hai</span></label>
              <textarea id={`note-${ref}`} value={note} onChange={(event) => onNote(event.target.value)} rows={3} className="w-full resize-y bg-transparent text-sm leading-6 outline-none placeholder:text-[var(--muted)]" placeholder="Is ayah se aap ki nazar mein kya sabaq mila? Yahan likhein..." />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-[9px] leading-4 text-[var(--muted)]">
        <span>Arabic: <a href="https://tanzil.net" target="_blank" rel="noreferrer" className="underline decoration-[var(--line)] underline-offset-2">Tanzil</a> · Roman: Maududi / <a href="https://qul.tarteel.ai" target="_blank" rel="noreferrer" className="underline decoration-[var(--line)] underline-offset-2">QUL–Tarteel</a>{settings.showUrdu && " · Urdu: Jalandhry / Tanzil"}</span>
        <button onClick={() => setNoteOpen((open) => !open)} className="flex items-center gap-1 font-semibold opacity-0 transition group-hover:opacity-100 focus:opacity-100">{noteOpen ? "Note chhupayein" : note ? "Note dekhein" : "Note likhein"}<ChevronDown size={10} className={cn("transition", noteOpen && "rotate-180")} /></button>
      </div>
      <div className="mt-3 flex gap-2 sm:hidden">
        <button onClick={copy} className="text-[10px] font-semibold text-[var(--muted)]">Copy</button><span className="text-[var(--line)]">·</span><button onClick={share} className="text-[10px] font-semibold text-[var(--muted)]">Share</button>
      </div>
    </article>
  );
}
