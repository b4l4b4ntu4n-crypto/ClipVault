"use client";

import { Folder } from "@/lib/types";
import { useRef } from "react";

interface Props {
  folders: Folder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string) => void;
  onAddFolder: () => void;
  onDeleteFolder: (folder: Folder) => void;
  itemCountByFolder: Record<string, number>;
  uncategorizedCount: number;
  totalCount: number;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onAddFolder,
  onDeleteFolder,
  itemCountByFolder,
  uncategorizedCount,
  totalCount,
  onExport,
  onImport,
}: Props) {
  const importRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">ClipVault</h1>
            <p className="text-xs text-gray-500">Clipboard Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* All */}
        <button
          onClick={() => onSelectFolder("all")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === "all"
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span>All Clips</span>
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedFolderId === "all" ? "bg-indigo-500" : "bg-gray-700 text-gray-400"}`}>
            {totalCount}
          </span>
        </button>

        {/* Uncategorized */}
        <button
          onClick={() => onSelectFolder("uncategorized")}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            selectedFolderId === "uncategorized"
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span>Uncategorized</span>
          </div>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedFolderId === "uncategorized" ? "bg-indigo-500" : "bg-gray-700 text-gray-400"}`}>
            {uncategorizedCount}
          </span>
        </button>

        {/* Divider */}
        {folders.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Folders
            </p>
          </div>
        )}

        {/* Folders */}
        {folders.map((folder) => (
          <div key={folder.id} className="group relative">
            <button
              onClick={() => onSelectFolder(folder.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedFolderId === folder.id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="truncate">{folder.name}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${selectedFolderId === folder.id ? "bg-gray-700" : "bg-gray-700 text-gray-400"}`}>
                {itemCountByFolder[folder.id] ?? 0}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(folder);
              }}
              className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-400 transition-all"
              title="Delete folder"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Folder */}
        <button
          onClick={onAddFolder}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-400 hover:bg-gray-800 transition-colors border border-dashed border-gray-800 hover:border-gray-700 mt-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Folder</span>
        </button>
      </nav>

      {/* Import / Export */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Database
        </button>
        <button
          onClick={() => importRef.current?.click()}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l4-4m0 0l4 4m-4-4v12" />
          </svg>
          Import Database
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json"
          onChange={onImport}
          className="hidden"
        />
      </div>
    </aside>
  );
}
