import fs from "fs/promises";
import path from "path";

const TEXT_MIME_TYPES = new Set(["text/plain", "text/csv", "application/json", "application/xml", "text/xml"]);

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// Clients frequently upload with a generic or absent content type — browsers do
// this for .csv and .docx routinely. Falling back to the extension keeps those
// files parseable instead of silently storing them with no extracted text.
const EXTENSION_MIME_TYPES: Record<string, string> = {
  ".txt": "text/plain",
  ".md": "text/plain",
  ".csv": "text/csv",
  ".json": "application/json",
  ".xml": "application/xml",
  ".pdf": "application/pdf",
  ".docx": DOCX_MIME,
  ".xlsx": XLSX_MIME,
  ".xls": "application/vnd.ms-excel",
};

const PARSEABLE_MIME_TYPES = new Set([
  ...TEXT_MIME_TYPES,
  "application/pdf",
  DOCX_MIME,
  XLSX_MIME,
  "application/vnd.ms-excel",
]);

/** Trust the declared content type only when we can actually parse it. */
function resolveMimeType(filePath: string, mimeType: string): string {
  if (PARSEABLE_MIME_TYPES.has(mimeType)) return mimeType;
  return EXTENSION_MIME_TYPES[path.extname(filePath).toLowerCase()] ?? mimeType;
}

/**
 * Extracts plain text from an uploaded file so it can be fed into the AI as context.
 * Fully implemented for txt/csv/json/pdf/docx/xlsx. Images, audio, video, and zip
 * archives are stored but not parsed yet — see TODOs below.
 */
export async function extractText(filePath: string, declaredMimeType: string): Promise<string | null> {
  const mimeType = resolveMimeType(filePath, declaredMimeType);
  try {
    if (TEXT_MIME_TYPES.has(mimeType)) {
      return await fs.readFile(filePath, "utf-8");
    }

    if (mimeType === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = await fs.readFile(filePath);
      const result = await pdfParse(buffer);
      return result.text;
    }

    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    if (
      mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      const XLSX = await import("xlsx");
      const workbook = XLSX.readFile(filePath);
      return workbook.SheetNames.map((name) => XLSX.utils.sheet_to_csv(workbook.Sheets[name])).join("\n\n");
    }

    // TODO: PowerPoint (.pptx) text extraction — parse slide XML from the zip archive.
    // TODO: Image OCR — integrate Tesseract.js or a cloud OCR API.
    // TODO: Audio/video — transcribe via Whisper (OpenAI) before indexing.
    // TODO: ZIP — enumerate + recursively extract supported entries.
    return null;
  } catch (err) {
    console.error(`Failed to extract text from ${path.basename(filePath)}:`, err);
    return null;
  }
}
