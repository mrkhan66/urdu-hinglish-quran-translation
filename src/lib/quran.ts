import { SURAHS, TOTAL_AYAHS } from "../data/surahs";

const API = "https://api.rasikh.ai/v1";
const TRANSLATIONS = "ur-Latn.maududi,ur.jalandhry";
const CACHE_VERSION = "quran-roman-urdu-v1";
const DB_NAME = "noor-quran-reader";
const STORE = "chapters";

export const ROMAN_CREDIT =
  "Tarjuma: Syed Abul A'la Maududi (Roman Urdu). Data: Quranic Universal Library (Tarteel)";
export const URDU_CREDIT = "Urdu tarjuma: Fateh Muhammad Jalandhry. Data: Tanzil Project";
export const ARABIC_CREDIT = "Arabic matn: Tanzil Project (Uthmani), lafz-ba-lafz";

export interface QuranAyah {
  surah: number;
  ayah: number;
  global: number;
  juz: number;
  page: number;
  arabic: string;
  roman: string;
  urdu: string;
}

export interface Chapter {
  surah: number;
  ayahs: QuranAyah[];
  savedAt: number;
}

export interface SearchResult {
  ref: string;
  surah: number;
  ayah: number;
  arabic: string;
  roman: string;
  urdu: string;
}

interface ApiTranslation {
  key?: string;
  text?: string;
}

interface ApiAyah {
  surah?: number;
  ayah_number?: number;
  ayah?: number;
  global_number?: number;
  global?: number;
  juz?: number;
  page?: number;
  text_uthmani?: string;
  arabic?: string;
  text_ar?: string;
  basmala_prefix?: string | null | { text_uthmani?: string; text_simple?: string };
  translations?: ApiTranslation[];
  reference?: string;
  text?: string;
  excerpt?: string | { text?: string };
  translation?: string;
}

const memoryCache = new Map<number, Chapter>();
const pending = new Map<number, Promise<Chapter>>();

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (!("indexedDB" in window)) return resolve(null);
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

async function idbGet(key: string): Promise<Chapter | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
      request.onsuccess = () => resolve((request.result as Chapter | undefined) ?? null);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(key: string, value: Chapter): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(value, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
      transaction.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getCachedChapter(surah: number): Promise<Chapter | null> {
  const memory = memoryCache.get(surah);
  if (memory) return memory;
  const cached = await idbGet(`${CACHE_VERSION}:${surah}`);
  if (cached?.ayahs?.length) memoryCache.set(surah, cached);
  return cached;
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(
        response.status === 429
          ? "Aaj ki free API limit poori ho gayi hai. Cached surahs parh sakte hain; baad mein dobara koshish karein."
          : `Quran data load nahi ho saka (HTTP ${response.status}). Internet check karke dobara koshish karein.`,
      );
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Server ka jawab der se aa raha hai. Dobara koshish karein.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function translationText(ayah: ApiAyah, key: string): string {
  return ayah.translations?.find((item) => item.key === key)?.text?.trim() ?? "";
}

function normalizeAyah(raw: ApiAyah, expectedSurah: number, expectedAyah: number): QuranAyah {
  const surah = Number(raw.surah ?? expectedSurah);
  const ayah = Number(raw.ayah_number ?? raw.ayah ?? expectedAyah);
  let arabic = String(raw.text_uthmani ?? raw.arabic ?? "").trim();
  const basmalaPrefix = typeof raw.basmala_prefix === "string"
    ? raw.basmala_prefix
    : raw.basmala_prefix?.text_uthmani;
  if (ayah === 1 && basmalaPrefix && arabic.startsWith(basmalaPrefix)) {
    arabic = arabic.slice(basmalaPrefix.length).trim();
  }
  const roman = translationText(raw, "ur-Latn.maududi");
  const urdu = translationText(raw, "ur.jalandhry");
  if (surah !== expectedSurah || ayah !== expectedAyah) {
    throw new Error(`Ayah numbering mismatch: expected ${expectedSurah}:${expectedAyah}.`);
  }
  if (!arabic || !roman || !urdu) {
    throw new Error(`${surah}:${ayah} ka Arabic ya tarjuma adhoora mila. Mukammal data ke liye retry karein.`);
  }
  return {
    surah,
    ayah,
    global: Number(raw.global_number ?? raw.global ?? 0),
    juz: Number(raw.juz ?? 0),
    page: Number(raw.page ?? 0),
    arabic,
    roman,
    urdu,
  };
}

async function downloadChapter(
  surah: number,
  onProgress?: (loaded: number, total: number) => void,
): Promise<Chapter> {
  const meta = SURAHS[surah - 1];
  if (!meta) throw new Error("Surah number 1 se 114 ke darmiyan hona chahiye.");
  const ayahs: QuranAyah[] = [];
  for (let start = 1; start <= meta.ayahs; start += 40) {
    const end = Math.min(start + 39, meta.ayahs);
    const data = (await fetchJson(
      `${API}/ayahs/${surah}:${start}-${end}?translations=${encodeURIComponent(TRANSLATIONS)}`,
    )) as { ayahs?: ApiAyah[] };
    if (!Array.isArray(data.ayahs) || data.ayahs.length !== end - start + 1) {
      throw new Error(`${meta.name} ka ek hissa adhoora mila. Dobara koshish karein.`);
    }
    data.ayahs.forEach((raw, index) => {
      ayahs.push(normalizeAyah(raw, surah, start + index));
    });
    onProgress?.(ayahs.length, meta.ayahs);
  }
  if (ayahs.length !== meta.ayahs || ayahs.some((item, index) => item.ayah !== index + 1)) {
    throw new Error(`${meta.name} ki ayah count verify nahi ho saki.`);
  }
  const chapter: Chapter = { surah, ayahs, savedAt: Date.now() };
  memoryCache.set(surah, chapter);
  await idbSet(`${CACHE_VERSION}:${surah}`, chapter);
  return chapter;
}

export async function fetchChapter(
  surah: number,
  options: { force?: boolean; onProgress?: (loaded: number, total: number) => void } = {},
): Promise<Chapter> {
  if (!options.force) {
    const cached = await getCachedChapter(surah);
    if (cached?.ayahs?.length === SURAHS[surah - 1]?.ayahs) return cached;
  }
  const existing = pending.get(surah);
  if (existing && !options.force) return existing;
  const request = downloadChapter(surah, options.onProgress).finally(() => pending.delete(surah));
  pending.set(surah, request);
  return request;
}

function parseReference(ref: string): { surah: number; ayah: number } | null {
  const match = ref.match(/(?:^|\D)(\d{1,3})\s*[: ]\s*(\d{1,3})(?:\D|$)/);
  if (!match) return null;
  const surah = Number(match[1]);
  const ayah = Number(match[2]);
  if (surah < 1 || surah > 114 || ayah < 1 || ayah > SURAHS[surah - 1].ayahs) return null;
  return { surah, ayah };
}

export function isValidReference(value: string): boolean {
  return /^\s*\d{1,3}\s*[: ]\s*\d{1,3}\s*$/.test(value) && parseReference(value.trim()) !== null;
}

export function referenceParts(value: string): { surah: number; ayah: number } | null {
  return parseReference(value.trim());
}

function rawResultText(raw: ApiAyah): string {
  if (typeof raw.excerpt === "string") return raw.excerpt;
  if (raw.excerpt && typeof raw.excerpt.text === "string") return raw.excerpt.text;
  return raw.translation ?? raw.text ?? "";
}

export async function searchQuran(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    type: "quran",
    limit: "30",
    translations: TRANSLATIONS,
  });
  const data = (await fetchJson(`${API}/search?${params.toString()}`)) as {
    results?: ApiAyah[];
    quran_results?: ApiAyah[];
  };
  const combined = [...(data.results ?? []), ...(data.quran_results ?? [])];
  const seen = new Set<string>();
  const output: SearchResult[] = [];
  for (const raw of combined) {
    const fromRef = raw.reference ? parseReference(raw.reference) : null;
    const surah = Number(raw.surah ?? fromRef?.surah ?? 0);
    const ayah = Number(raw.ayah_number ?? raw.ayah ?? fromRef?.ayah ?? 0);
    if (surah < 1 || surah > 114 || ayah < 1 || ayah > SURAHS[surah - 1].ayahs) continue;
    const ref = `${surah}:${ayah}`;
    if (seen.has(ref)) continue;
    seen.add(ref);
    output.push({
      ref,
      surah,
      ayah,
      arabic: String(raw.text_uthmani ?? raw.arabic ?? raw.text_ar ?? "").trim(),
      roman: translationText(raw, "ur-Latn.maududi") || rawResultText(raw),
      urdu: translationText(raw, "ur.jalandhry"),
    });
    if (output.length >= 30) break;
  }
  return output;
}

