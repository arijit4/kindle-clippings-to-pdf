import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { FileDrop } from "./components/FileDrop";
import { HighlightedTextarea } from "./components/HighlightedTextarea";
import { BookList } from "./components/BookList";
import { parseMyClippings } from "./utils/kindleParser";
import type { PdfThemeId } from "./utils/pdfThemes";
import { themes } from "./utils/pdfThemes";
import { cn } from "./utils/cn";

export type AppTheme = "light" | "dark" | "system";

const SOURCE_CODE_URL = "https://github.com/arijit4/kindle-clippings-to-pdf";

const themeOptions = [
  {
    id: "light",
    label: "Light",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2.25M12 19.75V22M4.93 4.93l1.6 1.6M17.47 17.47l1.6 1.6M2 12h2.25M19.75 12H22M4.93 19.07l1.6-1.6M17.47 6.53l1.6-1.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "system",
    label: "System",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <rect
          x="3.5"
          y="4.5"
          width="17"
          height="12"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M9 19.5h6M7.5 16.5h9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "dark",
    label: "Dark",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
        <path
          d="M14.5 3.5a8 8 0 1 0 6 13.27A9 9 0 1 1 14.5 3.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
] as const satisfies ReadonlyArray<{
  id: AppTheme;
  label: string;
  icon: ReactElement;
}>;

function useAppTheme() {
  const [theme, setThemeState] = useState<AppTheme>(
    () => (localStorage.getItem("app-theme") as AppTheme) ?? "system",
  );
  const mqRef = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    const apply = (t: AppTheme) => {
      const isDark =
        t === "dark" ||
        (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", isDark);
    };
    apply(theme);
    localStorage.setItem("app-theme", theme);
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mqRef.current = mq;
      const handler = () => apply("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  return [theme, setThemeState] as const;
}

export function App() {
  const [rawText, setRawText] = useState("");
  const [themeId, setThemeId] = useState<PdfThemeId>("minimal");
  const [appTheme, setAppTheme] = useAppTheme();

  const parsed = useMemo(() => {
    if (!rawText.trim()) return null;
    return parseMyClippings(rawText);
  }, [rawText]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <header className="border-b border-slate-200/70 bg-white/70 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-4 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Kindle Clippings to PDF</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Convert <span className="font-medium">My Clippings.txt</span> into organized, per-book PDFs — fully client-side.
              </p>
              <a
                href={SOURCE_CODE_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md dark:bg-slate-100 dark:text-slate-900 dark:ring-slate-100/20 dark:hover:bg-white"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.69-.22.69-.48v-1.7c-2.82.62-3.41-1.36-3.41-1.36-.46-1.18-1.13-1.49-1.13-1.49-.93-.64.07-.63.07-.63 1.03.08 1.57 1.06 1.57 1.06.92 1.57 2.41 1.12 3 .86.09-.67.36-1.12.65-1.38-2.25-.26-4.62-1.12-4.62-5a3.93 3.93 0 0 1 1.05-2.74 3.66 3.66 0 0 1 .1-2.7s.85-.27 2.79 1.04a9.73 9.73 0 0 1 5.08 0c1.94-1.31 2.79-1.04 2.79-1.04.38.95.42 1.97.1 2.7a3.93 3.93 0 0 1 1.05 2.74c0 3.89-2.37 4.74-4.63 4.99.37.31.7.92.7 1.86v2.76c0 .26.18.58.7.48A10 10 0 0 0 12 2Z"
                  />
                </svg>
                <span>View and Star on GitHub</span>
              </a>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
                {themeOptions.map((themeOption) => (
                  <button
                    key={themeOption.id}
                    type="button"
                    onClick={() => setAppTheme(themeOption.id)}
                    aria-pressed={appTheme === themeOption.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                      appTheme === themeOption.id
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-slate-100"
                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
                    )}
                  >
                    {themeOption.icon}
                    <span>{themeOption.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <FileDrop onText={(t) => setRawText(t)} />

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Or paste clippings</div>
                </div>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  onClick={() => setRawText("")}
                >
                  Clear
                </button>
              </div>

              <div className="mt-3">
                <HighlightedTextarea
                  value={rawText}
                  onChange={setRawText}
                  placeholder="Paste the full content of My Clippings.txt here"
                />
              </div>

              <div className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Tip: Kindle uses different encodings on some devices. If you see garbled characters, re-save the file as UTF-8 and try again.
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Export settings</div>
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    Pick the PDF style used for each exported book.
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">PDF theme</label>
                  <select
                    value={themeId}
                    onChange={(e) => setThemeId(e.target.value as PdfThemeId)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  >
                    {themes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {parsed ? (
              parsed.groups.length ? (
                <BookList groups={parsed.groups} themeId={themeId} />
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  No clips detected. Make sure you pasted the full file including the "==========" separators.
                </div>
              )
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">How it works</div>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300">
                  <li>Upload <span className="font-medium">My Clippings.txt</span> or paste its contents.</li>
                  <li>The app groups clippings by book title/author.</li>
                  <li>Download a clean PDF per book using your chosen theme.</li>
                </ol>
              </div>
            )}

            {parsed?.warnings?.length ? (
              <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Parsing notes</div>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {parsed.warnings.slice(0, 8).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            ) : null}

          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200/70 bg-white dark:border-slate-700/70 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-600 dark:text-slate-400">
          Made with care and love for fellow readers. No AI was harmed.
        </div>
      </footer>
    </div>
  );
}
