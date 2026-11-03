import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import { SURAHS } from "../data/surahs";
import { audioUrl, type QuranAyah } from "../lib/quran";

interface Props {
  ayah: QuranAyah;
  playing: boolean;
  canPrevious: boolean;
  canNext: boolean;
  onPlayingChange: (playing: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  onEnded: () => void;
  onClose: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export default function AudioPlayer({ ayah, playing, canPrevious, canNext, onPlayingChange, onPrevious, onNext, onEnded, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setError("");
    setCurrentTime(0);
    setDuration(0);
    audio.src = audioUrl(ayah);
    audio.playbackRate = rate;
    audio.load();
    if (playing) audio.play().catch(() => onPlayingChange(false));
  // Source should reset only when the ayah changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ayah.global]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.play().catch(() => {
      setError("Audio shuru nahi ho saka. Internet check karke play dobara dabayein.");
      onPlayingChange(false);
    });
    else audio.pause();
  }, [playing, onPlayingChange]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  return (
    <motion.div initial={{ y: 110, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 110, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl sm:inset-x-6 sm:bottom-5">
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[#123d31]/95 text-white shadow-[0_24px_80px_rgba(7,35,27,0.35)] backdrop-blur-xl">
        <audio
          ref={audioRef}
          preload="metadata"
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onEnded={onEnded}
          onError={() => { setError("Recitation load nahi ho saki. Network check karke dobara koshish karein."); onPlayingChange(false); }}
        />
        <div className="flex items-center gap-3 px-4 pb-3 pt-4 sm:px-5">
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d4b778] text-[#143d31] transition hover:scale-105" onClick={() => onPlayingChange(!playing)} aria-label={playing ? "Recitation rokien" : "Recitation chalayein"}>
            {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Volume2 size={12} className="shrink-0 text-[#d4b778]" />
              <p className="truncate text-xs font-bold">Mishary Rashid Alafasy</p>
              <span className="hidden text-[9px] uppercase tracking-wider text-white/40 sm:inline">128 kbps</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-white/60">{SURAHS[ayah.surah - 1].name} · Ayah {ayah.surah}:{ayah.ayah}</p>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={onPrevious} disabled={!canPrevious} className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label="Pichhli ayah"><SkipBack size={15} /></button>
            <button onClick={onNext} disabled={!canNext} className="grid h-8 w-8 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-25" aria-label="Agli ayah"><SkipForward size={15} /></button>
            <select value={rate} onChange={(event) => setRate(Number(event.target.value))} className="ml-1 hidden rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] text-white outline-none sm:block" aria-label="Audio speed">
              {[0.75, 1, 1.25, 1.5].map((value) => <option key={value} value={value} className="bg-[#123d31]">{value}×</option>)}
            </select>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Audio player band karein"><X size={16} /></button>
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 pb-3">
          <span className="w-8 text-[9px] tabular-nums text-white/40">{formatTime(currentTime)}</span>
          <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)} onChange={(event) => { const time = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = time; setCurrentTime(time); }} className="audio-range h-1 flex-1 cursor-pointer" aria-label="Recitation ka waqt" />
          <span className="w-8 text-right text-[9px] tabular-nums text-white/40">{formatTime(duration)}</span>
        </div>
        <AnimatePresence>
          {error && <motion.p initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="flex items-center gap-2 overflow-hidden bg-red-950/40 px-5 text-[10px] text-red-100"><AlertCircle size={12} className="my-2 shrink-0" />{error}</motion.p>}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
