export interface ClipboardItem {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ClipboardDatabase {
  version: number;
  exportedAt: string;
  folders: Folder[];
  items: ClipboardItem[];
}

export const FOLDER_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#06b6d4", // cyan
];
