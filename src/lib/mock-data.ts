import { Project, Photo, PhotoTag } from "@/types";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const MOCK_PROJECTS: Project[] = [
  {
    id: "demo-001",
    address: "2847 Ridgewood Drive, Nashville, TN 37211",
    customer_name: "Marcus & Linda Torres",
    job_type: "Replacement",
    shingle_color: "Charcoal",
    status: "In Progress",
    folder_id: "mock-folder-001",
    photo_count: 8,
    notes:
      "Full tear-off and replacement. Insurance claim #INS-2024-8847. Watch for soft spots on northeast corner near chimney flashing.",
    created_at: "2024-03-18T08:30:00",
    updated_at: "2024-03-25T14:12:00",
  },
  {
    id: "demo-002",
    address: "415 Elm Creek Court, Brentwood, TN 37027",
    customer_name: "James Holloway",
    job_type: "Repair",
    shingle_color: "Weathered Wood",
    status: "Active",
    folder_id: "mock-folder-002",
    photo_count: 3,
    notes: "Wind damage from March 12 storm. 3 sections of missing shingles on south face.",
    created_at: "2024-03-22T09:00:00",
    updated_at: "2024-03-22T09:00:00",
  },
  {
    id: "demo-003",
    address: "1190 Sunset Boulevard, Franklin, TN 37064",
    customer_name: "Chen Property Group",
    job_type: "Inspection",
    shingle_color: "Estate Gray",
    status: "Complete",
    folder_id: "mock-folder-003",
    photo_count: 12,
    notes: "Annual inspection for property management. 4-unit commercial building.",
    created_at: "2024-03-10T07:45:00",
    updated_at: "2024-03-15T16:30:00",
  },
  {
    id: "demo-004",
    address: "733 Maple Ridge Road, Murfreesboro, TN 37129",
    customer_name: "Patricia & Doug Simmons",
    job_type: "Replacement",
    shingle_color: "Pewter Gray",
    status: "Active",
    folder_id: "mock-folder-004",
    photo_count: 0,
    notes: "New customer, hail damage claim pending. State Farm adjuster visit scheduled for next week.",
    created_at: "2024-03-26T10:15:00",
    updated_at: "2024-03-26T10:15:00",
  },
];

const makePhoto = (
  id: string,
  seed: number,
  name: string,
  tag: PhotoTag | undefined,
  caption: string
): Photo => ({
  id,
  name,
  thumbnailUrl: `https://picsum.photos/seed/${seed}/600/450`,
  webViewLink: `https://drive.google.com/file/d/${id}/view`,
  downloadUrl: `https://picsum.photos/seed/${seed}/600/450`,
  tag,
  caption,
  createdTime: "2024-03-18T10:00:00Z",
  mimeType: "image/jpeg",
  size: "2048000",
});

export const MOCK_PHOTOS: Record<string, Photo[]> = {
  "demo-001": [
    makePhoto("p01", 10, "before-front-left.jpg", "Before", "Front left section before tear-off"),
    makePhoto("p02", 20, "before-damage-northeast.jpg", "Damage", "Soft spot near northeast chimney flashing"),
    makePhoto("p03", 30, "before-valley-damage.jpg", "Damage", "Damaged valley flashing — needs full replacement"),
    makePhoto("p04", 40, "decking-exposed.jpg", "In Progress", "Decking exposed after tear-off — no rot visible"),
    makePhoto("p05", 50, "ice-water-installed.jpg", "In Progress", "Ice & water shield installed on all eaves"),
    makePhoto("p06", 60, "shingles-progress.jpg", "In Progress", "First course of Charcoal shingles installed"),
    makePhoto("p07", 70, "ridge-cap.jpg", "After", "Ridge cap completed"),
    makePhoto("p08", 80, "after-complete.jpg", "After", "Job complete — front elevation"),
  ],
  "demo-002": [
    makePhoto("p09", 90, "wind-damage-south.jpg", "Damage", "South face — 3 sections missing after storm"),
    makePhoto("p10", 100, "damage-closeup.jpg", "Damage", "Exposed underlayment, minor moisture"),
    makePhoto("p11", 110, "repair-complete.jpg", "After", "Repair complete, color match good"),
  ],
  "demo-003": [
    makePhoto("p12", 15, "inspection-north.jpg", "Before", "North elevation — minor granule loss"),
    makePhoto("p13", 25, "inspection-south.jpg", "Before", "South elevation — good condition"),
    makePhoto("p14", 35, "inspection-flashing.jpg", "Damage", "Chimney flashing — needs resealing"),
    makePhoto("p15", 45, "inspection-gutters.jpg", "Before", "Gutters — moderate debris accumulation"),
    makePhoto("p16", 55, "inspection-valley.jpg", "Before", "Valley — intact, no cracking"),
    makePhoto("p17", 65, "inspection-vent.jpg", "Before", "Pipe boot seals — cracking on 2 of 4 vents"),
    makePhoto("p18", 75, "flashing-resealed.jpg", "After", "Chimney flashing resealed"),
    makePhoto("p19", 85, "boots-replaced.jpg", "After", "2 pipe boot seals replaced"),
    makePhoto("p20", 95, "gutters-cleaned.jpg", "Complete", "Gutters cleaned and flushed"),
    makePhoto("p21", 105, "final-north.jpg", "Complete", "Final — north elevation"),
    makePhoto("p22", 115, "final-south.jpg", "Complete", "Final — south elevation"),
    makePhoto("p23", 125, "final-overview.jpg", "Complete", "Final overview — all work complete"),
  ],
  "demo-004": [],
};

export const MOCK_SHARE_TOKEN = "demo-share-token";
