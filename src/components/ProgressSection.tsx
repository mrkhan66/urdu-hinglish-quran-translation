import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookMarked, BookOpen, CalendarDays, CheckCircle2, Flame, Library, Target } from "lucide-react";
import { QUICK_REFS, SURAHS, TOTAL_AYAHS, TOTAL_PAGES } from "../data/surahs";
import { referenceParts } from "../lib/quran";
import type { LastRead } from "../types";

interface Props {
  readCount: number;
  openedCount: number;
  bookmarkCount: number;
  readingDays: string[];
  lastRead: LastRead | null;
  nextRef: string;
  onOpen: (surah: number, ayah: number) => void;
  onSearch: () => void;
  onLibrary: () => void;
}

function dayStreak(days: string[]) {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

export default function ProgressSection({ readCount, openedCount, bookmarkCount, readingDays, lastRead, nextRef, onOpen, onSearch, onLibrary }: Props) {
  const [days, setDays] = useState(30);
  const reducedMotion = useReducedMotion();
  const remaining = Math.max(0, TOTAL_AYAHS - readCount);
  const perDay = Math.max(1, Math.ceil(remaining / days));
  const percent = (readCount / TOTAL_AYAHS) * 100;
  const streak = dayStreak(readingDays);
  const next = referenceParts(nextRef);
  const estimatedPages = Math.max(1, Math.ceil((TOTAL_PAGES * (remaining / TOTAL_AYAHS)) / days));
  const reveal = useMemo(() => ({ hidden: { opacity: 0, y: reducedMotion ? 0 : 45 }, visible: { opacity: 1, y: 0 } }), [reducedMotion]);
  const openRef = (ref: string) => { const parts = referenceParts(ref); if (parts) onOpen(parts.surah, parts.ayah); };

  return (
    <section id="progress" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-[1380px]">
        <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="eyebrow">Aap ka safar</p><h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl">Thora parhein.<br /><span className="italic text-[#a27b37]">Mustaqil parhein.</span></h2></div>
          <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">Progress sirf aap ke “parhi gayi” marks se calculate hoti hai; sirf scroll karna ayah ko mukammal mark nahi karta.</p>
        </motion.div>
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.75 }} className="relative overflow-hidden rounded-[30px] bg-[#123f32] p-7 text-white sm:p-9">
            <div className="progress-pattern" aria-hidden="true" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="relative mx-auto h-44 w-44 shrink-0"><svg viewBox="0 0 120 120" className="h-full w-full -rotate-90"><circle cx="60" cy="60" r="51" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="5" /><motion.circle initial={{ strokeDashoffset: 320 }} whileInView={{ strokeDashoffset: 320 - (320 * percent) / 100 }} viewport={{ once: true }} transition={{ duration: reducedMotion ? 0 : 1.3 }} cx="60" cy="60" r="51" fill="none" stroke="#d9bb7d" strokeWidth="5" strokeLinecap="round" strokeDasharray="320" /></svg><div className="absolute inset-0 grid place-content-center text-center"><span className="font-display text-4xl font-semibold">{percent.toFixed(1)}%</span><span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-white/40">Mukammal</span></div></div>
              <div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9bb7d]">Quran progress</p><h3 className="mt-2 font-display text-3xl font-semibold">{readCount.toLocaleString()} <span className="text-lg font-normal text-white/40">/ {TOTAL_AYAHS.toLocaleString()} ayat</span></h3><div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5"><div><p className="font-display text-2xl">{openedCount}</p><p className="mt-1 text-[9px] text-white/40">Surahs khuli</p></div><div><p className="font-display text-2xl">{bookmarkCount}</p><p className="mt-1 text-[9px] text-white/40">Bookmarks</p></div><div><p className="flex items-center gap-1 font-display text-2xl"><Flame size={16} className="text-[#d9bb7d]" />{streak}</p><p className="mt-1 text-[9px] text-white/40">Din streak</p></div></div></div>
            </div>
            {lastRead && <button onClick={() => onOpen(lastRead.surah, lastRead.ayah)} className="relative mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:bg-white/10"><BookOpen size={18} className="shrink-0 text-[#d9bb7d]" /><span className="flex-1"><span className="block text-[9px] uppercase tracking-wider text-white/40">Last read</span><span className="mt-1 block text-xs font-bold">{SURAHS[lastRead.surah - 1].name} · Ayah {lastRead.ayah}</span></span><ArrowRight size={15} /></button>}
          </motion.div>

          <motion.div variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.75, delay: reducedMotion ? 0 : 0.12 }} className="rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-7 sm:p-9">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--selected)] text-[#a27b37]"><Target size={20} /></span><div><p className="eyebrow">Khatam planner</p><h3 className="mt-1 font-display text-2xl font-semibold">Apna waqt chunein</h3></div></div>
            <p className="mt-5 text-xs leading-5 text-[var(--muted)]">Baqi {remaining.toLocaleString()} ayat ke hisaab se rozana ka qabil-e-amal target.</p>
            <div className="mt-5 grid grid-cols-5 gap-1.5">{[30, 60, 90, 180, 365].map((value) => <button key={value} onClick={() => setDays(value)} className={`rounded-xl border py-2.5 text-[10px] font-bold transition ${days === value ? "border-[#a98a50] bg-[var(--selected)] text-[#8d6b31]" : "border-[var(--line)] text-[var(--muted)]"}`}>{value}<span className="block text-[8px] font-medium">din</span></button>)}</div>
            <div className="mt-6 flex items-end gap-5 border-y border-[var(--line)] py-5"><div><span className="font-display text-5xl font-semibold tracking-tight text-[#a27b37]">{perDay}</span><span className="ml-2 text-xs text-[var(--muted)]">ayat / din</span></div><span className="pb-1 text-[10px] text-[var(--muted)]">taqreeban {estimatedPages} safhat / din</span></div>
            <button onClick={() => openRef(nextRef)} className="button-primary mt-6 w-full justify-center"><CalendarDays size={15} />Aaj ka hissa shuru karein{next && <span className="ml-auto text-[10px] opacity-60">{SURAHS[next.surah - 1].name} {nextRef}</span>}</button>
          </motion.div>
        </div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ staggerChildren: reducedMotion ? 0 : 0.1 }} className="mt-20">
          <motion.div variants={reveal} className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="eyebrow">Mutala'a ke nuqta-e-aghaaz</p><h3 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Aham ayat, seedhi rasai</h3></div><button onClick={onSearch} className="flex items-center gap-2 text-xs font-bold text-[#8f6d32]">Poora Quran search karein <ArrowRight size={14} /></button></motion.div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{QUICK_REFS.map((item) => <motion.button variants={reveal} key={item.ref} onClick={() => openRef(item.ref)} className="group rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-[#c2a36a] hover:shadow-[var(--shadow)]"><div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#a27b37]">{item.ref}</span><ArrowRight size={14} className="text-[var(--muted)] transition group-hover:translate-x-1" /></div><h4 className="mt-4 font-display text-xl font-semibold">{item.title}</h4><p className="mt-1.5 text-[11px] text-[var(--muted)]">{item.note}</p></motion.button>)}</div>
        </motion.div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[{ icon: BookMarked, title: "Ayah ko mehfooz rakhein", text: "Bookmark ke saath Arabic aur Roman Urdu text save hota hai, taake aap baad mein seedha usi ayah par wapas aa sakein.", action: "Library kholein", onClick: onLibrary }, { icon: CheckCircle2, title: "Apni samajh likhein", text: "Har ayah ke neeche private note likhein. Aap ka note source translation se alag rehta hai aur device par save hota hai.", action: "Saved notes dekhein", onClick: onLibrary }, { icon: Library, title: "Lafz se ayat dhoondein", text: "Roman Urdu, Urdu ya Arabic mein search karein; reference likh kar kisi bhi surah aur ayah par foran jayein.", action: "Talash shuru karein", onClick: onSearch }].map((item, index) => <motion.article key={item.title} initial={{ opacity: 0, y: reducedMotion ? 0 : 35 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reducedMotion ? 0 : index * 0.1, duration: 0.6 }} className="rounded-[24px] border border-[var(--line)] p-6"><item.icon size={21} className="text-[#a27b37]" /><h4 className="mt-5 font-display text-2xl font-semibold">{item.title}</h4><p className="mt-3 text-xs leading-6 text-[var(--muted)]">{item.text}</p><button onClick={item.onClick} className="mt-5 flex items-center gap-2 text-[11px] font-bold">{item.action}<ArrowRight size={13} /></button></motion.article>)}
        </div>
      </div>
    </section>
  );
}
