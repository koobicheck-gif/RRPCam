import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectById, incrementPhotoCount } from "@/lib/google/sheets";
import {
  getPhotosInFolder,
  uploadPhotoToFolder,
  deletePhoto,
} from "@/lib/google/drive";
import { PhotoTag } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const photos = await getPhotosInFolder(project.folder_id);
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("GET photos error:", error);
    return NextResponse.json({ error: "Failed to load photos" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const tag = formData.get("tag") as PhotoTag | null;
    const caption = formData.get("caption") as string | null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const photo = await uploadPhotoToFolder(
      project.folder_id,
      file.name,
      file.type,
      buffer,
      tag || undefined,
      caption || undefined
    );

    await incrementPhotoCount(params.id, 1);

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error("POST photo error:", error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileId } = await req.json();
    if (!fileId) return NextResponse.json({ error: "fileId required" }, { status: 400 });

    await deletePhoto(fileId);
    await incrementPhotoCount(params.id, -1);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE photo error:", error);
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 });
  }
}
