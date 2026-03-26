"use client";

import { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

interface ProjectFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: ProjectStatus | "All";
  onStatusChange: (v: ProjectStatus | "All") => void;
  count: number;
}

const STATUSES: Array<ProjectStatus | "All"> = [
  "All",
  "Active",
  "In Progress",
  "Complete",
];

export function ProjectFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  count,
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <SearchIcon className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="search"
          placeholder="Search by address or customer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="input-field pl-9 pr-4"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <XIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status tabs */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5 shrink-0">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 whitespace-nowrap",
              status === s
                ? "bg-white text-navy-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {s}
            {s === "All" && (
              <span className="ml-1.5 text-gray-400 font-normal">{count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
