import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpen, CheckCircle2, WifiOff, X } from "lucide-react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import SurahIndex from "./components/SurahIndex";
import Reader from "./components/Reader";
import SearchPalette from "./components/SearchPalette";
import LibraryPanel from "./components/LibraryPanel";
import SettingsPanel from "./components/SettingsPanel";
import AudioPlayer from "./components/AudioPlayer";
import ProgressSection from "./components/ProgressSection";
import SourcesFooter from "./components/SourcesFooter";
import { SURAHS, TOTAL_AYAHS } from "./data/surahs";
import { chapterToText, downloadText, fetchChapter, ROMAN_CREDIT, URDU_CREDIT, ARABIC_CREDIT, type Chapter, type QuranAyah } from "./lib/quran";
import { usePersistentState } from "./hooks/usePersistentState";
import { DEFAULT_SETTINGS, type AudioState, type Bookmark, type LastRead, type ReaderSettings } from "./types";
import { cn } from "./utils/cn";

type Panel = "search" | "library" | "settings" | "index" | null;
type Target = { surah: number; ayah: number; key: number } | null;

function hashTarget(): { surah: number; ayah: number } | null {
  const match = window.location.hash.match(/^#\/surah\/(\d{1,3})(?:\/(\d{1,3}))?/);
  if (!match) return null;
  const surah = Number(match[1]);
  const ayah = Number(match[2] ?? 1);
  if (surah < 1 || surah > 114 || ayah < 1 || ayah > SURAHS[surah - 1].ayahs) return null;
  return { surah, ayah };
}

export default function App() {
  const initialHash = useRef(hashTarget()).current;
  const reducedMotion = useReducedMotion();
  const [lastRead, setLastRead] = usePersistentState<LastRead | null>("noor:last-read", null);
  const [bookmarks, setBookmarks] = usePersistentState<Bookmark[]>("noor:bookmarks", []);
  const [notes, setNotes] = usePersistentState<Record<string, string>>("noor:notes", {});
  const [readRefs, setReadRefs] = usePersistentState<Record<string, boolean>>("noor:read-ayahs", {});
  const [readingDays, setReadingDays] = usePersistentState<string[]>("noor:reading-days", []);
  const [openedSurahs, setOpenedSurahs] = usePersistentState<number[]>("noor:opened-surahs", []);
  const [settings, setSettings] = usePersistentState<ReaderSettings>("noor:settings", DEFAULT_SETTINGS);
  const [selectedSurah, setSelectedSurah] = useState(initialHash?.surah ?? lastRead?.surah ?? 1);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState({ loaded: 0, total: SURAHS[selectedSurah - 1].ayahs });
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [target, setTarget] = useState<Target>(initialHash ? { ...initialHash, key: Date.now() } : null);
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(initialHash?.ayah ?? lastRead?.ayah ?? null);
  const [panel, setPanel] = useState<Panel>(null);
  const [audio, setAudio] = useState<AudioState | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  }, []);

  useEffect(() => {
    const onOnline = () => { setOnline(true); showToast("Internet wapas aa gaya"); };
    const onOffline = () => { setOnline(false); showToast("Offline mode: cached surahs available hain"); };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, [showToast]);

  useEffect(() => {
    document.documentElement.style.colorScheme = settings.theme === "dark" ? "dark" : "light";
    document.body.style.background = settings.theme === "dark" ? "#101815" : settings.theme === "sepia" ? "#eee5d3" : "#f4f3ed";
  }, [settings.theme]);

  useEffect(() => {
    if (panel !== "index") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [panel]);

  useEffect(() => {
    let active = true;
    setChapter(null);
    setError("");
    setLoading(true);
    setLoadProgress({ loaded: 0, total: SURAHS[selectedSurah - 1].ayahs });
    fetchChapter(selectedSurah, {
      onProgress: (loaded, total) => { if (active) setLoadProgress({ loaded, total }); },
    }).then((loadedChapter) => {
      if (!active) return;
      setChapter(loadedChapter);
      setLoading(false);
      setOpenedSurahs((previous) => previous.includes(selectedSurah) ? previous : [...previous, selectedSurah].sort((a, b) => a - b));
    }).catch((reason: unknown) => {
      if (!active) return;
      setLoading(false);
      setError(reason instanceof Error ? reason.message : "Quran data load nahi ho saka. Dobara koshish karein.");
    });
    return () => { active = false; };
  }, [selectedSurah, retryKey, setOpenedSurahs]);

  const openSurah = useCallback((surah: number, ayah = 1) => {
    if (surah < 1 || surah > 114) return;
    const validAyah = Math.min(Math.max(1, ayah), SURAHS[surah - 1].ayahs);
    setPanel(null);
    setAudio((current) => current && current.ayah.surah !== surah ? null : current);
    setSelectedSurah(surah);
    setHighlightedAyah(validAyah);
    setTarget({ surah, ayah: validAyah, key: Date.now() });
    setLastRead({ surah, ayah: validAyah, updatedAt: Date.now() });
    window.history.replaceState(null, "", `#/surah/${surah}/${validAyah}`);
    window.setTimeout(() => document.getElementById("reader")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" }), 60);
  }, [reducedMotion, setLastRead]);

  useEffect(() => {
    if (!chapter || !target || chapter.surah !== target.surah) return;
    const timer = window.setTimeout(() => {
      const element = document.getElementById(`ayah-${target.surah}-${target.ayah}`);
      element?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [chapter, target, reducedMotion, initialHash]);

  const onVisible = useCallback((ayah: QuranAyah) => {
    setHighlightedAyah(ayah.ayah);
    setLastRead((previous) => previous?.surah === ayah.surah && previous.ayah === ayah.ayah ? previous : { surah: ayah.surah, ayah: ayah.ayah, updatedAt: Date.now() });
    const today = new Date().toISOString().slice(0, 10);
    setReadingDays((previous) => previous.includes(today) ? previous : [...previous.slice(-399), today]);
  }, [setLastRead, setReadingDays]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable) return;
      if (event.key === "/") { event.preventDefault(); setPanel("search"); }
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleBookmark = (ayah: QuranAyah) => {
    const ref = `${ayah.surah}:${ayah.ayah}`;
    const exists = bookmarks.some((item) => item.ref === ref);
    setBookmarks((previous) => exists ? previous.filter((item) => item.ref !== ref) : [{ ref, surah: ayah.surah, ayah: ayah.ayah, arabic: ayah.arabic, roman: ayah.roman, urdu: ayah.urdu, savedAt: Date.now() }, ...previous]);
    showToast(exists ? `Bookmark ${ref} hata diya` : `Ayah ${ref} save ho gayi`);
  };

  const toggleRead = (ayah: QuranAyah) => {
    const ref = `${ayah.surah}:${ayah.ayah}`;
    const next = !readRefs[ref];
    setReadRefs((previous) => ({ ...previous, [ref]: next }));
    showToast(next ? `Ayah ${ref} parhi gayi mark hui` : `Ayah ${ref} ka mark hata diya`);
  };

  const updateNote = (ref: string, note: string) => {
    setNotes((previous) => {
      const next = { ...previous };
      if (note) next[ref] = note;
      else delete next[ref];
      return next;
    });
  };

  const markChapter = () => {
    if (!chapter) return;
    const allRead = chapter.ayahs.every((ayah) => readRefs[`${ayah.surah}:${ayah.ayah}`]);
    if (allRead) { showToast("Ye surah pehle se mukammal mark hai"); return; }
    if (!window.confirm(`${SURAHS[chapter.surah - 1].name} ki tamam ${chapter.ayahs.length} ayat ko parhi gayi mark karein?`)) return;
    setReadRefs((previous) => {
      const next = { ...previous };
      chapter.ayahs.forEach((ayah) => { next[`${ayah.surah}:${ayah.ayah}`] = true; });
      return next;
    });
    showToast("Surah ki tamam ayat parhi gayi mark ho gayi");
  };

  const exportCurrent = useCallback(() => {
    if (!chapter) { showToast("Pehle surah load hone dein"); return; }
    const meta = SURAHS[chapter.surah - 1];
    downloadText(`Noor-${String(meta.number).padStart(3, "0")}-${meta.name.replace(/[^a-z0-9]/gi, "-")}.txt`, chapterToText(chapter));
    showToast(`${meta.name} TXT download ho gayi`);
  }, [chapter, showToast]);

  const exportBookmarks = () => {
    if (!bookmarks.length) return;
    const lines = ["NOOR — SAVED QURAN AYAT", `${bookmarks.length} bookmarks`, ""];
    [...bookmarks].sort((a, b) => a.surah - b.surah || a.ayah - b.ayah).forEach((item) => {
      lines.push(`[${item.ref}] ${SURAHS[item.surah - 1].name}`, item.arabic, item.roman, item.urdu);
      if (notes[item.ref]) lines.push(`Aap ka note: ${notes[item.ref]}`);
      lines.push("");
    });
    lines.push(ARABIC_CREDIT, ROMAN_CREDIT, URDU_CREDIT);
    downloadText("Noor-Saved-Ayat.txt", lines.join("\n"));
    showToast("Saved ayat download ho gayi");
  };

  const playAyah = (ayah: QuranAyah) => {
    setAudio((current) => current?.ayah.global === ayah.global ? { ...current, playing: !current.playing } : { ayah, playing: true });
  };
  const setAudioPlaying = useCallback((playing: boolean) => setAudio((current) => current ? { ...current, playing } : current), []);
  const audioIndex = audio && chapter?.surah === audio.ayah.surah ? chapter.ayahs.findIndex((ayah) => ayah.global === audio.ayah.global) : -1;
  const moveAudio = (direction: -1 | 1) => {
    if (!audio || !chapter || audioIndex < 0) return;
    const next = chapter.ayahs[audioIndex + direction];
    if (next) setAudio({ ayah: next, playing: true });
  };
  const audioEnded = () => {
    if (settings.autoNextAudio && audio && chapter && audioIndex >= 0 && chapter.ayahs[audioIndex + 1]) moveAudio(1);
    else setAudioPlaying(false);
  };

  const bookmarkedRefs = useMemo(() => new Set(bookmarks.map((item) => item.ref)), [bookmarks]);
  const readCount = useMemo(() => Object.values(readRefs).filter(Boolean).length, [readRefs]);
  const nextRef = useMemo(() => {
    const flat = SURAHS.flatMap((surah) => Array.from({ length: surah.ayahs }, (_, index) => `${surah.number}:${index + 1}`));
    let start = 0;
    if (lastRead) start = SURAHS.slice(0, lastRead.surah - 1).reduce((sum, surah) => sum + surah.ayahs, 0) + lastRead.ayah;
    for (let offset = 0; offset < TOTAL_AYAHS; offset += 1) {
      const ref = flat[(start + offset) % TOTAL_AYAHS];
      if (!readRefs[ref]) return ref;
    }
    return lastRead ? `${lastRead.surah}:${lastRead.ayah}` : "1:1";
  }, [readRefs, lastRead]);

  return (
    <div className={cn("app-root min-h-screen", `theme-${settings.theme}`)}>
      <Header online={online} lastRead={lastRead} bookmarkCount={bookmarks.length} onContinue={() => lastRead && openSurah(lastRead.surah, lastRead.ayah)} onSearch={() => setPanel("search")} onLibrary={() => setPanel("library")} onSettings={() => setPanel("settings")} onIndex={() => setPanel("index")} />
      <Hero chapter={chapter} lastRead={lastRead} loading={loading} onStart={() => openSurah(chapter?.surah ?? selectedSurah, 1)} onContinue={() => lastRead && openSurah(lastRead.surah, lastRead.ayah)} onSearch={() => setPanel("search")} />

      <main>
        <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1540px]">
            <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7 }} className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div><p className="eyebrow">Mukammal Quran reader</p><h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">Surah chunein. <span className="italic text-[#a27b37]">Ma'ani parhein.</span></h2></div>
              <div className="flex items-center gap-2 text-[10px] leading-5 text-[var(--muted)]">{online ? <CheckCircle2 size={14} className="shrink-0 text-[#3d765f]" /> : <WifiOff size={14} className="shrink-0 text-[#a27b37]" />}<span>{online ? "Online mode · khuli surahs offline save hoti hain" : "Aap offline hain · pehle se cached surahs kholein"}</span></div>
            </motion.div>
            <div className="grid items-start gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
              <aside className="sticky top-[93px] hidden h-[calc(100svh-113px)] min-h-[600px] overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)] lg:block"><SurahIndex selected={selectedSurah} onSelect={(surah, ayah) => openSurah(surah, ayah)} /></aside>
              <Reader chapter={chapter} loading={loading} loadProgress={loadProgress} error={error} selectedSurah={selectedSurah} settings={settings} bookmarkedRefs={bookmarkedRefs} readRefs={readRefs} notes={notes} audio={audio} highlightedAyah={highlightedAyah} navigationKey={target?.key ?? 0} onRetry={() => setRetryKey((key) => key + 1)} onOpenIndex={() => setPanel("index")} onOpenSearch={() => setPanel("search")} onOpenSettings={() => setPanel("settings")} onSelectSurah={(surah) => openSurah(surah, 1)} onGoToAyah={(ayah) => openSurah(selectedSurah, ayah)} onVisible={onVisible} onPlay={playAyah} onBookmark={toggleBookmark} onRead={toggleRead} onNote={updateNote} onMarkChapter={markChapter} onExport={exportCurrent} onToast={showToast} />
            </div>
          </div>
        </section>
        <ProgressSection readCount={readCount} openedCount={openedSurahs.length} bookmarkCount={bookmarks.length} readingDays={readingDays} lastRead={lastRead} nextRef={nextRef} onOpen={openSurah} onSearch={() => setPanel("search")} onLibrary={() => setPanel("library")} />
        <SourcesFooter onSearch={() => setPanel("search")} onSettings={() => setPanel("settings")} />
      </main>

      <AnimatePresence>{panel === "search" && <SearchPalette onClose={() => setPanel(null)} onOpen={openSurah} />}</AnimatePresence>
      <AnimatePresence>{panel === "library" && <LibraryPanel bookmarks={bookmarks} notes={notes} readCount={readCount} onClose={() => setPanel(null)} onOpen={openSurah} onDelete={(ref) => { setBookmarks((previous) => previous.filter((item) => item.ref !== ref)); showToast("Bookmark delete ho gaya"); }} onDeleteNote={(ref) => updateNote(ref, "")} onExport={exportBookmarks} onClearProgress={() => { if (window.confirm("Tamam parhi-gayi marks aur reading days reset karein? Bookmarks aur notes nahi hatein ge.")) { setReadRefs({}); setReadingDays([]); showToast("Reading record reset ho gaya"); } }} />}</AnimatePresence>
      <AnimatePresence>{panel === "settings" && <SettingsPanel settings={settings} onChange={setSettings} onClose={() => setPanel(null)} onExportCurrent={exportCurrent} hasChapter={Boolean(chapter)} onToast={showToast} />}</AnimatePresence>
      <AnimatePresence>{panel === "index" && <div className="fixed inset-0 z-[60] lg:hidden"><motion.button className="absolute inset-0 bg-[#071d17]/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(null)} aria-label="Surah index band karein" /><motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 left-0 w-full max-w-[390px] bg-[var(--surface)] text-[var(--ink)] shadow-2xl"><SurahIndex selected={selectedSurah} onSelect={(surah, ayah) => openSurah(surah, ayah)} onClose={() => setPanel(null)} /></motion.aside></div>}</AnimatePresence>
      <AnimatePresence>{audio && <AudioPlayer ayah={audio.ayah} playing={audio.playing} canPrevious={audioIndex > 0} canNext={audioIndex >= 0 && audioIndex < (chapter?.ayahs.length ?? 0) - 1} onPlayingChange={setAudioPlaying} onPrevious={() => moveAudio(-1)} onNext={() => moveAudio(1)} onEnded={audioEnded} onClose={() => setAudio(null)} />}</AnimatePresence>
      <AnimatePresence>{toast && <motion.div initial={{ opacity: 0, y: 15, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className={cn("fixed left-1/2 z-[90] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-2 rounded-2xl bg-[#122f27] px-5 py-3 text-center text-[11px] font-semibold text-white shadow-xl", audio ? "bottom-[130px]" : "bottom-6")} role="status"><BookOpen size={13} className="shrink-0 text-[#d9bb7d]" />{toast}<button onClick={() => setToast("")} className="ml-1 text-white/40 hover:text-white" aria-label="Notification band karein"><X size={12} /></button></motion.div>}</AnimatePresence>
    </div>
  );
}
