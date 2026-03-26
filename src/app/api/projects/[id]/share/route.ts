import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProjectById } from "@/lib/google/sheets";
import { getShareableLink } from "@/lib/google/drive";
import { generateShareToken } from "@/lib/utils";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await getProjectById(params.id);
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await getShareableLink(project.folder_id);

    const token = generateShareToken(params.id);
    const shareUrl = `${process.env.NEXTAUTH_URL}/share/${token}?pid=${params.id}&fid=${project.folder_id}`;

    return NextResponse.json({
      shareUrl,
      driveUrl: `https://drive.google.com/drive/folders/${project.folder_id}`,
      token,
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to generate share link" }, { status: 500 });
  }
}
