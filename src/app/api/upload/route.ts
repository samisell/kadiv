import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { authenticateRequest } from '@/lib/auth-helper';
import {
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  sanitizeFilename,
  isAllowedMimeType,
  isAllowedExtension,
  getUploadUrl,
  validateFolder,
} from '@/lib/upload';

export async function POST(request: NextRequest) {
  // ─── Auth check ──────────────────────────────────────────────────────────
  const authResult = await authenticateRequest(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    // ─── Parse multipart form data ─────────────────────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folderParam = (request.nextUrl.searchParams.get('folder') ?? '').trim().toLowerCase();
    const folder = validateFolder(folderParam);

    // ─── Validate file exists ──────────────────────────────────────────────
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload a file with the "file" field.' },
        { status: 400 },
      );
    }

    // ─── Validate MIME type ────────────────────────────────────────────────
    if (!isAllowedMimeType(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file type "${file.type}". Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // ─── Validate extension ────────────────────────────────────────────────
    if (!isAllowedExtension(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .gif, .webp, .svg' },
        { status: 400 },
      );
    }

    // ─── Validate file size ────────────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE) {
      const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return NextResponse.json(
        { error: `File size exceeds the ${maxMB}MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.` },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty.' },
        { status: 400 },
      );
    }

    // ─── Sanitize filename ─────────────────────────────────────────────────
    const safeFilename = sanitizeFilename(file.name);

    // ─── Build absolute path ───────────────────────────────────────────────
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    const filePath = path.join(uploadDir, safeFilename);

    // ─── Ensure directory exists ───────────────────────────────────────────
    await mkdir(uploadDir, { recursive: true });

    // ─── Read file buffer and write to disk ────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // ─── Build response ────────────────────────────────────────────────────
    const url = getUploadUrl(folder, safeFilename);

    return NextResponse.json(
      {
        url,
        filename: safeFilename,
        size: file.size,
        type: file.type,
        uploadedBy: authResult.payload.userId,
        uploadedAt: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during file upload. Please try again.' },
      { status: 500 },
    );
  }
}
