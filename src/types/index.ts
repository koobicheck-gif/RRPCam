export type ProjectStatus = "Active" | "In Progress" | "Complete";
export type JobType = "Repair" | "Replacement" | "Inspection";
export type PhotoTag =
  | "Before"
  | "After"
  | "Damage"
  | "In Progress"
  | "Complete";

export interface Project {
  id: string;
  address: string;
  customer_name: string;
  job_type: JobType;
  shingle_color: string;
  status: ProjectStatus;
  folder_id: string;
  photo_count: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  name: string;
  thumbnailUrl: string;
  webViewLink: string;
  downloadUrl: string;
  tag?: PhotoTag;
  caption?: string;
  createdTime?: string;
  mimeType?: string;
  size?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  requires_photo: boolean;
  photo_id?: string;
}

export interface ProjectComment {
  id: string;
  text: string;
  author: string;
  author_avatar?: string;
  created_at: string;
}

export interface ReportPhoto {
  photo: Photo;
  caption: string;
  order: number;
}

export interface ShareToken {
  token: string;
  project_id: string;
  folder_id: string;
  address: string;
  expires_at?: string;
}
