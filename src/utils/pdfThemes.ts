import type { KindleClip, BookGroup } from "../types";

export type PdfThemeId = "kindle" | "minimal" | "modern";

export type PdfTheme = {
  id: PdfThemeId;
  label: string;
  description: string;
  fonts: {
    /** CSS font-family stack for body text */
    body: string;
    /** CSS font-family stack for monospaced text */
    mono: string;
  };
  page: {
    marginPt: number;
    headerGapPt: number;
    sectionGapPt: number;
    lineGapPt: number;
  };
  colors: {
    text: [number, number, number];
    muted: [number, number, number];
    rule: [number, number, number];
    accent: [number, number, number];
    chipBg: [number, number, number];
  };
  render: {
    showMetaLine: boolean;
    showTypeChip: boolean;
    showRuleBetweenClips: boolean;
  };
  formatMeta: (clip: KindleClip) => string;
  formatTitle: (group: BookGroup) => string;
};

export const themes: PdfTheme[] = [
  {
    id: "kindle",
    label: "Kindle-style",
    description: "Warm, reader-first layout inspired by Kindle notebook exports.",
    fonts: {
      body: '"Book Antiqua", Georgia, "Times New Roman", serif',
      mono: '"Courier New", Courier, monospace',
    },
    page: { marginPt: 44, headerGapPt: 14, sectionGapPt: 14, lineGapPt: 4 },
    colors: {
      text: [42, 34, 26],
      muted: [118, 102, 82],
      rule: [224, 214, 199],
      accent: [188, 120, 44],
      chipBg: [248, 240, 225],
    },
    render: { showMetaLine: true, showTypeChip: false, showRuleBetweenClips: false },
    formatMeta: (clip) => {
      const bits: string[] = [];
      if (clip.type !== "Unknown") {
        bits.push(clip.type === "Highlight" ? "Highlight (Yellow)" : clip.type);
      }
      if (clip.locationRaw) bits.push(`Location ${clip.locationRaw}`);
      if (clip.pageRaw) bits.push(`Page ${clip.pageRaw}`);
      return bits.join(" | ");
    },
    formatTitle: (g) => g.title,
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean editorial layout with soft structure and restrained accents.",
    fonts: {
      body: '"Aptos", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
      mono: '"Courier New", Courier, monospace',
    },
    page: { marginPt: 52, headerGapPt: 20, sectionGapPt: 16, lineGapPt: 6 },
    colors: {
      text: [17, 24, 39],
      muted: [107, 114, 128],
      rule: [221, 228, 236],
      accent: [14, 116, 144],
      chipBg: [236, 253, 245],
    },
    render: { showMetaLine: true, showTypeChip: true, showRuleBetweenClips: false },
    formatMeta: (clip) => {
      const bits: string[] = [];
      if (clip.locationRaw) bits.push(`Loc. ${clip.locationRaw}`);
      if (clip.pageRaw) bits.push(`p. ${clip.pageRaw}`);
      if (clip.addedOnRaw) bits.push(clip.addedOnRaw);
      return bits.join(" · ");
    },
    formatTitle: (g) => g.title,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Contemporary report-like layout with strong hierarchy and crisp cards.",
    fonts: {
      body: '"Aptos", "Segoe UI Variable", "Segoe UI", system-ui, -apple-system, sans-serif',
      mono: '"Cascadia Mono", "Consolas", "Courier New", monospace',
    },
    page: { marginPt: 50, headerGapPt: 16, sectionGapPt: 14, lineGapPt: 5 },
    colors: {
      text: [17, 24, 39],
      muted: [71, 85, 105],
      rule: [203, 213, 225],
      accent: [2, 132, 199],
      chipBg: [224, 242, 254],
    },
    render: { showMetaLine: true, showTypeChip: true, showRuleBetweenClips: false },
    formatMeta: (clip) => {
      const bits: string[] = [];
      if (clip.locationRaw) bits.push(`Location ${clip.locationRaw}`);
      if (clip.pageRaw) bits.push(`Page ${clip.pageRaw}`);
      if (clip.addedOnRaw) bits.push(clip.addedOnRaw);
      return bits.join(" | ");
    },
    formatTitle: (g) => g.title,
  },
];

export function getTheme(id: PdfThemeId) {
  return themes.find((t) => t.id === id) ?? themes[0];
}
