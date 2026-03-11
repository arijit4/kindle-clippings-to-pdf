import type { BookGroup, KindleClip } from "../types";
import type { PdfTheme } from "./pdfThemes";

function safeFileName(name: string) {
  const cleaned = name
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= 160) {
    return cleaned;
  }

  const extensionIndex = cleaned.lastIndexOf(".");
  const hasExtension = extensionIndex > 0 && extensionIndex < cleaned.length - 1;

  if (!hasExtension) {
    return `${cleaned.slice(0, 157).trim()}...`;
  }

  const extension = cleaned.slice(extensionIndex);
  const baseName = cleaned.slice(0, extensionIndex).trim();
  const maxBaseLength = Math.max(1, 160 - extension.length - 3);

  return `${baseName.slice(0, maxBaseLength).trim()}...${extension}`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function rgb(c: [number, number, number]): string {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function ptToMm(pt: number): number {
  return Math.round(pt * 0.352778 * 10) / 10;
}

function buildCss(theme: PdfTheme): string {
  const m = ptToMm(theme.page.marginPt);
  const sectionGap = ptToMm(theme.page.sectionGapPt);
  const headerGap = ptToMm(theme.page.headerGapPt);
  const lineGap = ptToMm(theme.page.lineGapPt);
  const isMinimal = theme.id === "minimal";
  const isKindle = theme.id === "kindle";
  const isModern = theme.id === "modern";

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --text: ${rgb(theme.colors.text)};
      --muted: ${rgb(theme.colors.muted)};
      --rule: ${rgb(theme.colors.rule)};
      --accent: ${rgb(theme.colors.accent)};
      --chip-bg: ${rgb(theme.colors.chipBg)};
    }

    body {
      font-family: ${theme.fonts.body};
      color: var(--text);
      background: white;
      padding: ${m}mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    @media print {
      @page { margin: ${m}mm; size: A4; }
      body { padding: 0; }
    }

    h1 {
      font-size: 16pt;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 6pt;
      word-break: break-word;
    }

    .author {
      font-size: 10pt;
      color: var(--muted);
      margin-bottom: 6pt;
      word-break: break-word;
    }

    .count {
      font-size: 9.5pt;
      color: var(--muted);
      margin-bottom: ${headerGap}mm;
    }

    .header-rule {
      border: none;
      border-top: 0.6pt solid var(--rule);
      margin-bottom: ${sectionGap}mm;
    }

    .clip {
      margin-bottom: ${sectionGap}mm;
      break-inside: avoid;
    }

    .chip {
      display: inline-block;
      background: var(--chip-bg);
      color: var(--accent);
      border-radius: 999pt;
      padding: 2.5pt 7pt;
      font-size: 8.5pt;
      font-weight: 600;
      letter-spacing: 0.01em;
      font-family: ${theme.fonts.body};
      margin-bottom: 5pt;
    }

    .clip-meta {
      font-size: 9pt;
      color: var(--muted);
      font-family: ${theme.fonts.body};
      margin-bottom: ${lineGap}mm;
      word-break: break-word;
    }

    .clip-content {
      font-size: 11pt;
      font-family: ${theme.fonts.body};
      line-height: ${isMinimal ? 1.72 : isKindle ? 1.68 : isModern ? 1.64 : 1.6};
      word-break: break-word;
      white-space: pre-wrap;
    }

    .clip-rule {
      border: none;
      border-top: 0.4pt solid var(--rule);
      margin-top: ${sectionGap}mm;
    }

    body.theme-minimal {
      background: #ffffff;
    }

    body.theme-kindle {
      background: rgb(252, 248, 242);
    }

    .theme-kindle .header {
      margin-bottom: ${sectionGap}mm;
      padding-bottom: ${headerGap}mm;
      border-bottom: 1.2pt solid rgb(51, 51, 51);
    }

    .theme-kindle .book-row {
      display: flex;
      align-items: flex-start;
      gap: 14pt;
      margin-bottom: ${headerGap}mm;
    }

    .theme-kindle .book-cover {
      width: 72pt;
      height: 108pt;
      object-fit: cover;
      border: 0.75pt solid rgb(214, 204, 187);
      border-radius: 2pt;
      flex-shrink: 0;
      background: rgb(246, 239, 226);
    }

    .theme-kindle .book-meta {
      min-width: 0;
    }

    .theme-kindle .kicker {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 6pt;
    }

    .theme-kindle .book-link {
      font-size: 8.5pt;
      color: rgb(38, 113, 157);
      margin-top: 5pt;
      word-break: break-word;
    }

    .theme-kindle h1 {
      font-size: 21pt;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 4pt;
      line-height: 1.18;
    }

    .theme-kindle .author {
      font-size: 11pt;
      margin-bottom: 0;
      color: rgb(74, 66, 55);
    }

    .theme-kindle .count {
      margin-bottom: 0;
      font-size: 10.5pt;
      letter-spacing: 0;
      text-transform: none;
      color: rgb(79, 70, 58);
    }

    .theme-kindle .header-rule {
      display: none;
    }

    .theme-kindle .clips {
      display: grid;
      gap: 0;
    }

    .theme-kindle .clip {
      margin-bottom: 0;
      padding: 10pt 0 11pt;
      border-bottom: 0.75pt solid rgb(224, 224, 224);
    }

    .theme-kindle .clip-meta {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0;
      margin-bottom: 5pt;
      color: rgb(93, 83, 68);
    }

    .theme-kindle .clip-content {
      font-size: 11pt;
      color: rgb(54, 44, 33);
      border-left: 4pt solid rgb(232, 212, 88);
      background: rgb(251, 251, 251);
      padding: 7pt 9pt;
      line-height: 1.62;
    }

    .theme-kindle .clip:last-child {
      border-bottom: none;
    }

    .theme-minimal .header {
      margin-bottom: ${sectionGap}mm;
      padding: 0 0 ${headerGap}mm;
      border-bottom: 1pt solid var(--rule);
    }

    .theme-minimal h1 {
      font-size: 19pt;
      letter-spacing: -0.02em;
      margin-bottom: 4pt;
    }

    .theme-minimal .count {
      margin-bottom: 0;
      font-size: 9pt;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .theme-minimal .header-rule {
      display: none;
    }

    .theme-minimal .clips {
      display: grid;
      gap: ${sectionGap}mm;
    }

    .theme-minimal .clip {
      margin-bottom: 0;
      padding: 14pt 15pt 15pt;
      border: 0.75pt solid var(--rule);
      border-radius: 14pt;
      background: linear-gradient(180deg, rgb(255, 255, 255) 0%, rgb(249, 250, 251) 100%);
      box-shadow: 0 6pt 18pt rgba(15, 23, 42, 0.04);
      position: relative;
      overflow: hidden;
    }

    .theme-minimal .clip::before {
      content: "";
      position: absolute;
      inset: 0 auto 0 0;
      width: 3pt;
      background: linear-gradient(180deg, var(--accent) 0%, rgb(125, 211, 252) 100%);
    }

    .theme-minimal .chip {
      margin-left: 1pt;
      box-shadow: inset 0 0 0 0.75pt rgba(14, 116, 144, 0.08);
    }

    .theme-minimal .clip-meta {
      font-size: 8.8pt;
      letter-spacing: 0.01em;
    }

    .theme-minimal .clip-content {
      font-size: 10.8pt;
      color: rgb(31, 41, 55);
    }

    body.theme-modern {
      background: rgb(248, 250, 252);
    }

    .theme-modern .header {
      margin-bottom: ${sectionGap}mm;
      padding: 14pt 16pt;
      border: 0.75pt solid var(--rule);
      border-radius: 14pt;
      background: linear-gradient(145deg, rgb(255, 255, 255) 0%, rgb(241, 245, 249) 100%);
      box-shadow: 0 6pt 16pt rgba(15, 23, 42, 0.06);
    }

    .theme-modern h1 {
      margin-bottom: 4pt;
      font-size: 20pt;
      font-weight: 750;
      line-height: 1.18;
      letter-spacing: -0.015em;
      color: rgb(15, 23, 42);
    }

    .theme-modern .author {
      margin-bottom: 7pt;
      font-size: 10pt;
      color: rgb(71, 85, 105);
    }

    .theme-modern .count {
      margin-bottom: 0;
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: rgb(51, 65, 85);
    }

    .theme-modern .header-rule {
      display: none;
    }

    .theme-modern .clips {
      display: grid;
      gap: ${sectionGap}mm;
    }

    .theme-modern .clip {
      margin-bottom: 0;
      padding: 13pt 14pt;
      border: 0.75pt solid var(--rule);
      border-radius: 12pt;
      background: rgb(255, 255, 255);
      box-shadow: 0 4pt 14pt rgba(15, 23, 42, 0.04);
      position: relative;
      overflow: hidden;
    }

    .theme-modern .clip::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2.5pt;
      background: linear-gradient(90deg, rgb(2, 132, 199) 0%, rgb(6, 182, 212) 60%, rgb(14, 165, 233) 100%);
    }

    .theme-modern .chip {
      border-radius: 999pt;
      margin-bottom: 6pt;
      padding: 2pt 7pt;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      background: rgb(224, 242, 254);
      color: rgb(3, 105, 161);
    }

    .theme-modern .clip-meta {
      margin-bottom: ${lineGap}mm;
      font-size: 8.6pt;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: rgb(71, 85, 105);
    }

    .theme-modern .clip-content {
      font-size: 10.7pt;
      line-height: 1.66;
      color: rgb(30, 41, 59);
    }
  `;
}

function renderClipHtml(clip: KindleClip, theme: PdfTheme): string {
  const parts: string[] = ['<div class="clip">'];

  if (theme.render.showTypeChip && clip.type !== "Unknown") {
    parts.push(`<span class="chip">${escapeHtml(clip.type)}</span>`);
  }

  if (theme.render.showMetaLine) {
    const meta = theme.formatMeta(clip);
    if (meta) {
      parts.push(`<div class="clip-meta">${escapeHtml(meta)}</div>`);
    }
  }

  parts.push(`<div class="clip-content">${escapeHtml(clip.content || "")}</div>`);

  if (theme.render.showRuleBetweenClips) {
    parts.push('<hr class="clip-rule">');
  }

  parts.push("</div>");
  return parts.join("\n");
}

function buildHtml(group: BookGroup, theme: PdfTheme): string {
  const title = theme.formatTitle(group);
  const css = buildCss(theme);
  const clipsHtml = group.clips.map((clip) => renderClipHtml(clip, theme)).join("\n");
  const authorText = group.author
    ? theme.id === "kindle"
      ? `by ${group.author.replace(/^by\s+/i, "")}`
      : group.author
    : "";
  const authorHtml = authorText ? `<p class="author">${escapeHtml(authorText)}</p>` : "";
  const details = group as BookGroup & {
    coverUrl?: string;
    coverImageUrl?: string;
    previewUrl?: string;
    bookUrl?: string;
  };

  const rawCoverUrl = (details.coverUrl ?? details.coverImageUrl ?? "").trim();
  const coverUrl = /^https?:\/\//i.test(rawCoverUrl) ? rawCoverUrl : "";
  const previewUrl = (details.previewUrl ?? details.bookUrl ?? "").trim();
  const safePreviewUrl = /^https?:\/\//i.test(previewUrl) ? previewUrl : "";

  const highlightCount = group.clips.filter((clip) => clip.type === "Highlight").length;
  const noteCount = group.clips.filter((clip) => clip.type === "Note").length;
  const countText = `${highlightCount} Highlight${highlightCount === 1 ? "" : "s"}  |  ${noteCount} Note${noteCount === 1 ? "" : "s"}`;

  const kindleHeaderHtml = `
    <div class="book-row">
      ${coverUrl ? `<img class="book-cover" src="${escapeHtml(coverUrl)}" alt="Book cover">` : ""}
      <div class="book-meta">
        <p class="kicker">Your Kindle notes for:</p>
        <h1>${escapeHtml(title)}</h1>
        ${authorHtml}
        ${safePreviewUrl ? `<p class="book-link">Free Kindle instant preview: ${escapeHtml(safePreviewUrl)}</p>` : ""}
      </div>
    </div>
    <p class="count">${countText}</p>
    <hr class="header-rule">
  `;

  const defaultHeaderHtml = `
    <h1>${escapeHtml(title)}</h1>
    ${authorHtml}
    <p class="count">${group.clips.length} item(s)</p>
    <hr class="header-rule">
  `;

  return `<!DOCTYPE html>
<html lang="">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <style>${css}</style>
</head>
<body class="theme-${theme.id}">
  <div class="header">
    ${theme.id === "kindle" ? kindleHeaderHtml : defaultHeaderHtml}
  </div>
  <div class="clips">
    ${clipsHtml}
  </div>
  <script>
    window.addEventListener('load', function () {
      window.print();
      window.addEventListener('afterprint', function () { window.close(); });
    });
  </script>
</body>
</html>`;
}

export function exportBookGroupToPdf(group: BookGroup, theme: PdfTheme) {
  const html = buildHtml(group, theme);
  const win = window.open("", "_blank");
  if (!win) {
    // Popup was blocked — fall back to downloading as HTML (user can open and print)
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFileName(
      `${group.title}${group.author ? " - " + group.author : ""}.html`
    );
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.write(html);
  win.document.close();
}

export function exportAllGroupsToZipNotSupportedMessage() {
  // Intentionally left out: no server + avoid heavy zip deps.
}

