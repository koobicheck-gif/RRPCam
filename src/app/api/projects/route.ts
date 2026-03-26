import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createProject, getAllProjects } from "@/lib/google/sheets";
import { createProjectFolder } from "@/lib/google/drive";
import { format } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to load projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { address, job_type, shingle_color, customer_name, notes, status } = body;

    if (!address || !job_type || !customer_name) {
      return NextResponse.json(
        { error: "address, job_type, and customer_name are required" },
        { status: 400 }
      );
    }

    // Create Drive folder
    const folderName = `${address} - ${format(new Date(), "MM-dd-yyyy")}`;
    const folder_id = await createProjectFolder(folderName);

    // Save to Sheets
    const project = await createProject({
      address,
      job_type,
      shingle_color: shingle_color || "",
      customer_name,
      notes: notes || "",
      status: status || "Active",
      folder_id,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
