"use client";

import { useState, useEffect } from "react";
import { ChecklistItem, Photo } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";

const STORAGE_KEY = (id: string) => `rrp_checklist_${id}`;

const DEFAULT_ITEMS: Omit<ChecklistItem, "id">[] = [
  { text: "Inspect roof decking", completed: false, requires_photo: false },
  { text: "Document all damage areas", completed: false, requires_photo: true },
  { text: "Measure affected areas", completed: false, requires_photo: false },
  { text: "Before photos taken", completed: false, requires_photo: true },
  { text: "Remove old shingles/materials", completed: false, requires_photo: false },
  { text: "Install ice & water shield", completed: false, requires_photo: false },
  { text: "Install underlayment", completed: false, requires_photo: false },
  { text: "Install shingles", completed: false, requires_photo: false },
  { text: "Flash valleys and penetrations", completed: false, requires_photo: false },
  { text: "Install ridge cap", completed: false, requires_photo: false },
  { text: "Final inspection completed", completed: false, requires_photo: true },
  { text: "After photos taken", completed: false, requires_photo: true },
  { text: "Site cleaned up", completed: false, requires_photo: false },
  { text: "Customer walkthrough done", completed: false, requires_photo: false },
];

interface ChecklistPanelProps {
  projectId: string;
  photos: Photo[];
}

export function ChecklistPanel({ projectId, photos }: ChecklistPanelProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newText, setNewText] = useState("");
  const [requiresPhoto, setRequiresPhoto] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(projectId));
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const defaults = DEFAULT_ITEMS.map((item) => ({
        ...item,
        id: uuidv4(),
      }));
      setItems(defaults);
    }
  }, [projectId]);

  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY(projectId), JSON.stringify(items));
    }
  }, [items, projectId]);

  const toggle = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newText.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: uuidv4(),
        text: newText.trim(),
        completed: false,
        requires_photo: requiresPhoto,
      },
    ]);
    setNewText("");
    setRequiresPhoto(false);
    setAdding(false);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Progress</span>
          <span className="text-sm font-bold text-navy-700">
            {completedCount}/{items.length} complete
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-navy-600 to-brand-red rounded-full progress-bar"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          {Math.round(progress)}% of checklist completed
        </p>
      </div>

      {/* Checklist */}
      <div className="card divide-y divide-gray-50">
        {items.map((item) => {
          const blocked = item.requires_photo && !item.completed && photos.length === 0;
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 group transition-colors",
                item.completed ? "bg-green-50/30" : "hover:bg-gray-50"
              )}
            >
              <button
                onClick={() => toggle(item.id)}
                disabled={blocked}
                className={cn(
                  "shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  item.completed
                    ? "bg-green-500 border-green-500"
                    : blocked
                    ? "border-gray-200 opacity-40 cursor-not-allowed"
                    : "border-gray-300 hover:border-navy-400"
                )}
              >
                {item.completed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    item.completed ? "line-through text-gray-400" : "text-gray-800"
                  )}
                >
                  {item.text}
                </p>
                {item.requires_photo && (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Requires photo
                  </span>
                )}
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 shrink-0 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add item */}
        {adding ? (
          <div className="px-4 py-3 flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder="Task description..."
              className="input-field text-sm"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresPhoto}
                  onChange={(e) => setRequiresPhoto(e.target.checked)}
                  className="rounded accent-navy-600"
                />
                Requires photo
              </label>
              <div className="flex gap-2">
                <button onClick={() => setAdding(false)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
                  Cancel
                </button>
                <button onClick={addItem} className="btn-primary py-1.5 text-xs">
                  Add Task
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full px-4 py-3 flex items-center gap-2 text-sm text-gray-400 hover:text-navy-600 hover:bg-navy-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add task
          </button>
        )}
      </div>
    </div>
  );
}
