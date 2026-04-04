import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Maximum file size: 20 MB */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

/** Minimum extracted text length to consider a valid extraction */
const MIN_TEXT_LENGTH = 50;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(
      "Invalid request body. Please submit a PDF file using the upload form.",
      400
    );
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return jsonError(
      "No file provided. Please select a PDF file to upload.",
      400
    );
  }

  // Validate file type — accept application/pdf and common PDF MIME variants
  const isPdf =
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf");

  if (!isPdf) {
    return jsonError(
      "Only PDF files are supported. Please upload a .pdf file or paste your contract text directly.",
      400
    );
  }

  // Validate file size
  if (file.size === 0) {
    return jsonError(
      "The uploaded file is empty. Please select a valid PDF file.",
      422
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError(
      "File is too large (max 20 MB). Please upload a smaller file or paste your contract text directly.",
      400
    );
  }

  // Convert file to Buffer and parse with pdf-parse
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return jsonError(
      "Failed to read the uploaded file. Please try again.",
      500
    );
  }

  try {
    // pdf-parse v2 exports PDFParse as a named class.
    // serverExternalPackages in next.config.ts ensures this isn't webpack-bundled,
    // so the internal pdf.js worker resolves correctly.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });

    // pageJoiner: '' avoids injecting "-- page N of M --" markers into the text
    const result = await parser.getText({ pageJoiner: "" });
    const numPages = result.total;
    const extractedText = result.text?.trim() ?? "";

    await parser.destroy();

    if (extractedText.length < MIN_TEXT_LENGTH) {
      console.error(
        `[upload] PDF text extraction yielded only ${extractedText.length} chars (file size: ${file.size} bytes, pages: ${numPages}). Likely a scanned/image-only PDF.`
      );
      return jsonError(
        "Could not extract enough text from this PDF. It may be a scanned document or image-only file. Please paste your contract text directly instead.",
        422
      );
    }

    return NextResponse.json({
      text: extractedText,
      pages: numPages,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `[upload] pdf-parse failed (file: ${file.name}, size: ${file.size} bytes): ${message}`
    );
    return jsonError(
      "Failed to extract text from this PDF. The file may be corrupted or in an unsupported format. Please try a different file or paste your contract text directly.",
      422
    );
  }
}
