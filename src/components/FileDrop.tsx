import { useCallback, useRef } from "react";
import { cn } from "../utils/cn";

type Props = {
  onText: (text: string) => void;
  className?: string;
};

export function FileDrop({ onText, className }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const readFile = useCallback(
    async (file: File) => {
      const text = await file.text();
      onText(text);
    },
    [onText],
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f) void readFile(f);
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Upload My Clippings.txt</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            No server needed. Your file stays in the browser.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void readFile(f);
            }}
          />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={() => inputRef.current?.click()}
          >
            Choose file
          </button>
          <div className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">or drag & drop</div>
        </div>
      </div>
    </div>
  );
}
