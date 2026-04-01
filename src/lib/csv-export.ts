/**
 * CSV generation and download utilities for admin data export.
 */

/**
 * Escape a CSV cell value: wrap in quotes and double any internal quotes.
 */
function escapeCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  // If the value contains a comma, quote, or newline, wrap in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generate a CSV string from headers and data rows.
 *
 * @param headers - Array of column header strings
 * @param rows - Array of objects where keys correspond to headers
 * @returns Complete CSV string with header row + data rows
 */
export function generateCSV(headers: string[], rows: Record<string, unknown>[]): string {
  const lines: string[] = [];

  // Header row
  lines.push(headers.map(escapeCell).join(','));

  // Data rows
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(','));
  }

  return lines.join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 *
 * @param filename - The name for the downloaded file (should include .csv extension)
 * @param csvContent - The CSV string content
 */
export function downloadCSV(filename: string, csvContent: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
