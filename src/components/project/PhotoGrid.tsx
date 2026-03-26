"use client";

import { useState } from "react";
import Image from "next/image";
import { Photo, PhotoTag } from "@/types";
import { PhotoTagBadge } from "@/components/ui/PhotoTagBadge";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

const TAG_FILTERS: Array<PhotoTag | "All"> = [
  "All",
  "Before",
  "After",
  "Damage",
  "In Progress",
  "Complete",
];

interface PhotoGridProps {
  photos: Photo[];
  projectId: string;
  onDeleted: (photoId: string) => void;
  onUploadClick: () => void;
}

export function PhotoGrid({
  photos,
  projectId,
  onDeleted,
  onUploadClick,
}: PhotoGridProps) {
  const [tagFilter, setTagFilter] = useState<PhotoTag | "All">("All");
  const [lightbox, setLightbox] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered =
    tagFilter === "All" ? photos : photos.filter((p) => p.tag === tagFilter);

  const handleDelete = async (photo: Photo) => {
    if (!confirm(`Delete "${photo.name}"? This cannot be undone.`)) return;
    setDeleting(photo.id);
    try {
      await fetch(`/api/projects/${projectId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: photo.id }),
      });
      onDeleted(photo.id);
    } finally {
      setDeleting(null);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-20 h-20 bg-navy-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">No photos yet</h3>
        <p className="text-sm text-gray-400 mb-6 max-w-xs">
          Upload before/after photos, damage documentation, and progress shots for this job.
        </p>
        <button onClick={onUploadClick} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Photos
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tag filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 hide-scrollbar">
        {TAG_FILTERS.map((tag) => {
          const count =
            tag === "All"
              ? photos.length
              : photos.filter((p) => p.tag === tag).length;
          if (tag !== "All" && count === 0) return null;
          return (
            <button
              key={tag}
              onClick={() => setTagFilter(tag)}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                tagFilter === tag
                  ? "bg-navy-700 text-white border-navy-700"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
            >
              {tag}
              <span className="ml-1.5 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {/* Upload tile */}
        <button
          onClick={onUploadClick}
          className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-navy-400 hover:bg-navy-50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-navy-600 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-navy-100 flex items-center justify-center transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-semibold">Add Photos</span>
        </button>

        {filtered.map((photo) => (
          <div
            key={photo.id}
            className="photo-item relative group aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() => setLightbox(photo)}
          >
            {photo.thumbnailUrl ? (
              <Image
                src={photo.thumbnailUrl}
                alt={photo.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Tag */}
            {photo.tag && (
              <div className="absolute top-1.5 left-1.5">
                <PhotoTagBadge tag={photo.tag} />
              </div>
            )}

            {/* Delete */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo);
              }}
              disabled={deleting === photo.id}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/50 hover:bg-red-600 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              {deleting === photo.id ? (
                <Spinner size="sm" color="white" />
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>

            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium line-clamp-2">{photo.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox
          photo={lightbox}
          photos={filtered}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      )}
    </div>
  );
}

function Lightbox({
  photo,
  photos,
  onClose,
  onNavigate,
}: {
  photo: Photo;
  photos: Photo[];
  onClose: () => void;
  onNavigate: (p: Photo) => void;
}) {
  const idx = photos.findIndex((p) => p.id === photo.id);

  const prev = idx > 0 ? () => onNavigate(photos[idx - 1]) : undefined;
  const next = idx < photos.length - 1 ? () => onNavigate(photos[idx + 1]) : undefined;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Prev */}
        {prev && (
          <button
            onClick={prev}
            className="absolute left-2 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Image */}
        <div className="relative w-full h-[75vh]">
          {photo.thumbnailUrl && (
            <Image
              src={photo.thumbnailUrl.replace("=s400", "=s1200")}
              alt={photo.name}
              fill
              className="object-contain"
              sizes="100vw"
            />
          )}
        </div>

        {/* Next */}
        {next && (
          <button
            onClick={next}
            className="absolute right-2 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Info */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 rounded-b-xl">
          <div className="flex items-end justify-between">
            <div>
              {photo.tag && (
                <div className="mb-1">
                  <PhotoTagBadge tag={photo.tag} size="md" />
                </div>
              )}
              {photo.caption && (
                <p className="text-white text-sm">{photo.caption}</p>
              )}
              <p className="text-white/50 text-xs mt-0.5">{photo.name}</p>
            </div>
            <a
              href={photo.webViewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              Open in Drive
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <p className="text-white/40 text-xs mt-1">
            {idx + 1} / {photos.length}
          </p>
        </div>
      </div>
    </div>
  );
}
