"use client";

import { useState } from "react";
import Image from "next/image";
import { Project, Photo, PhotoTag } from "@/types";
import { RRPLogo } from "@/components/brand/RRPLogo";
import { PhotoTagBadge } from "@/components/ui/PhotoTagBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, JOB_TYPE_ICONS } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TAG_FILTERS: Array<PhotoTag | "All"> = [
  "All",
  "Before",
  "After",
  "Damage",
  "In Progress",
  "Complete",
];

interface PublicGalleryProps {
  project: Project;
  photos: Photo[];
}

export function PublicGallery({ project, photos }: PublicGalleryProps) {
  const [tagFilter, setTagFilter] = useState<PhotoTag | "All">("All");
  const [lightbox, setLightbox] = useState<Photo | null>(null);

  const filtered =
    tagFilter === "All" ? photos : photos.filter((p) => p.tag === tagFilter);

  const addressParts = project.address.split(",");
  const street = addressParts[0];
  const city = addressParts.slice(1).join(",").trim();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-navy-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <RRPLogo size="sm" />
            <div className="text-right">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wide">
                Project Documentation
              </p>
              <p className="text-white/40 text-xs">
                {formatDate(new Date().toISOString())}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-brand-red/90">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{JOB_TYPE_ICONS[project.job_type]}</span>
                  <span className="text-red-200 text-xs font-semibold uppercase tracking-wide">
                    {project.job_type}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white leading-tight">{street}</h1>
                {city && <p className="text-red-200 text-sm mt-0.5">{city}</p>}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2">
                <StatusBadge status={project.status} />
                <p className="text-red-200 text-xs">
                  {photos.length} photo{photos.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Project info bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wide block">Customer</span>
              <span className="font-medium">{project.customer_name}</span>
            </div>
            {project.shingle_color && (
              <div>
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide block">Shingles</span>
                <span className="font-medium">{project.shingle_color}</span>
              </div>
            )}
            <div>
              <span className="text-gray-400 text-xs font-medium uppercase tracking-wide block">Date</span>
              <span className="font-medium">{formatDate(project.created_at)}</span>
            </div>
          </div>
          {project.notes && (
            <p className="mt-3 text-sm text-gray-500 border-t border-gray-100 pt-3">
              {project.notes}
            </p>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No photos have been uploaded yet.</p>
          </div>
        ) : (
          <>
            {/* Tag filter */}
            <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 hide-scrollbar">
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
                      "shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border",
                      tagFilter === tag
                        ? "bg-navy-700 text-white border-navy-700"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {tag}
                    <span className="ml-1.5 opacity-60 text-xs">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Photo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filtered.map((photo) => (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                  onClick={() => setLightbox(photo)}
                >
                  {photo.thumbnailUrl ? (
                    <Image
                      src={photo.thumbnailUrl}
                      alt={photo.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {photo.tag && (
                    <div className="absolute top-2 left-2">
                      <PhotoTagBadge tag={photo.tag} />
                    </div>
                  )}
                  {photo.caption && (
                    <div className="absolute bottom-0 inset-x-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium line-clamp-2">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-6">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <RRPLogo size="sm" dark />
          <p className="text-xs text-gray-400 text-center">
            This is a read-only project gallery shared by Roof Repair Partners.
            <br />
            © {new Date().getFullYear()} Roof Repair Partners. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-2 right-2 z-10 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-[80vh]">
              {lightbox.thumbnailUrl && (
                <Image
                  src={lightbox.thumbnailUrl.replace("=s400", "=s1200")}
                  alt={lightbox.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              )}
            </div>
            {(lightbox.tag || lightbox.caption) && (
              <div className="p-4 bg-gray-900 rounded-b-xl">
                {lightbox.tag && (
                  <div className="mb-1">
                    <PhotoTagBadge tag={lightbox.tag} size="md" />
                  </div>
                )}
                {lightbox.caption && (
                  <p className="text-white text-sm">{lightbox.caption}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
