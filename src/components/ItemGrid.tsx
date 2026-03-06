"use client";

import { ClipboardItem, Folder } from "@/lib/types";

interface Props {
  items: ClipboardItem[];
  folders: Folder[];
  onCopy: (content: string, id: string) => void;
  onEdit: (item: ClipboardItem) => void;
  onDelete: (item: ClipboardItem) => void;
  copyFeedback: string | null;
  searchQuery: string;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function ItemGrid({
  items,
  folders,
  onCopy,
  onEdit,
  onDelete,
  copyFeedback,
  searchQuery,
}: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-600">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-lg font-medium">No clips found</p>
        <p className="text-sm mt-1">
          {searchQuery ? "Try a different search term" : "Click \"Add Clip\" to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const folder = folders.find((f) => f.id === item.folderId);
        const isCopied = copyFeedback === item.id;

        return (
          <div
            key={item.id}
            className="group relative bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-black/20 flex flex-col"
          >
            {/* Folder badge */}
            {folder && (
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="text-xs text-gray-500 truncate">{folder.name}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-sm font-semibold text-gray-200 mb-2 line-clamp-1">
              {highlightText(item.title, searchQuery)}
            </h3>

            {/* Content preview */}
            <div className="flex-1 mb-3">
              <p className="text-xs text-gray-500 font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap break-all">
                {highlightText(item.content, searchQuery)}
              </p>
            </div>

            {/* Date */}
            <p className="text-xs text-gray-700 mb-3">
              {new Date(item.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onCopy(item.content, item.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCopied
                    ? "bg-green-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {isCopied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300 transition-colors"
                title="Edit"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:bg-red-900 hover:text-red-400 transition-colors"
                title="Delete"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
