import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight, BookOpen, Search, ShieldCheck } from "lucide-react";
import { SURAHS, TOTAL_AYAHS } from "../data/surahs";
import type { Chapter } from "../lib/quran";
import type { LastRead } from "../types";

interface Props {
  chapter: Chapter | null;
  lastRead: LastRead | null;
  loading: boolean;
  onStart: () => void;
  onContinue: () => void;
  onSearch: () => void;
}

export default function Hero({ chapter, lastRead, loading, onStart, onContinue, onSearch }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const previewY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const previewScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.82]);
  const previewRotate = useTransform(scrollYProgress, [0, 1], [0, 7]);
  const backOneX = useTransform(scrollYProgress, [0, 0.75], [-55, 0]);
  const backTwoX = useTransform(scrollYProgress, [0, 0.75], [55, 0]);
  const backRotate = useTransform(scrollYProgress, [0, 0.75], [-9, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const patternScale = useTransform(scrollYProgress, [0, 1], [1, 1.35]);
  const patternRotate = useTransform(scrollYProgress, [0, 1], [0, 24]);
  const meta = chapter ? SURAHS[chapter.surah - 1] : null;
  const first = chapter?.ayahs[0];

  const reveal = {
    hidden: { y: "110%" },
    visible: (delay: number) => ({ y: "0%", transition: { duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as const } }),
  };

  return (
    <section id="top" ref={ref} className="hero-scene relative min-h-[calc(100svh-73px)] overflow-hidden bg-[#0d342a] text-white">
      <motion.div style={reducedMotion ? undefined : { scale: patternScale, rotate: patternRotate }} className="hero-geometry" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-8 top-[8%] select-none font-arabic text-[210px] leading-none text-white/[0.025] sm:text-[320px] lg:text-[430px]" aria-hidden="true">ٱقۡرَأۡ</div>

      <div className="relative mx-auto grid min-h-[calc(100svh-73px)] max-w-[1500px] items-center gap-12 px-5 pb-24 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-20 lg:pt-8 xl:gap-20">
        <motion.div style={reducedMotion ? undefined : { y: contentY, opacity: contentOpacity }} className="relative z-10 max-w-[720px]">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.7 }} className="mb-7 flex items-center gap-3">
            <span className="h-px w-9 bg-[#d6b977]" />
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#d6c59f]">Mukammal Quran · Aap ki zubaan mein</p>
          </motion.div>
          <h1 className="font-display text-[clamp(3.6rem,7.4vw,7.4rem)] font-medium leading-[0.87] tracking-[-0.065em]">
            <span className="block overflow-hidden pb-2"><motion.span custom={0.08} variants={reveal} initial="hidden" animate="visible" className="block">Quran ko</motion.span></span>
            <span className="block overflow-hidden pb-3"><motion.span custom={0.2} variants={reveal} initial="hidden" animate="visible" className="block italic text-[#e2c58b]">samajh kar</motion.span></span>
            <span className="block overflow-hidden pb-2"><motion.span custom={0.32} variants={reveal} initial="hidden" animate="visible" className="block">parhein.</motion.span></span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.65, duration: reducedMotion ? 0 : 0.8 }} className="mt-7 max-w-[570px] text-[15px] leading-7 text-white/60 sm:text-base">
            114 surahs aur 6,236 ayat — Arabic matn ke saath mukammal <strong className="font-semibold text-white/90">Roman Urdu / Hinglish tarjuma</strong>. Ayah parhein, recitation sunein, apni notes aur progress save karein.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reducedMotion ? 0 : 0.78, duration: reducedMotion ? 0 : 0.8 }} className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={lastRead ? onContinue : onStart} className="group flex h-13 items-center gap-3 rounded-full bg-[#e0c083] px-6 py-4 text-xs font-bold text-[#143c30] shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition hover:bg-[#ecd29e]">
              <BookOpen size={17} />{lastRead ? "Parhna jaari rakhein" : "Al-Faatiha se shuru karein"}<ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button onClick={onSearch} className="flex h-13 items-center gap-2 rounded-full border border-white/15 px-6 py-4 text-xs font-semibold text-white/80 transition hover:border-white/35 hover:bg-white/5 hover:text-white"><Search size={16} />Ayah ya lafz talash karein</button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reducedMotion ? 0 : 1.05 }} className="mt-8 flex items-center gap-2 text-[10px] leading-4 text-white/40"><ShieldCheck size={13} className="shrink-0 text-[#d6b977]" />Published translations, baghair AI rewriting · Source credits har ayah ke saath</motion.div>
        </motion.div>

        <div className="relative mx-auto hidden w-full max-w-[550px] [perspective:1200px] sm:block lg:mx-0">
          <motion.div style={reducedMotion ? undefined : { x: backOneX, rotate: backRotate }} className="absolute inset-x-8 top-8 h-[490px] rounded-[32px] border border-white/10 bg-[#17483a]/70 p-7 shadow-2xl">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">Urdu script · Jalandhry</span>
          </motion.div>
          <motion.div style={reducedMotion ? undefined : { x: backTwoX, rotate: reducedMotion ? 0 : 8 }} className="absolute inset-x-8 top-8 h-[490px] rounded-[32px] border border-[#d9bc7c]/20 bg-[#254f42]/80 p-7 text-right shadow-2xl">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#d9bc7c]/50">Arabic · Tanzil</span>
          </motion.div>
          <motion.article style={reducedMotion ? undefined : { y: previewY, scale: previewScale, rotateX: previewRotate }} initial={{ opacity: 0, rotateY: -8 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: reducedMotion ? 0 : 0.45, duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }} className="relative min-h-[490px] overflow-hidden rounded-[32px] bg-[#f4f0e5] p-7 text-[#173e32] shadow-[0_40px_100px_rgba(0,0,0,0.32)] sm:p-9">
            <div className="absolute right-0 top-0 h-28 w-28 translate-x-8 -translate-y-8 rotate-45 border border-[#b6975d]/25" />
            <div className="flex items-center justify-between border-b border-[#183f32]/10 pb-5">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9a7b43]">Live Quran reader</p><p className="mt-1.5 font-display text-2xl font-semibold">{meta?.name ?? "Surah load ho rahi hai"}</p></div>
              <span className="grid h-11 w-11 rotate-45 place-items-center rounded-xl border border-[#b99a60]/40 text-[11px] font-bold"><span className="-rotate-45">{meta?.number ?? "—"}</span></span>
            </div>
            {first ? (
              <div className="flex min-h-[330px] flex-col">
                <p lang="ar" dir="rtl" className="mt-8 font-arabic text-[35px] leading-[1.9] text-[#173e32]">{first.arabic}</p>
                <div className="mt-7 border-l-2 border-[#c1a064] pl-5"><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9a7b43]">Roman Urdu · Maududi</p><p className="mt-3 font-display text-[23px] leading-[1.45] text-[#254a3e]">{first.roman}</p></div>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8"><span className="text-[10px] text-[#6f7e76]">Ayah {first.surah}:{first.ayah} · Para {first.juz}</span><button onClick={onStart} className="group flex items-center gap-2 text-[11px] font-bold">Poori surah <ArrowRight size={14} className="transition group-hover:translate-x-1" /></button></div>
              </div>
            ) : (
              <div className="flex min-h-[330px] flex-col items-center justify-center text-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#b99a60]/20 border-t-[#b99a60]" /><p className="mt-5 text-xs text-[#6f7e76]">{loading ? "Asli ayat source se load ho rahi hain..." : "Surah kholne ke liye parhna shuru karein"}</p></div>
            )}
          </motion.article>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reducedMotion ? 0 : 1.15 }} className="absolute bottom-6 left-5 right-5 flex items-end justify-between border-t border-white/10 pt-5 sm:left-8 sm:right-8 lg:left-12 lg:right-12">
          <div className="flex gap-7 sm:gap-12">{[["114", "Surahs"], [TOTAL_AYAHS.toLocaleString("en-US"), "Ayat"], ["30", "Paras"]].map(([value, label]) => <div key={label}><span className="font-display text-xl font-semibold text-white/85 sm:text-2xl">{value}</span><span className="ml-2 text-[9px] uppercase tracking-[0.18em] text-white/35">{label}</span></div>)}</div>
          <a href="#reader" className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35 transition hover:text-white sm:flex">Reader tak scroll karein <ArrowDown size={13} className="animate-bounce" /></a>
        </motion.div>
      </div>
    </section>
  );
}