export async function fetchSingleAyah(ref: string): Promise<QuranAyah> {
  const parts = parseReference(ref);
  if (!parts) throw new Error("Ayah reference durust nahi hai. Misal: 2:255");
  const data = (await fetchJson(
    `${API}/ayah/${parts.surah}:${parts.ayah}?translations=${encodeURIComponent(TRANSLATIONS)}`,
  )) as ApiAyah;
  return normalizeAyah(data, parts.surah, parts.ayah);
}

export function audioUrl(ayah: QuranAyah): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.global}.mp3`;
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob(["\uFEFF", text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function chapterToText(chapter: Chapter): string {
  const meta = SURAHS[chapter.surah - 1];
  const lines = [
    `NOOR — QURAN ROMAN URDU`,
    `Surah ${meta.number}: ${meta.name} (${meta.arabic})`,
    `${meta.ayahs} ayat | ${meta.type}`,
    "",
  ];
  chapter.ayahs.forEach((ayah) => {
    lines.push(`[${ayah.surah}:${ayah.ayah}]`, ayah.arabic, ayah.roman, ayah.urdu, "");
  });
  lines.push(ARABIC_CREDIT, ROMAN_CREDIT, URDU_CREDIT, "API: https://rasikh.ai — ghair-tijarati istemal");
  return lines.join("\n");
}

export async function exportFullQuran(
  onProgress: (done: number, total: number, current: string) => void,
  shouldCancel: () => boolean,
): Promise<void> {
  const parts: string[] = [
    "NOOR — MUKAMMAL QURAN, ARABIC AUR ROMAN URDU TARJUMA",
    `114 Surahs | ${TOTAL_AYAHS} Ayat`,
    ROMAN_CREDIT,
    URDU_CREDIT,
    ARABIC_CREDIT,
    "Data API: https://rasikh.ai | QUL/Tarteel aur Tanzil ke ghair-tijarati istemal ki sharait laagu hain.",
    "",
  ];
  for (let index = 0; index < SURAHS.length; index += 1) {
    if (shouldCancel()) throw new Error("Export aap ne rok diya.");
    const meta = SURAHS[index];
    onProgress(index, SURAHS.length, meta.name);
    const chapter = await fetchChapter(meta.number);
    parts.push(chapterToText(chapter), "\n------------------------------\n");
    onProgress(index + 1, SURAHS.length, meta.name);
  }
  if (shouldCancel()) throw new Error("Export aap ne rok diya.");
  downloadText("Noor-Mukammal-Quran-Roman-Urdu.txt", parts.join("\n"));
}

export function stripHtml(value: string): string {
  const doc = new DOMParser().parseFromString(value, "text/html");
  return doc.body.textContent ?? value;
}
