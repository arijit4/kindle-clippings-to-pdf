import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../utils/cn";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

type TokenSpec = {
  className: string;
  pattern: RegExp;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function applyTokenSpecs(input: string, specs: TokenSpec[]): string {
  const matches: Array<{ start: number; end: number; className: string }> = [];

  for (const spec of specs) {
    for (const match of input.matchAll(spec.pattern)) {
      if (!match[0] || match.index == null) continue;
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        className: spec.className,
      });
    }
  }

  matches.sort((a, b) => (a.start - b.start) || (b.end - a.end));

  const picked: Array<{ start: number; end: number; className: string }> = [];
  let rightMost = -1;
  for (const m of matches) {
    if (m.start >= rightMost) {
      picked.push(m);
      rightMost = m.end;
    }
  }

  if (!picked.length) {
    return escapeHtml(input) || "&nbsp;";
  }

  const chunks: string[] = [];
  let cursor = 0;
  for (const m of picked) {
    if (m.start > cursor) {
      chunks.push(escapeHtml(input.slice(cursor, m.start)));
    }
    chunks.push(`<span class="${m.className}">${escapeHtml(input.slice(m.start, m.end))}</span>`);
    cursor = m.end;
  }
  if (cursor < input.length) {
    chunks.push(escapeHtml(input.slice(cursor)));
  }

  return chunks.join("") || "&nbsp;";
}

const metaSpecs: TokenSpec[] = [
  { className: "k-type", pattern: /\b(Highlight|Note|Bookmark|Unknown)\b/gi },
  { className: "k-label", pattern: /\b(Location|Loc\.?|Page|p\.?|Added on)\b/gi },
  { className: "k-date", pattern: /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b/gi },
  { className: "k-num", pattern: /\b\d+(?:-\d+)?\b/g },
  { className: "k-sep", pattern: /\|/g },
];

const contentSpecs: TokenSpec[] = [
  { className: "k-string", pattern: /"[^"]+"|'[^']+'/g },
  { className: "k-num", pattern: /\b\d+(?:\.\d+)?\b/g },
  { className: "k-brace", pattern: /[()\[\]{}]/g },
];

function renderTitle(raw: string) {
  const parts = raw.match(/^(.*?)(\s*\([^)]*\)\s*)$/);
  if (!parts) {
    return `<span class="k-title">${escapeHtml(raw) || "&nbsp;"}</span>`;
  }
  return `<span class="k-title"><span class="k-title-main">${escapeHtml(parts[1])}</span><span class="k-title-author">${escapeHtml(parts[2])}</span></span>`;
}

function highlightClippings(input: string) {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const next = lines[i + 1]?.trim() ?? "";

    if (trimmed === "==========") {
      output.push(`<span class="k-delim">${escapeHtml(raw) || "=========="}</span>`);
      continue;
    }

    if (trimmed.length > 0 && next.startsWith("- ")) {
      output.push(renderTitle(raw));
      continue;
    }

    if (trimmed.startsWith("- ")) {
      output.push(`<span class="k-meta">${applyTokenSpecs(raw, metaSpecs)}</span>`);
      continue;
    }

    output.push(applyTokenSpecs(raw, contentSpecs));
  }

  return output.join("\n");
}

export function HighlightedTextarea({ value, onChange, placeholder, className }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const overlayRef = useRef<HTMLPreElement | null>(null);

  const highlighted = useMemo(() => highlightClippings(value), [value]);

  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;

    const syncScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    };

    syncScroll();
    textarea.addEventListener("scroll", syncScroll);
    return () => textarea.removeEventListener("scroll", syncScroll);
  }, [value]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-800",
        isFocused
          ? "border-slate-300 ring-2 ring-slate-200 dark:border-slate-500 dark:ring-slate-700"
          : "border-slate-200 dark:border-slate-700",
        className,
      )}
    >
      <pre
        ref={overlayRef}
        aria-hidden
        className="k-editor-scroll pointer-events-none absolute inset-0 z-0 m-0 overflow-auto whitespace-pre-wrap break-words p-3 font-mono text-[12px] leading-5 text-slate-700 dark:text-slate-200"
      >
        <code className="block" dangerouslySetInnerHTML={{ __html: `${highlighted}\n` }} />
      </pre>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="k-editor-scroll relative z-10 block h-80 w-full resize-y overflow-auto bg-transparent p-3 font-mono text-[12px] leading-5 text-transparent caret-blue-700 outline-none placeholder:text-slate-400 selection:bg-sky-300/35 selection:text-transparent dark:caret-amber-300 dark:placeholder:text-slate-500 dark:selection:bg-sky-700/35 dark:selection:text-transparent"
        spellCheck={false}
      />

      <style>{`
        .k-editor-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgb(148, 163, 184) rgb(241, 245, 249);
        }

        .dark .k-editor-scroll {
          scrollbar-color: rgb(71, 85, 105) rgb(30, 41, 59);
        }

        .k-editor-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .k-editor-scroll::-webkit-scrollbar-track {
          background: rgb(241, 245, 249);
          border-radius: 999px;
        }

        .k-editor-scroll::-webkit-scrollbar-thumb {
          background: rgb(148, 163, 184);
          border: 2px solid rgb(241, 245, 249);
          border-radius: 999px;
        }

        .k-editor-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(100, 116, 139);
        }

        .dark .k-editor-scroll::-webkit-scrollbar-track {
          background: rgb(30, 41, 59);
        }

        .dark .k-editor-scroll::-webkit-scrollbar-thumb {
          background: rgb(71, 85, 105);
          border-color: rgb(30, 41, 59);
        }

        .dark .k-editor-scroll::-webkit-scrollbar-thumb:hover {
          background: rgb(100, 116, 139);
        }

        .k-title { color: rgb(15, 23, 42); background: rgba(37, 99, 235, 0.1); }
        .k-title-main { color: rgb(15, 23, 42); }
        .k-title-author { color: rgb(37, 99, 235); }
        .k-meta { color: rgb(30, 41, 59); background: rgba(100, 116, 139, 0.1); }
        .k-delim { color: rgb(71, 85, 105); background: rgb(226, 232, 240); }
        .k-type { color: rgb(180, 83, 9); }
        .k-label { color: rgb(30, 64, 175); }
        .k-date { color: rgb(13, 148, 136); }
        .k-num { color: rgb(127, 29, 29); }
        .k-sep { color: rgb(99, 102, 241); }
        .k-string { color: rgb(22, 163, 74); }
        .k-brace { color: rgb(190, 24, 93); }

        .dark .k-title { color: rgb(241, 245, 249); background: rgba(30, 64, 175, 0.28); }
        .dark .k-title-main { color: rgb(241, 245, 249); }
        .dark .k-title-author { color: rgb(125, 211, 252); }
        .dark .k-meta { color: rgb(226, 232, 240); background: rgba(51, 65, 85, 0.45); }
        .dark .k-delim { color: rgb(148, 163, 184); background: rgb(30, 41, 59); }
        .dark .k-type { color: rgb(251, 191, 36); }
        .dark .k-label { color: rgb(147, 197, 253); }
        .dark .k-date { color: rgb(94, 234, 212); }
        .dark .k-num { color: rgb(252, 165, 165); }
        .dark .k-sep { color: rgb(165, 180, 252); }
        .dark .k-string { color: rgb(134, 239, 172); }
        .dark .k-brace { color: rgb(244, 114, 182); }
      `}</style>
    </div>
  );
}
