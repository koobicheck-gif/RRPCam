import { getSheetsClient } from "./auth";
import { Project, ProjectStatus } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID!;
const SHEET_NAME = "projects";

// Column order: id | address | customer_name | job_type | shingle_color | status | folder_id | photo_count | notes | created_at | updated_at
const COLUMNS = [
  "id",
  "address",
  "customer_name",
  "job_type",
  "shingle_color",
  "status",
  "folder_id",
  "photo_count",
  "notes",
  "created_at",
  "updated_at",
];

function rowToProject(row: string[]): Project {
  return {
    id: row[0] || "",
    address: row[1] || "",
    customer_name: row[2] || "",
    job_type: (row[3] as Project["job_type"]) || "Repair",
    shingle_color: row[4] || "",
    status: (row[5] as ProjectStatus) || "Active",
    folder_id: row[6] || "",
    photo_count: parseInt(row[7] || "0", 10),
    notes: row[8] || "",
    created_at: row[9] || "",
    updated_at: row[10] || "",
  };
}

function projectToRow(project: Partial<Project> & { id: string }): string[] {
  return [
    project.id,
    project.address || "",
    project.customer_name || "",
    project.job_type || "Repair",
    project.shingle_color || "",
    project.status || "Active",
    project.folder_id || "",
    String(project.photo_count ?? 0),
    project.notes || "",
    project.created_at || "",
    project.updated_at || "",
  ];
}

async function ensureHeaderRow() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:K1`,
  });

  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:K1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [COLUMNS],
      },
    });
  }
}

export async function getAllProjects(): Promise<Project[]> {
  await ensureHeaderRow();
  const sheets = getSheetsClient();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:K`,
  });

  if (!res.data.values) return [];

  return res.data.values
    .filter((row) => row[0]) // filter rows with an id
    .map(rowToProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export async function createProject(
  data: Omit<Project, "id" | "created_at" | "updated_at" | "photo_count">
): Promise<Project> {
  await ensureHeaderRow();
  const sheets = getSheetsClient();

  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
  const project: Project = {
    ...data,
    id: uuidv4(),
    photo_count: 0,
    created_at: now,
    updated_at: now,
  };

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:K`,
    valueInputOption: "RAW",
    requestBody: {
      values: [projectToRow(project)],
    },
  });

  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, "id" | "created_at">>
): Promise<Project | null> {
  await ensureHeaderRow();
  const sheets = getSheetsClient();

  // Find the row number
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:K`,
  });

  if (!res.data.values) return null;

  const rowIndex = res.data.values.findIndex(
    (row, idx) => idx > 0 && row[0] === id
  );

  if (rowIndex === -1) return null;

  const existingProject = rowToProject(res.data.values[rowIndex]);
  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss");
  const updated: Project = {
    ...existingProject,
    ...updates,
    id,
    updated_at: now,
  };

  const range = `${SHEET_NAME}!A${rowIndex + 1}:K${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range,
    valueInputOption: "RAW",
    requestBody: {
      values: [projectToRow(updated)],
    },
  });

  return updated;
}

export async function incrementPhotoCount(
  id: string,
  delta: number = 1
): Promise<void> {
  const project = await getProjectById(id);
  if (!project) return;
  await updateProject(id, { photo_count: Math.max(0, project.photo_count + delta) });
}
