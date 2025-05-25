import type { ActionFunctionArgs } from "@remix-run/node";
import { createReadStream, existsSync, createWriteStream } from "fs";
import { join } from "path";
import archiver from "archiver";
import { getOCRResultById } from "../lib/db.server";
import { requireAuthAPI } from "../lib/auth.guard";

interface OCRResult {
  id: number;
  image_filename: string;
  markdown_text: string;
  created_at: string;
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Check authentication
    const authResult = await requireAuthAPI(request);
    if (!authResult.authenticated) {
      return Response.json(
        { error: "Authentication required" },
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const { ocrResultId, markdown } = body;

    if (!ocrResultId) {
      return Response.json(
        { error: "Missing OCR result ID" },
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get OCR result from database
    const ocrResult = getOCRResultById(ocrResultId) as OCRResult | null;
    if (!ocrResult) {
      return Response.json(
        { error: "OCR result not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if image file exists
    const imagePath = join(
      process.cwd(),
      "storage",
      "images",
      ocrResult.image_filename
    );
    if (!existsSync(imagePath)) {
      return Response.json(
        { error: "Image file not found" },
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create ZIP file
    const zipFilename = `textbook-ocr-${ocrResultId}-${Date.now()}.zip`;
    const zipPath = join(process.cwd(), "storage", zipFilename);

    const output = createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Pipe archive data to the file
    archive.pipe(output);

    // Add markdown file to ZIP
    const markdownContent = markdown || ocrResult.markdown_text;
    archive.append(markdownContent, { name: `ocr-result-${ocrResultId}.md` });

    // Add image file to ZIP
    const imageStream = createReadStream(imagePath);
    archive.append(imageStream, { name: ocrResult.image_filename });

    // Finalize the archive
    await archive.finalize();

    // Wait for the output stream to finish
    await new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      output.on("error", reject);
    });

    // Return the ZIP file as a download
    const zipStream = createReadStream(zipPath);

    return new Response(zipStream as unknown as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error creating ZIP file:", error);
    return Response.json(
      { error: "Failed to create ZIP file" },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
