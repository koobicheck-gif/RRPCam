import { getDriveClient } from "./auth";
import { Photo, PhotoTag } from "@/types";
import { Readable } from "stream";

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID!;

export async function createProjectFolder(name: string): Promise<string> {
  const drive = getDriveClient();

  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [ROOT_FOLDER_ID],
    },
    fields: "id",
  });

  return res.data.id!;
}

export async function getPhotosInFolder(folderId: string): Promise<Photo[]> {
  const drive = getDriveClient();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
    fields:
      "files(id, name, thumbnailLink, webViewLink, createdTime, mimeType, size, description, appProperties)",
    orderBy: "createdTime desc",
    pageSize: 200,
  });

  if (!res.data.files) return [];

  return res.data.files.map((f) => {
    const appProps = (f.appProperties as Record<string, string>) || {};
    return {
      id: f.id!,
      name: f.name || "",
      thumbnailUrl: f.thumbnailLink
        ? f.thumbnailLink.replace("=s220", "=s400")
        : "",
      webViewLink: f.webViewLink || "",
      downloadUrl: `https://drive.google.com/uc?export=download&id=${f.id}`,
      tag: (appProps.tag as PhotoTag) || undefined,
      caption: appProps.caption || "",
      createdTime: f.createdTime || "",
      mimeType: f.mimeType || "",
      size: f.size || "0",
    };
  });
}

export async function uploadPhotoToFolder(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  tag?: PhotoTag,
  caption?: string
): Promise<Photo> {
  const drive = getDriveClient();

  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
      appProperties: {
        tag: tag || "",
        caption: caption || "",
      },
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name, thumbnailLink, webViewLink, createdTime, mimeType, size",
  });

  const file = res.data;
  return {
    id: file.id!,
    name: file.name || fileName,
    thumbnailUrl: file.thumbnailLink
      ? file.thumbnailLink.replace("=s220", "=s400")
      : "",
    webViewLink: file.webViewLink || "",
    downloadUrl: `https://drive.google.com/uc?export=download&id=${file.id}`,
    tag,
    caption,
    createdTime: file.createdTime || "",
    mimeType: file.mimeType || mimeType,
    size: file.size || "0",
  };
}

export async function updatePhotoMetadata(
  fileId: string,
  tag?: PhotoTag,
  caption?: string
): Promise<void> {
  const drive = getDriveClient();
  await drive.files.update({
    fileId,
    requestBody: {
      appProperties: {
        tag: tag || "",
        caption: caption || "",
      },
    },
  });
}

export async function deletePhoto(fileId: string): Promise<void> {
  const drive = getDriveClient();
  await drive.files.delete({ fileId });
}

export async function getShareableLink(folderId: string): Promise<string> {
  const drive = getDriveClient();

  // Make folder viewable by anyone with the link
  await drive.permissions.create({
    fileId: folderId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return `https://drive.google.com/drive/folders/${folderId}`;
}

export async function getFileDownloadStream(fileId: string) {
  const drive = getDriveClient();
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  return res.data;
}
