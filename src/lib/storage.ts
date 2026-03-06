import { ClipboardDatabase, ClipboardItem, Folder } from "./types";

const DB_KEY = "clipboard_manager_db";
const DB_VERSION = 1;

export function loadDatabase(): ClipboardDatabase {
  if (typeof window === "undefined") {
    return createEmptyDatabase();
  }
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return createEmptyDatabase();
    const parsed = JSON.parse(raw) as ClipboardDatabase;
    return parsed;
  } catch {
    return createEmptyDatabase();
  }
}

export function saveDatabase(db: ClipboardDatabase): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function createEmptyDatabase(): ClipboardDatabase {
  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    folders: [],
    items: [],
  };
}

export function exportDatabase(db: ClipboardDatabase): void {
  const exportData: ClipboardDatabase = {
    ...db,
    exportedAt: new Date().toISOString(),
  };
  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `clipboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importDatabase(file: File): Promise<ClipboardDatabase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as ClipboardDatabase;
        if (!parsed.folders || !parsed.items) {
          reject(new Error("Invalid database format"));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error("Failed to parse database file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createFolder(name: string, color: string): Folder {
  return {
    id: generateId(),
    name,
    color,
    createdAt: new Date().toISOString(),
  };
}

export function createClipboardItem(
  title: string,
  content: string,
  folderId: string | null
): ClipboardItem {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title,
    content,
    folderId,
    createdAt: now,
    updatedAt: now,
    tags: [],
  };
}
