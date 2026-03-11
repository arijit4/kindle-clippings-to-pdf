import { useEffect, useMemo, useRef, useState } from "react";
import type { BookGroup } from "../types";
import type { PdfThemeId } from "../utils/pdfThemes";
import { getTheme } from "../utils/pdfThemes";
import { exportBookGroupToPdf } from "../utils/pdfExport";
import { inferBookIdentity } from "../utils/bookIdentity";

export function BookList({ groups, themeId }: { groups: BookGroup[]; themeId: PdfThemeId }) {
  const theme = getTheme(themeId);
  const totalClips = groups.reduce((sum, group) => sum + group.clips.length, 0);
  const [pendingGroup, setPendingGroup] = useState<BookGroup | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!pendingGroup) return;
    const inferred = inferBookIdentity(pendingGroup);
    setDraftTitle(inferred.title);
    setDraftAuthor(inferred.author ?? "");
  }, [pendingGroup]);

  useEffect(() => {
    if (!pendingGroup) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingGroup(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => titleInputRef.current?.focus(), 0);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingGroup]);

  const confirmedGroup = useMemo(() => {
    if (!pendingGroup) return null;

    return {
      ...pendingGroup,
      title: draftTitle.trim() || pendingGroup.title,
      author: draftAuthor.trim() || undefined,
    };
  }, [draftAuthor, draftTitle, pendingGroup]);

  const closeDialog = () => setPendingGroup(null);

  const confirmExport = () => {
    if (!confirmedGroup) return;
    exportBookGroupToPdf(confirmedGroup, theme);
    setPendingGroup(null);
  };

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="border-b border-slate-200 p-4 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Detected books</div>
            <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
              {groups.length} book(s) · {totalClips} item(s)
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {groups.map((g) => (
            <div key={g.bookKey} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100" title={g.title}>{g.title}</div>
                <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {g.author ? <span className="block max-w-full truncate" title={g.author}>{g.author}</span> : null}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700 dark:bg-slate-700 dark:text-slate-300">{g.clips.length} item(s)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md active:scale-95 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                  onClick={() => setPendingGroup(g)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4 shrink-0">
                    <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                    <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                  </svg>
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {pendingGroup ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={closeDialog}>
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Confirm export details</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Adjust the detected book title and writer name before generating the PDF.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Book name</span>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 caret-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:caret-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  placeholder="Book title"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Writer name</span>
                <input
                  type="text"
                  value={draftAuthor}
                  onChange={(event) => setDraftAuthor(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 caret-slate-900 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:caret-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-700"
                  placeholder="Author or writer"
                />
              </label>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
                The confirmed values will be used for the PDF title and downloaded file name for this export.
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                onClick={confirmExport}
              >
                Confirm and export
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
