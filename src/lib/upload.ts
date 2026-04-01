import path from 'path';

// ─── Constants ───────────────────────────────────────────────────────────────

/** Maximum file size in bytes (5 MB) */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
};

/** Flat list of allowed MIME type strings */
export const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_IMAGE_TYPES);

/** Accepted extensions for validation */
export const ACCEPTED_EXTENSIONS = Object.values(ALLOWED_IMAGE_TYPES).flat();

/** Valid upload folder names */
export const VALID_FOLDERS = ['blog', 'gallery', 'events', 'services', 'general'] as const;
export type UploadFolder = (typeof VALID_FOLDERS)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Sanitize a filename by removing path segments, replacing special characters,
 * and prepending a timestamp to avoid collisions.
 */
export function sanitizeFilename(filename: string): string {
  const timestamp = Date.now();
  // Remove path segments
  const base = path.basename(filename);
  // Replace spaces and special characters with hyphens
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
  // Ensure the filename has an extension
  const ext = path.extname(sanitized).toLowerCase();
  const nameWithoutExt = path.basename(sanitized, ext);
  return `${timestamp}-${nameWithoutExt}${ext}`;
}

/**
 * Validate that a MIME type is in the allowed list.
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Validate that a file extension is in the accepted list.
 */
export function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
}

/**
 * Generate the URL path for an uploaded file.
 * The URL is relative to the public directory, suitable for serving via Next.js.
 */
export function getUploadUrl(folder: string, filename: string): string {
  return `/uploads/${folder}/${filename}`;
}

/**
 * Validate a folder name against the list of allowed folders.
 * Falls back to 'general' if invalid.
 */
export function validateFolder(folder: string): UploadFolder {
  if (VALID_FOLDERS.includes(folder as UploadFolder)) {
    return folder as UploadFolder;
  }
  return 'general';
}
