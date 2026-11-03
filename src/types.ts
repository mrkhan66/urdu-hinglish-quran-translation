import type { QuranAyah } from "./lib/quran";

export interface ReaderSettings {
  showArabic: boolean;
  showRoman: boolean;
  showUrdu: boolean;
  arabicSize: number;
  translationSize: number;
  theme: "light" | "sepia" | "dark";
  width: "focused" | "wide";
  autoNextAudio: boolean;
}

export interface LastRead {
  surah: number;
  ayah: number;
  updatedAt: number;
}

export interface Bookmark {
  ref: string;
  surah: number;
  ayah: number;
  arabic: string;
  roman: string;
  urdu: string;
  savedAt: number;
}

export interface AudioState {
  ayah: QuranAyah;
  playing: boolean;
}

export const DEFAULT_SETTINGS: ReaderSettings = {
  showArabic: true,
  showRoman: true,
  showUrdu: false,
  arabicSize: 36,
  translationSize: 18,
  theme: "light",
  width: "focused",
  autoNextAudio: true,
};
