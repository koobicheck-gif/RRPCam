import { clsx, type ClassValue } from "clsx";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ProjectStatus, PhotoTag } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function formatDateRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Complete: "bg-blue-100 text-blue-800 border-blue-200",
};

export const STATUS_DOT_COLORS: Record<ProjectStatus, string> = {
  Active: "bg-green-500",
  "In Progress": "bg-yellow-500",
  Complete: "bg-blue-500",
};

export const TAG_COLORS: Record<PhotoTag, string> = {
  Before: "bg-orange-100 text-orange-800 border-orange-200",
  After: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Damage: "bg-red-100 text-red-800 border-red-200",
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Complete: "bg-blue-100 text-blue-800 border-blue-200",
};

export const JOB_TYPE_ICONS: Record<string, string> = {
  Repair: "🔨",
  Replacement: "🏗️",
  Inspection: "🔍",
};

export function generateShareToken(projectId: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `${projectId.substring(0, 8)}-${timestamp}-${random}`;
}

export function slugifyAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
