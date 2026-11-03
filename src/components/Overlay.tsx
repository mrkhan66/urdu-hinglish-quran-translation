import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  side?: boolean;
  wide?: boolean;
}

export default function Overlay({ title, subtitle, onClose, children, side = false, wide = false }: Props) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  if (side) {
    return (
      <div className="fixed inset-0 z-[60]">
        <motion.button aria-label="Panel band karein" className="absolute inset-0 bg-[#071d17]/55 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.section role="dialog" aria-modal="true" aria-label={title} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col border-l border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl">
          <header className="flex shrink-0 items-center gap-4 border-b border-[var(--line)] px-6 py-5"><div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-[var(--muted)]">{subtitle}</p>}</div><button onClick={onClose} className="icon-button" aria-label={`${title} band karein`}><X size={18} /></button></header>
          {children}
        </motion.section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-3 sm:p-6">
      <motion.button aria-label="Dialog band karein" className="fixed inset-0 bg-[#071d17]/65 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.section role="dialog" aria-modal="true" aria-label={title} initial={{ opacity: 0, y: 25, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className={cn("relative my-auto flex max-h-[92svh] w-full flex-col overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-2xl", wide ? "max-w-3xl" : "max-w-xl")}>
        <header className="flex shrink-0 items-center gap-4 border-b border-[var(--line)] px-6 py-5"><div className="min-w-0 flex-1"><h2 className="font-display text-2xl font-semibold tracking-tight">{title}</h2>{subtitle && <p className="mt-1 text-[11px] text-[var(--muted)]">{subtitle}</p>}</div><button onClick={onClose} className="icon-button" aria-label={`${title} band karein`}><X size={18} /></button></header>
        {children}
      </motion.section>
    </div>
  );
}
