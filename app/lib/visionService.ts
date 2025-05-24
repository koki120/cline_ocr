import axios from 'axios';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.server.js';

export type OCRRequest = {
  image_base64: string;
};

export type OCRResponse = {
  markdown: string;
  imageFilename: string;
};

/**
 * Process an image with Google Cloud Vision API for OCR
 * @param imageBase64 Base64 encoded image data
 * @returns Processed OCR result in Markdown format and image filename
 */
export async function processImageWithVision(imageBase64: string): Promise<OCRResponse> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Generate a unique filename for the image
    const imageFilename = `${uuidv4()}.png`;
    const imagePath = join(process.cwd(), 'storage', 'images', imageFilename);

    // Save the image to the storage directory
    await writeFile(imagePath, Buffer.from(base64Data, 'base64'));

    // Prepare the request to Google Cloud Vision API
    const visionApiUrl = 'https://vision.googleapis.com/v1/images:annotate';
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;

    const requestData = {
      requests: [
        {
          image: { content: base64Data },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }]
        }
      ]
    };

    // Make the API request
    const response = await axios.post(
      `${visionApiUrl}?key=${apiKey}`,
      requestData
    );

    // Extract the text from the response
    const textAnnotation = response.data.responses[0]?.fullTextAnnotation;

    if (!textAnnotation) {
      throw new Error('No text detected in the image');
    }

    // Convert the OCR text to Markdown format
    const markdown = convertToMarkdown(textAnnotation.text);

    // Store the OCR result in the database
    await storeOCRResult(imageFilename, markdown);

    return {
      markdown,
      imageFilename
    };
  } catch (error) {
    console.error('Error processing image with Vision API:', error);
    throw new Error('Failed to process image with OCR');
  }
}

/**
 * Convert plain text to Markdown format
 * @param text Plain text from OCR
 * @returns Formatted Markdown text
 */
function convertToMarkdown(text: string): string {
  // Split the text into lines
  const lines = text.split('\n');
  let markdown = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) {
      markdown += '\n';
      inList = false;
      continue;
    }

    // Detect headings (lines that are shorter and possibly followed by empty line)
    if (
      (i === 0 || !lines[i - 1].trim()) &&
      line.length < 50 &&
      (i === lines.length - 1 || !lines[i + 1].trim() || lines[i + 1].trim().length < line.length)
    ) {
      // Check if it looks like a chapter or section heading
      if (line.match(/^(chapter|section|part|第\s*\d+\s*章|第\s*\d+\s*節)/i)) {
        markdown += `# ${line}\n\n`;
      } else if (line.match(/^(\d+(\.\d+)*\s+|[A-Z]\.\s+)/)) {
        markdown += `## ${line}\n\n`;
      } else {
        markdown += `### ${line}\n\n`;
      }
      continue;
    }

    // Detect bullet points
    if (line.match(/^[\s•\-*+◦○●■□▪▫]\s+/)) {
      if (!inList) {
        markdown += '\n';
        inList = true;
      }
      markdown += `- ${line.replace(/^[\s•\-*+◦○●■□▪▫]\s+/, '')}\n`;
      continue;
    }

    // Detect numbered lists
    if (line.match(/^\d+[.)]\s+/)) {
      if (!inList) {
        markdown += '\n';
        inList = true;
      }
      markdown += `${line}\n`;
      continue;
    }

    // Regular paragraph
    if (inList) {
      markdown += '\n';
      inList = false;
    }
    markdown += `${line}\n`;
  }

  return markdown;
}

/**
 * Store OCR result in the database
 * @param imageFilename Filename of the processed image
 * @param markdown Markdown text from OCR
 */
async function storeOCRResult(imageFilename: string, markdown: string): Promise<void> {
  try {
    db.prepare(
      `INSERT INTO ocr_results (image_filename, markdown_text, created_at)
       VALUES (?, ?, ?)`
    ).run(imageFilename, markdown, new Date().toISOString());
  } catch (error) {
    console.error('Error storing OCR result in database:', error);
  }
}
