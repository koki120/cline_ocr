import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { processImageWithVision } from '../lib/visionService';
import type { OCRRequest, OCRResponse } from '../lib/visionService';

/**
 * API endpoint for OCR processing
 * POST /api/ocr
 */
export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Parse the request body
    const body = await request.json() as OCRRequest;

    // Validate the request
    if (!body.image_base64) {
      return json({ error: 'Missing image_base64 in request body' }, { status: 400 });
    }

    // Process the image with Google Cloud Vision API
    const result = await processImageWithVision(body.image_base64);

    // Return the OCR result
    return json<OCRResponse>(result);
  } catch (error) {
    console.error('Error processing OCR request:', error);
    return json({ error: 'Failed to process OCR request' }, { status: 500 });
  }
}
