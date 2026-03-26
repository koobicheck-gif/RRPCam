"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Photo, PhotoTag } from "@/types";
import { PhotoAnnotator } from "./PhotoAnnotator";
import { PhotoTagBadge } from "@/components/ui/PhotoTagBadge";
import { cn } from "@/lib/utils";

const PHOTO_TAGS: PhotoTag[] = [
  "Before",
  "After",
  "Damage",
  "In Progress",
  "Complete",
];

interface FileEntry {
  id: string;
  file: File;
  preview: string;
  tag: PhotoTag | "";
  caption: string;
  annotated?: Blob;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

interface UploadPanelProps {
  projectId: string;
  folderId: string;
  onUploaded: (photos: Photo[]) => void;
  onClose: () => void;
}

export function UploadPanel({
  projectId,
  onUploaded,
  onClose,
}: UploadPanelProps) {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [annotating, setAnnotating] = useState<FileEntry | null>(null);
  const [uploading, setUploading] = useState(false);
  const idRef = useRef(0);

  const onDrop = useCallback((accepted: File[]) => {
    const entries: FileEntry[] = accepted.map((file) => ({
      id: String(++idRef.current),
      file,
      preview: URL.createObjectURL(file),
      tag: "",
      caption: "",
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...entries]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
    maxSize: 30 * 1024 * 1024, // 30MB
  });

  const updateFile = (id: string, updates: Partial<FileEntry>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnnotationSave = (id: string, blob: Blob) => {
    updateFile(id, { annotated: blob });
    setAnnotating(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const uploaded: Photo[] = [];

    for (const entry of files) {
      if (entry.status === "done") continue;

      updateFile(entry.id, { status: "uploading", progress: 10 });

      try {
        const formData = new FormData();
        const fileToUpload = entry.annotated
          ? new File([entry.annotated], entry.file.name, {
              type: entry.file.type || "image/jpeg",
            })
          : entry.file;

        formData.append("file", fileToUpload);
        if (entry.tag) formData.append("tag", entry.tag);
        if (entry.caption) formData.append("caption", entry.caption);

        const res = await fetch(`/api/projects/${projectId}/photos`, {
          method: "POST",
          body: formData,
        });

        updateFile(entry.id, { progress: 80 });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        updateFile(entry.id, { status: "done", progress: 100 });
        uploaded.push(data.photo);
      } catch (err) {
        updateFile(entry.id, {
          status: "error",
          progress: 0,
          error: err instanceof Error ? err.message : "Upload failed",
        });
      }
    }

    setUploading(false);
    if (uploaded.length > 0) {
      onUploaded(uploaded);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const allDone = files.length > 0 && doneCount === files.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Upload Photos</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Tag and annotate before uploading to Drive
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Drop zone */}
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
              isDragActive
                ? "border-navy-500 bg-navy-50"
                : "border-gray-200 hover:border-navy-300 hover:bg-gray-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            {isDragActive ? (
              <p className="text-navy-600 font-semibold text-sm">Drop files here</p>
            ) : (
              <>
                <p className="text-gray-700 font-semibold text-sm">
                  Tap to select or drag & drop
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  JPG, PNG, HEIC · up to 30MB each
                </p>
              </>
            )}
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-3">
              {files.map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                >
                  {/* Thumb */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.annotated ? URL.createObjectURL(entry.annotated) : entry.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {entry.annotated && (
                      <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-navy-600 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {entry.file.name}
                    </p>

                    {/* Tag + caption */}
                    {entry.status === "pending" && (
                      <div className="flex gap-2 flex-wrap">
                        <select
                          value={entry.tag}
                          onChange={(e) =>
                            updateFile(entry.id, { tag: e.target.value as PhotoTag })
                          }
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-navy-400"
                        >
                          <option value="">No tag</option>
                          {PHOTO_TAGS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Caption..."
                          value={entry.caption}
                          onChange={(e) =>
                            updateFile(entry.id, { caption: e.target.value })
                          }
                          className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-navy-400"
                        />
                      </div>
                    )}

                    {/* Progress bar */}
                    {entry.status === "uploading" && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-navy-600 h-1.5 rounded-full progress-bar"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                    )}

                    {entry.status === "done" && (
                      <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Uploaded
                      </p>
                    )}

                    {entry.status === "error" && (
                      <p className="text-xs text-red-600">{entry.error}</p>
                    )}
                  </div>

                  {/* Actions */}
                  {entry.status === "pending" && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => setAnnotating(entry)}
                        title="Annotate"
                        className="w-7 h-7 rounded-lg bg-navy-50 hover:bg-navy-100 flex items-center justify-center text-navy-600 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFile(entry.id)}
                        title="Remove"
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            {files.length === 0
              ? "No files selected"
              : allDone
              ? `${doneCount} photo${doneCount !== 1 ? "s" : ""} uploaded`
              : `${pendingCount} of ${files.length} ready`}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary py-2 text-sm">
              {allDone ? "Done" : "Cancel"}
            </button>
            {!allDone && pendingCount > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading || pendingCount === 0}
                className="btn-primary py-2 text-sm"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload {pendingCount} Photo{pendingCount !== 1 ? "s" : ""}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Annotator modal */}
      {annotating && (
        <PhotoAnnotator
          imageUrl={annotating.preview}
          fileName={annotating.file.name}
          onSave={(blob) => handleAnnotationSave(annotating.id, blob)}
          onClose={() => setAnnotating(null)}
        />
      )}
    </div>
  );
}
