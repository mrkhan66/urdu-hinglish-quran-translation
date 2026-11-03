import { Bookmark, BookOpen, CloudOff, Menu, Search, Settings2 } from "lucide-react";
import type { LastRead } from "../types";
import { SURAHS } from "../data/surahs";
import { Brand } from "./Brand";

interface Props {
  online: boolean;
  lastRead: LastRead | null;
  bookmarkCount: number;
  onContinue: () => void;
  onSearch: () => void;
  onLibrary: () => void;
  onSettings: () => void;
  onIndex: () => void;
}

export default function Header({ online, lastRead, bookmarkCount, onContinue, onSearch, onLibrary, onSettings, onIndex }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d342a]/95 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-[73px] max-w-[1540px] items-center gap-2 px-4 sm:gap-5 sm:px-6 lg:px-8">
        <button onClick={onIndex} className="grid h-10 w-10 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 lg:hidden" aria-label="Surah index kholein"><Menu size={20} /></button>
        <a href="#top" aria-label="Noor home"><span className="hidden min-[400px]:block"><Brand inverse /></span><span className="min-[400px]:hidden"><Brand inverse compact /></span></a>
        <nav className="ml-5 hidden items-center gap-6 text-[11px] font-semibold text-white/55 xl:flex">
          <a href="#reader" className="transition hover:text-white">Quran parhein</a>
          <a href="#progress" className="transition hover:text-white">Aap ki progress</a>
          <a href="#sources" className="transition hover:text-white">Sources</a>
        </nav>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {!online && <span className="mr-1 hidden items-center gap-1.5 rounded-full bg-amber-300/10 px-3 py-1.5 text-[10px] font-semibold text-amber-100 sm:flex"><CloudOff size={12} /> Offline · cached surahs</span>}
          {lastRead && <button onClick={onContinue} className="mr-2 hidden items-center gap-2 text-left md:flex"><span className="text-right"><span className="block text-[9px] uppercase tracking-wider text-white/40">Wahin se parhein</span><span className="mt-0.5 block max-w-28 truncate text-[11px] font-semibold text-white/85">{SURAHS[lastRead.surah - 1].name} · {lastRead.ayah}</span></span><BookOpen size={16} className="text-[#d8bb7e]" /></button>}
          <button onClick={onSearch} className="grid h-10 w-10 place-items-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Quran mein talash karein" title="Talash ( / )"><Search size={18} /></button>
          <button onClick={onLibrary} className="relative grid h-10 w-10 place-items-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Saved library kholein" title="Saved library"><Bookmark size={17} />{bookmarkCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#d8bb7e] px-1 text-[8px] font-bold text-[#153e32]">{bookmarkCount > 99 ? "99+" : bookmarkCount}</span>}</button>
          <button onClick={onSettings} className="grid h-10 w-10 place-items-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Settings kholein" title="Settings"><Settings2 size={18} /></button>
        </div>
      </div>
    </header>
  );
}
