import type { KindleClip, KindleClipType, ParseResult } from "../types";

const DELIMITER = "==========";

function normalizeNewlines(input: string) {
  return input.replace(/\r\n?/g, "\n");
}

function stableId(parts: string[]) {
  // Deterministic, fast-ish hash (djb2)
  const str = parts.join("\u0001");
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return `c_${(h >>> 0).toString(16)}`;
}

function parseTitleAuthor(line: string): { title: string; author?: string; bookKey: string } {
  // Common formats:
  // 1) Title (Author)
  // 2) Title
  // 3) Title (Author, Translator)
  const trimmed = line.trim();
  const m = trimmed.match(/^(.*)\(([^()]*)\)\s*$/);
  if (m) {
    const title = m[1].trim();
    const author = m[2].trim();
    const bookKey = `${title}__${author}`.toLowerCase();
    return { title, author, bookKey };
  }
  const title = trimmed;
  return { title, bookKey: `${title}`.toLowerCase() };
}

function inferType(metaLine: string): KindleClipType {
  const s = metaLine.toLowerCase();
  if (s.includes("highlight") || s.includes("标注") || s.includes("hilight")) return "Highlight";
  if (s.includes("note") || s.includes("笔记")) return "Note";
  if (s.includes("bookmark") || s.includes("书签")) return "Bookmark";
  return "Unknown";
}

function splitMeta(metaLine: string) {
  // Try to preserve original, but extract some pieces if possible.
  // Examples:
  // - Your Highlight on Location 123-124 | Added on Monday...
  // - 您在位置 #123-124 的标注 | 添加于 2020年...
  const locationMatch = metaLine.match(/\bLocation\s+([^|]+?)(\||$)/i);
  const pageMatch = metaLine.match(/\bPage\s+([^|]+?)(\||$)/i);
  const addedMatch = metaLine.match(/\bAdded on\s+(.+)$/i);

  return {
    locationRaw: locationMatch ? locationMatch[1].trim() : undefined,
    pageRaw: pageMatch ? pageMatch[1].trim() : undefined,
    addedOnRaw: addedMatch ? addedMatch[1].trim() : undefined,
  };
}

export function parseMyClippings(input: string): ParseResult {
  const warnings: string[] = [];
  const text = normalizeNewlines(input);

  // Kindle files often start with BOM
  const cleaned = text.replace(/^\uFEFF/, "");

  const blocks = cleaned
    .split(DELIMITER)
    .map((b) => b.trim())
    .filter(Boolean);

  const clips: KindleClip[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    // Many blocks look like:
    // 0: Title (Author)
    // 1: - Your Highlight on Location ... | Added on ...
    // 2: (blank)
    // 3+: content
    if (lines.length < 2) {
      warnings.push("Skipped a malformed entry (too few lines).");
      continue;
    }

    const header = lines[0]?.trim() ?? "";
    const meta = lines[1]?.trim() ?? "";

    const { title, author, bookKey } = parseTitleAuthor(header);
    const type = inferType(meta);
    const { locationRaw, pageRaw, addedOnRaw } = splitMeta(meta);

    // Content: typically after a blank line; but be defensive.
    let contentLines = lines.slice(2);
    // Drop one leading blank line
    if (contentLines.length && contentLines[0].trim() === "") contentLines = contentLines.slice(1);
    const content = contentLines.join("\n").trim();

    // Skip empty bookmarks without content
    if (!content && type === "Bookmark") continue;

    const clip: KindleClip = {
      id: stableId([bookKey, header, meta, content]),
      bookTitle: title,
      bookAuthor: author,
      type,
      locationRaw,
      pageRaw,
      addedOnRaw,
      content,
      rawHeader: header,
    };

    clips.push(clip);
  }

  const map = new Map<string, { title: string; author?: string; clips: KindleClip[] }>();
  for (const c of clips) {
    const key = `${c.bookTitle}__${c.bookAuthor ?? ""}`.toLowerCase();
    const existing = map.get(key);
    if (existing) existing.clips.push(c);
    else map.set(key, { title: c.bookTitle, author: c.bookAuthor, clips: [c] });
  }

  const groups = Array.from(map.entries())
    .map(([bookKey, v]) => ({ bookKey, title: v.title, author: v.author, clips: v.clips }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return {
    totalClips: clips.length,
    groups,
    warnings,
  };
}
