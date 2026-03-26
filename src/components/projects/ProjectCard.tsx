"use client";

import Link from "next/link";
import { Project } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateRelative, JOB_TYPE_ICONS } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const addressParts = project.address.split(",");
  const streetLine = addressParts[0];
  const cityLine = addressParts.slice(1).join(",").trim();

  return (
    <Link
      href={`/project/${project.id}`}
      className="card group hover:shadow-md hover:border-navy-200 transition-all duration-200 flex flex-col"
    >
      {/* Top color bar */}
      <div className="h-1 bg-gradient-to-r from-navy-700 to-brand-red" />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-lg">{JOB_TYPE_ICONS[project.job_type]}</span>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {project.job_type}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
              {streetLine}
            </h3>
            {cityLine && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cityLine}</p>
            )}
          </div>
          <StatusBadge status={project.status} size="sm" />
        </div>

        {/* Customer */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-xs font-bold shrink-0">
            {project.customer_name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-sm text-gray-600 truncate">{project.customer_name}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <CameraIcon className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500">
              {project.photo_count}{" "}
              {project.photo_count === 1 ? "photo" : "photos"}
            </span>
          </div>
          {project.shingle_color && (
            <div className="flex items-center gap-1.5">
              <SwatchIcon className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 truncate max-w-[80px]">
                {project.shingle_color}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {formatDateRelative(project.updated_at)}
          </span>
          <span className="text-xs font-medium text-navy-700 group-hover:text-brand-red transition-colors flex items-center gap-1">
            View
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SwatchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
