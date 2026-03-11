import type { BookGroup } from "../types";

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanTitle(value: string): string {
  const normalized = normalizeSpaces(value)
    .replace(/^[-:|]+\s*/, "")
    .replace(/\s*[-:|]+$/, "")
    .replace(/^"(.+)"$/, "$1")
    .replace(/^'(.+)'$/, "$1");
  return normalized;
}

function cleanAuthor(value: string): string {
  return normalizeSpaces(value)
    .replace(/^by\s+/i, "")
    .replace(/^\((.+)\)$/, "$1")
    .replace(/\s*[-:|]+$/, "");
}

function isLikelyAuthor(value: string): boolean {
  const s = cleanAuthor(value);
  if (!s) return false;
  if (s.length < 2 || s.length > 80) return false;
  if (/\d/.test(s)) return false;
  if (/\b(location|page|added on|highlight|note|bookmark)\b/i.test(s)) return false;
  const wordCount = s.split(" ").length;
  return wordCount <= 8;
}

function parseHeaderCandidates(header: string): Array<{ title: string; author?: string }> {
  const candidates: Array<{ title: string; author?: string }> = [];
  const raw = normalizeSpaces(header);
  if (!raw) return candidates;

  const paren = raw.match(/^(.*)\(([^()]*)\)\s*$/);
  if (paren) {
    const title = cleanTitle(paren[1]);
    const author = cleanAuthor(paren[2]);
    if (title) {
      candidates.push({ title, author: isLikelyAuthor(author) ? author : undefined });
    }
  }

  const bySplit = raw.match(/^(.*?)\s+by\s+(.+)$/i);
  if (bySplit) {
    const title = cleanTitle(bySplit[1]);
    const author = cleanAuthor(bySplit[2]);
    if (title) {
      candidates.push({ title, author: isLikelyAuthor(author) ? author : undefined });
    }
  }

  const dashSplit = raw.match(/^(.*?)\s+-\s+([^|]{2,80})$/);
  if (dashSplit) {
    const title = cleanTitle(dashSplit[1]);
    const author = cleanAuthor(dashSplit[2]);
    if (title) {
      candidates.push({ title, author: isLikelyAuthor(author) ? author : undefined });
    }
  }

  if (candidates.length === 0) {
    candidates.push({ title: cleanTitle(raw) });
  }

  return candidates;
}

function toKey(value: string): string {
  return value.toLowerCase();
}

export function inferBookIdentity(group: BookGroup): { title: string; author?: string } {
  const titleScores = new Map<string, number>();
  const authorScores = new Map<string, number>();
  const titleDisplay = new Map<string, string>();
  const authorDisplay = new Map<string, string>();
  const pairScores = new Map<string, number>();

  const add = (titleValue: string, authorValue: string | undefined, score: number) => {
    const title = cleanTitle(titleValue);
    const author = authorValue ? cleanAuthor(authorValue) : undefined;
    if (!title) return;

    const titleKey = toKey(title);
    titleDisplay.set(titleKey, title);
    titleScores.set(titleKey, (titleScores.get(titleKey) ?? 0) + score);

    if (author && isLikelyAuthor(author) && toKey(author) !== titleKey) {
      const authorKey = toKey(author);
      authorDisplay.set(authorKey, author);
      authorScores.set(authorKey, (authorScores.get(authorKey) ?? 0) + score);
      const pairKey = `${titleKey}__${authorKey}`;
      pairScores.set(pairKey, (pairScores.get(pairKey) ?? 0) + score);
    }
  };

  add(group.title, group.author, 7);
  for (const parsed of parseHeaderCandidates(group.title)) {
    add(parsed.title, parsed.author, 3);
  }

  for (const clip of group.clips) {
    add(clip.bookTitle, clip.bookAuthor, 3);
    for (const parsed of parseHeaderCandidates(clip.rawHeader)) {
      add(parsed.title, parsed.author, 4);
    }
  }

  const sortedTitles = Array.from(titleScores.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return (titleDisplay.get(b[0])?.length ?? 0) - (titleDisplay.get(a[0])?.length ?? 0);
  });

  const fallbackTitle = cleanTitle(group.title) || group.title;
  const bestTitleKey = sortedTitles[0]?.[0] ?? toKey(fallbackTitle);
  const inferredTitle = titleDisplay.get(bestTitleKey) ?? fallbackTitle;

  const authorForTitle = Array.from(pairScores.entries())
    .filter(([pairKey]) => pairKey.startsWith(`${bestTitleKey}__`))
    .sort((a, b) => b[1] - a[1])[0]?.[0]
    ?.split("__")[1];

  const fallbackAuthorKey = Array.from(authorScores.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
  const bestAuthorKey = authorForTitle ?? fallbackAuthorKey;
  const inferredAuthor = bestAuthorKey ? authorDisplay.get(bestAuthorKey) : undefined;

  return {
    title: inferredTitle,
    author: inferredAuthor,
  };
}
