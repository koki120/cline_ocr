import type { ActionFunctionArgs } from "@remix-run/node";
import { processImageWithVision } from "../lib/visionService";
import type { OCRRequest } from "../lib/visionService";
import { requireAuthAPI } from "../lib/auth.guard";

/**
 * API endpoint for OCR processing
 * POST /api/ocr
 */
export async function action({ request }: ActionFunctionArgs) {
	// Only allow POST requests
	if (request.method !== "POST") {
		return Response.json(
			{ error: "Method not allowed" },
			{
				status: 405,
				headers: { "Content-Type": "application/json" },
			},
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
				},
			);
		}

		// Parse the request body
		const body = (await request.json()) as OCRRequest;

		// Validate the request
		if (!body.image_base64) {
			return Response.json(
				{ error: "Missing image_base64 in request body" },
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Validate image format
		if (
			!body.image_base64.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)
		) {
			return Response.json(
				{
					error:
						"Invalid image format. Only PNG, JPEG, GIF, and WebP are supported.",
				},
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check image size (limit to 10MB base64)
		if (body.image_base64.length > 10 * 1024 * 1024) {
			return Response.json(
				{ error: "Image too large. Maximum size is 10MB." },
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Check if API key is configured
		if (
			!process.env.GOOGLE_CLOUD_VISION_API_KEY ||
			process.env.GOOGLE_CLOUD_VISION_API_KEY === "your_api_key_here"
		) {
			return Response.json(
				{ error: "Google Cloud Vision API key not configured" },
				{
					status: 500,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Process the image with Google Cloud Vision API
		const result = await processImageWithVision(body.image_base64);

		// Return the OCR result
		return Response.json(result, {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error processing OCR request:", error);

		// Return more specific error messages
		if (error instanceof Error) {
			if (error.message.includes("API key")) {
				return Response.json(
					{ error: "Invalid API key or API access denied" },
					{
						status: 401,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
			if (error.message.includes("quota")) {
				return Response.json(
					{
						error: "API quota exceeded. Please try again later.",
					},
					{
						status: 429,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
			if (error.message.includes("No text detected")) {
				return Response.json(
					{
						error: "No text detected in the image. Please try a clearer image.",
					},
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
		}

		return Response.json(
			{ error: "Failed to process OCR request" },
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
