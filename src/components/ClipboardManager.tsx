"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ClipboardDatabase, ClipboardItem, Folder, FOLDER_COLORS } from "@/lib/types";
import {
  loadDatabase,
  saveDatabase,
  importDatabase,
  createFolder,
  createClipboardItem,
} from "@/lib/storage";
import FolderSidebar from "./FolderSidebar";
import ItemGrid from "./ItemGrid";
import AddItemModal from "./AddItemModal";
import AddFolderModal from "./AddFolderModal";
import EditItemModal from "./EditItemModal";
import ConfirmModal from "./ConfirmModal";
import ExportModal from "./ExportModal";

export default function ClipboardManager() {
  const [db, setDb] = useState<ClipboardDatabase>(() => loadDatabase());
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editingItem, setEditingItem] = useState<ClipboardItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<ClipboardItem | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const saveRef = useRef(false);

  // Skip saving on the very first render (initial load)
  useEffect(() => {
    if (!saveRef.current) {
      saveRef.current = true;
      return;
    }
    saveDatabase(db);
  }, [db]);

  const handleAddFolder = useCallback((name: string, color: string) => {
    const folder = createFolder(name, color);
    setDb((prev) => ({ ...prev, folders: [...prev.folders, folder] }));
    setShowAddFolder(false);
  }, []);

  const handleDeleteFolder = useCallback((folder: Folder) => {
    setDb((prev) => ({
      ...prev,
      folders: prev.folders.filter((f) => f.id !== folder.id),
      items: prev.items.map((item) =>
        item.folderId === folder.id ? { ...item, folderId: null } : item
      ),
    }));
    if (selectedFolderId === folder.id) setSelectedFolderId("all");
    setDeletingFolder(null);
  }, [selectedFolderId]);

  const handleAddItem = useCallback(
    (title: string, content: string) => {
      const folderId =
        selectedFolderId === "all" || selectedFolderId === "uncategorized"
          ? null
          : selectedFolderId;
      const item = createClipboardItem(title, content, folderId);
      setDb((prev) => ({ ...prev, items: [item, ...prev.items] }));
      setShowAddItem(false);
    },
    [selectedFolderId]
  );

  const handleEditItem = useCallback((item: ClipboardItem) => {
    setEditingItem(item);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string, title: string, content: string, folderId: string | null) => {
      setDb((prev) => ({
        ...prev,
        items: prev.items.map((item) =>
          item.id === id
            ? { ...item, title, content, folderId, updatedAt: new Date().toISOString() }
            : item
        ),
      }));
      setEditingItem(null);
    },
    []
  );

  const handleDeleteItem = useCallback((item: ClipboardItem) => {
    setDeletingItem(item);
  }, []);

  const confirmDeleteItem = useCallback(() => {
    if (!deletingItem) return;
    setDb((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== deletingItem.id),
    }));
    setDeletingItem(null);
  }, [deletingItem]);

  const handleCopy = useCallback(async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 1500);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopyFeedback(id);
      setTimeout(() => setCopyFeedback(null), 1500);
    }
  }, []);

  const handleExport = useCallback(() => {
    setShowExport(true);
  }, []);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const imported = await importDatabase(file);
        setDb(imported);
        setImportError(null);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Import failed");
      }
      e.target.value = "";
    },
    []
  );

  const filteredItems = db.items.filter((item) => {
    const matchesFolder =
      selectedFolderId === "all"
        ? true
        : selectedFolderId === "uncategorized"
        ? item.folderId === null
        : item.folderId === selectedFolderId;

    const matchesSearch =
      searchQuery === ""
        ? true
        : item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFolder && matchesSearch;
  });

  const itemCountByFolder = db.folders.reduce<Record<string, number>>((acc, folder) => {
    acc[folder.id] = db.items.filter((i) => i.folderId === folder.id).length;
    return acc;
  }, {});
  const uncategorizedCount = db.items.filter((i) => i.folderId === null).length;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <FolderSidebar
        folders={db.folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onAddFolder={() => setShowAddFolder(true)}
        onDeleteFolder={(f) => setDeletingFolder(f)}
        itemCountByFolder={itemCountByFolder}
        uncategorizedCount={uncategorizedCount}
        totalCount={db.items.length}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Clip
          </button>
        </header>

        {/* Items */}
        <main className="flex-1 overflow-y-auto p-6">
          {importError && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm flex items-center justify-between">
              <span>⚠️ {importError}</span>
              <button onClick={() => setImportError(null)} className="text-red-400 hover:text-red-200">✕</button>
            </div>
          )}
          <ItemGrid
            items={filteredItems}
            folders={db.folders}
            onCopy={handleCopy}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            copyFeedback={copyFeedback}
            searchQuery={searchQuery}
          />
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-800 bg-gray-900 text-center text-xs text-gray-500">
          Created by{" "}
          <a
            href="https://facebook.com/zegergrafity"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
          >
            Zeger Grafity
          </a>{" "}
          2026
        </footer>
      </div>

      {/* Modals */}
      {showAddItem && (
        <AddItemModal
          folders={db.folders}
          defaultFolderId={
            selectedFolderId === "all" || selectedFolderId === "uncategorized"
              ? null
              : selectedFolderId
          }
          onAdd={handleAddItem}
          onClose={() => setShowAddItem(false)}
        />
      )}
      {showAddFolder && (
        <AddFolderModal
          onAdd={handleAddFolder}
          onClose={() => setShowAddFolder(false)}
          existingColors={FOLDER_COLORS}
        />
      )}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          folders={db.folders}
          onSave={handleSaveEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
      {deletingItem && (
        <ConfirmModal
          title="Delete Clip"
          message={`Are you sure you want to delete "${deletingItem.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={confirmDeleteItem}
          onCancel={() => setDeletingItem(null)}
          danger
        />
      )}
      {deletingFolder && (
        <ConfirmModal
          title="Delete Folder"
          message={`Delete folder "${deletingFolder.name}"? All clips inside will be moved to Uncategorized.`}
          confirmLabel="Delete"
          onConfirm={() => handleDeleteFolder(deletingFolder)}
          onCancel={() => setDeletingFolder(null)}
          danger
        />
      )}
      {showExport && (
        <ExportModal
          jsonContent={JSON.stringify({ ...db, exportedAt: new Date().toISOString() }, null, 2)}
          filename={`clipboard-backup-${new Date().toISOString().slice(0, 10)}.json`}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
