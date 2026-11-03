import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Database, Headphones, Languages, ShieldCheck } from "lucide-react";
import { Brand } from "./Brand";

const sources = [
  { icon: ShieldCheck, name: "Tanzil Project", role: "Arabic Uthmani matn aur Urdu Jalandhry tarjuma", detail: "Quran ka Arabic text verbatim dikhaya jata hai. Surah metadata aur Jalandhry Urdu translation bhi Tanzil se attributed hain.", url: "https://tanzil.net", action: "tanzil.net" },
  { icon: Languages, name: "QUL · Tarteel", role: "Maududi ka published Roman Urdu tarjuma", detail: "Quranic Universal Library ka Maududi (Roman Urdu) resource, QUL 281. Text ko app rewrite ya machine-translate nahi karti.", url: "https://qul.tarteel.ai/resources/translation", action: "Translation resource" },
  { icon: Database, name: "Rasikh API", role: "Ayat, tarjume aur full-Quran search", detail: "Free JSON API se 40-ayah chunks mein data load hota hai, numbering validate hoti hai aur khuli surahs device par cache hoti hain.", url: "https://rasikh.ai/docs", action: "API documentation" },
  { icon: Headphones, name: "Islamic Network", role: "Mishary Rashid Alafasy recitation", detail: "Har ayah ka global number use karke 128 kbps recitation stream hoti hai. Audio ke liye internet connection zaroori hai.", url: "https://alquran.cloud", action: "Audio source" },
];

const faqs = [
  { q: "Kya is mein waqai poora Quran hai?", a: "Ji haan. Index mein 114 surahs hain aur reader har surah ki tamam ayat source se load karta hai; total 6,236 ayat. Har surah load ke baad ayah count aur sequence check hoti hai. Settings > Full Quran download se tamam 114 surahs ki TXT file bhi banai ja sakti hai." },
  { q: "Roman Urdu kis ne translate ki?", a: "Roman Urdu text Syed Abul A'la Maududi ke published tarjume ka Roman script edition hai, Quranic Universal Library (Tarteel) se. Ye AI-generated tarjuma ya Arabic ki automatic transliteration nahi. Urdu script option Fateh Muhammad Jalandhry ka tarjuma dikhati hai." },
  { q: "Kya internet ke baghair parh sakte hain?", a: "Jo surahs aap pehle khol chuke hain woh IndexedDB cache mein save hoti hain aur offline dobara khul sakti hain. Nayi surah, global search, full export ke naye hisson aur audio ke liye internet chahiye. Agar network fail ho to app koi banavati ayat nahi dikhati." },
  { q: "Bookmarks, notes aur progress kahan save hote hain?", a: "Ye aap ke browser ke local storage mein rehte hain. Koi account, cloud sync ya personal-data server nahi. Browser data clear karne ya private session khatam hone par ye record hat sakta hai; bookmarks ka TXT export alag se le sakte hain." },
  { q: "Kya tarjuma Quran ka badal hai?", a: "Nahi. Tarjuma ma'ani samajhne ki madad hai, Arabic Quranic text ki jagah nahi. Deeni faisla ya tafseeri masla ho to mustanad aalim aur asal tafsir se rujoo karein. App personal notes ko source translation se wazeh taur par alag rakhti hai." },
];

export default function SourcesFooter({ onSearch, onSettings }: { onSearch: () => void; onSettings: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const reducedMotion = useReducedMotion();
  return (
    <>
      <section id="sources" className="scroll-mt-24 border-y border-[var(--line)] bg-[var(--soft)]/45 px-5 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <motion.div initial={{ opacity: 0, y: reducedMotion ? 0 : 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7 }} className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div><p className="eyebrow">Amanat aur wuzoohat</p><h2 className="mt-3 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl">Har lafz ka<br /><span className="italic text-[#a27b37]">maakhaz wazeh.</span></h2></div>
            <div className="max-w-2xl lg:pt-9"><p className="text-sm leading-7 text-[var(--ink-soft)]">Quran aur us ke tarjume ke saath diyanat ka taqaza hai ke text na badla jaye aur mutarjim ka naam saamne rahe. Noor sirf source ka text dikhata hai—AI se ayat ya tarjuma generate nahi karta.</p><p className="mt-4 text-xs leading-6 text-[var(--muted)]">QUL/Tarteel aur Tanzil translation content ke liye credit aur ghair-tijarati istemal ki sharait laagu hain. Export files mein bhi credit lines shamil hain.</p></div>
          </motion.div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {sources.map((source, index) => <motion.article key={source.name} initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: reducedMotion ? 0 : index * 0.08, duration: 0.55 }} className="flex min-h-[280px] flex-col bg-[var(--surface)] p-6"><source.icon size={21} className="text-[#a27b37]" /><h3 className="mt-5 font-display text-2xl font-semibold">{source.name}</h3><p className="mt-2 text-[11px] font-semibold leading-5 text-[var(--ink-soft)]">{source.role}</p><p className="mt-3 text-[11px] leading-5 text-[var(--muted)]">{source.detail}</p><a href={source.url} target="_blank" rel="noreferrer" className="mt-auto flex items-center gap-1.5 pt-5 text-[10px] font-bold text-[#8f6d32]">{source.action}<ArrowUpRight size={12} /></a></motion.article>)}
          </div>
          <div className="mt-20 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div><p className="eyebrow">Aam sawalat</p><h3 className="mt-3 font-display text-3xl font-semibold">Parhne se pehle<br />jo jaanna zaroori hai.</h3><button onClick={onSearch} className="button-secondary mt-6">Quran search kholein</button></div>
            <div className="border-t border-[var(--line)]">{faqs.map((faq, index) => <div key={faq.q} className="border-b border-[var(--line)]"><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center gap-5 py-5 text-left" aria-expanded={openFaq === index}><span className="text-[10px] font-bold tabular-nums text-[#a27b37]">0{index + 1}</span><span className="flex-1 font-display text-lg font-semibold sm:text-xl">{faq.q}</span><ChevronDown size={17} className={`shrink-0 text-[var(--muted)] transition-transform duration-300 ${openFaq === index ? "rotate-180" : ""}`} /></button><AnimatePresence initial={false}>{openFaq === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="max-w-2xl pb-6 pl-10 pr-8 text-xs leading-6 text-[var(--muted)]">{faq.a}</p></motion.div>}</AnimatePresence></div>)}</div>
          </div>
        </div>
      </section>
      <footer className="bg-[#0d342a] px-5 py-12 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-9"><div className="flex flex-col justify-between gap-8 border-b border-white/10 pb-9 md:flex-row md:items-end"><div><Brand inverse /><p className="mt-5 max-w-md text-xs leading-6 text-white/45">Mukammal Quran, Roman Urdu tarjuma aur soch-samajh kar parhne ke tools. Bila-ads, account ke baghair, aap ki apni zubaan mein.</p></div><div className="flex flex-wrap gap-3"><button onClick={onSearch} className="rounded-full border border-white/15 px-5 py-3 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white">Quran talash karein</button><button onClick={onSettings} className="rounded-full bg-[#d9bb7d] px-5 py-3 text-[11px] font-bold text-[#153e32]">Full Quran download</button></div></div><div className="flex flex-col justify-between gap-3 text-[9px] leading-5 text-white/30 sm:flex-row"><p>Noor · Quran reading experience · Ghair-tijarati istemal</p><p>Arabic: Tanzil · Roman: Maududi / QUL–Tarteel · API: Rasikh · Audio: Islamic Network</p></div></div>
      </footer>
    </>
  );
}
