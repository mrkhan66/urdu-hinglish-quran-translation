import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Download, FileDown, Moon, Printer, RotateCcw, Square, Sun, Type } from "lucide-react";
import { exportFullQuran } from "../lib/quran";
import { DEFAULT_SETTINGS, type ReaderSettings } from "../types";
import { cn } from "../utils/cn";
import Overlay from "./Overlay";

interface Props {
  settings: ReaderSettings;
  onChange: (settings: ReaderSettings) => void;
  onClose: () => void;
  onExportCurrent: () => void;
  hasChapter: boolean;
  onToast: (message: string) => void;
}

function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: () => void; label: string; detail?: string }) {
  return <button role="switch" aria-checked={checked} onClick={onChange} className="flex w-full items-center gap-3 py-3 text-left"><span className="flex-1"><span className="block text-xs font-bold">{label}</span>{detail && <span className="mt-1 block text-[10px] leading-4 text-[var(--muted)]">{detail}</span>}</span><span className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-[#245c49]" : "bg-[var(--soft-strong)]")}><span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-all", checked ? "left-6" : "left-1")} /></span></button>;
}

export default function SettingsPanel({ settings, onChange, onClose, onExportCurrent, hasChapter, onToast }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, current: "" });
  const [exportError, setExportError] = useState("");
  const cancelRef = useRef(false);
  useEffect(() => () => { cancelRef.current = true; }, []);

  const update = (patch: Partial<ReaderSettings>) => onChange({ ...settings, ...patch });
  const toggleText = (key: "showArabic" | "showRoman" | "showUrdu") => {
    const next = { ...settings, [key]: !settings[key] };
    if (!next.showArabic && !next.showRoman && !next.showUrdu) { onToast("Kam az kam aik text option on rakhein"); return; }
    onChange(next);
  };

  const fullExport = async () => {
    setExporting(true);
    setExportError("");
    setProgress({ done: 0, current: " tayyar ho raha hai" });
    cancelRef.current = false;
    try {
      await exportFullQuran((done, _total, current) => setProgress({ done, current }), () => cancelRef.current);
      onToast("Mukammal Quran TXT download ho gaya");
      setExporting(false);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Export mukammal nahi ho saka";
      setExportError(message);
      setExporting(false);
      if (!message.includes("rok diya")) onToast("Full export adhoora raha; cached data mehfooz hai");
    }
  };

  return (
    <Overlay title="Reading settings" subtitle="Aap ki pasand is device par save hoti hai" onClose={onClose} side>
      <div className="nice-scroll min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <section>
          <p className="eyebrow">Text aur tarjuma</p>
          <div className="mt-2 divide-y divide-[var(--line)]">
            <Toggle checked={settings.showArabic} onChange={() => toggleText("showArabic")} label="Arabic Uthmani matn" detail="Tanzil source, baghair tabdeeli" />
            <Toggle checked={settings.showRoman} onChange={() => toggleText("showRoman")} label="Roman Urdu / Hinglish" detail="Syed Abul A'la Maududi ka tarjuma" />
            <Toggle checked={settings.showUrdu} onChange={() => toggleText("showUrdu")} label="Urdu script bhi dikhayein" detail="Fateh Muhammad Jalandhry ka tarjuma" />
          </div>
        </section>
        <section className="mt-7">
          <p className="eyebrow">Reading theme</p>
          <div className="mt-3 grid grid-cols-3 gap-2">{([{ id: "light", label: "Light", icon: Sun }, { id: "sepia", label: "Sepia", icon: BookOpen }, { id: "dark", label: "Dark", icon: Moon }] as const).map((theme) => <button key={theme.id} onClick={() => update({ theme: theme.id })} className={cn("relative flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-[10px] font-bold transition", settings.theme === theme.id ? "border-[#a88b53] bg-[var(--selected)]" : "border-[var(--line)] hover:bg-[var(--soft)]")}><theme.icon size={17} className="text-[#a27b37]" />{theme.label}{settings.theme === theme.id && <Check size={11} className="absolute right-2 top-2 text-[#a27b37]" />}</button>)}</div>
        </section>
        <section className="mt-7 space-y-6">
          <div><div className="mb-3 flex items-center justify-between"><label htmlFor="arabic-size" className="flex items-center gap-2 text-xs font-bold"><Type size={14} />Arabic font size</label><span className="text-[10px] tabular-nums text-[var(--muted)]">{settings.arabicSize}px</span></div><input id="arabic-size" type="range" min={26} max={56} step={1} value={settings.arabicSize} onChange={(event) => update({ arabicSize: Number(event.target.value) })} className="settings-range" /></div>
          <div><div className="mb-3 flex items-center justify-between"><label htmlFor="translation-size" className="flex items-center gap-2 text-xs font-bold"><Type size={14} />Tarjuma font size</label><span className="text-[10px] tabular-nums text-[var(--muted)]">{settings.translationSize}px</span></div><input id="translation-size" type="range" min={15} max={26} step={1} value={settings.translationSize} onChange={(event) => update({ translationSize: Number(event.target.value) })} className="settings-range" /></div>
          <div><p className="mb-2 text-xs font-bold">Text width</p><div className="grid grid-cols-2 rounded-xl bg-[var(--soft)] p-1"><button onClick={() => update({ width: "focused" })} className={cn("rounded-lg py-2 text-[10px] font-bold", settings.width === "focused" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]")}>Focused</button><button onClick={() => update({ width: "wide" })} className={cn("rounded-lg py-2 text-[10px] font-bold", settings.width === "wide" ? "bg-[var(--surface)] shadow-sm" : "text-[var(--muted)]")}>Wide</button></div></div>
        </section>
        <section className="mt-6 border-t border-[var(--line)] pt-4"><Toggle checked={settings.autoNextAudio} onChange={() => update({ autoNextAudio: !settings.autoNextAudio })} label="Agli ayah auto-play" detail="Recitation ke baad surah ki agli ayah" /></section>
        <button onClick={() => { onChange(DEFAULT_SETTINGS); onToast("Reading settings reset ho gayi"); }} className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-[var(--muted)] transition hover:text-[var(--ink)]"><RotateCcw size={12} />Default settings</button>

        <section className="mt-8 border-t border-[var(--line)] pt-7">
          <p className="eyebrow">Download aur print</p>
          <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={onExportCurrent} disabled={!hasChapter} className="button-secondary justify-center disabled:opacity-30"><Download size={14} />Current surah</button><button onClick={() => window.print()} disabled={!hasChapter} className="button-secondary justify-center disabled:opacity-30"><Printer size={14} />Print / PDF</button></div>
          <div className="mt-4 rounded-2xl border border-[#c9ae78] bg-[var(--selected)] p-4">
            <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#1e5645] text-white"><FileDown size={16} /></span><div><h3 className="text-xs font-bold">Mukammal Quran TXT</h3><p className="mt-1 text-[10px] leading-5 text-[var(--muted)]">114 surahs, 6,236 ayat — Arabic, Roman Urdu aur Urdu script. Har surah asli API se load karke file banegi.</p></div></div>
            {exporting && <div className="mt-4"><div className="h-1.5 overflow-hidden rounded-full bg-[var(--soft-strong)]"><div className="h-full bg-[#1e5645] transition-all" style={{ width: `${(progress.done / 114) * 100}%` }} /></div><p className="mt-2 truncate text-[9px] text-[var(--muted)]">{progress.done}/114 surahs · {progress.current}</p></div>}
            {exportError && <p className="mt-3 text-[10px] leading-4 text-red-700 dark:text-red-300">{exportError}</p>}
            <button onClick={exporting ? () => { cancelRef.current = true; } : fullExport} className={cn("mt-4 w-full justify-center", exporting ? "button-secondary" : "button-primary")}>{exporting ? <><Square size={13} fill="currentColor" />Export rokien</> : <><FileDown size={14} />Full Quran download karein</>}</button>
            <p className="mt-2 text-center text-[9px] leading-4 text-[var(--muted)]">Is mein network aur waqt lag sakta hai. Load shuda surahs cache se aati hain.</p>
          </div>
        </section>
        <section className="mt-8 rounded-2xl bg-[var(--soft)] p-4 text-[10px] leading-5 text-[var(--muted)]"><p className="font-bold text-[var(--ink-soft)]">Text integrity</p><p className="mt-1">Noor ayat generate ya paraphrase nahi karta. Roman tarjuma QUL/Tarteel se, Urdu tarjuma aur Arabic Tanzil se, Rasikh API ke zariye. In sources ki ghair-tijarati istemal aur attribution sharait laagu hain.</p></section>
      </div>
    </Overlay>
  );
}
