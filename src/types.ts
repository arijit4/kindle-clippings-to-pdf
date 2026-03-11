export type KindleClipType = "Highlight" | "Note" | "Bookmark" | "Unknown";

export type KindleClip = {
  id: string;
  bookTitle: string;
  bookAuthor?: string;
  type: KindleClipType;
  locationRaw?: string;
  pageRaw?: string;
  addedOnRaw?: string;
  content: string;
  rawHeader: string;
};

export type BookGroup = {
  bookKey: string;
  title: string;
  author?: string;
  clips: KindleClip[];
};

export type ParseResult = {
  totalClips: number;
  groups: BookGroup[];
  warnings: string[];
};
