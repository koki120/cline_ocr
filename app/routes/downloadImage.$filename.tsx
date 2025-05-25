import { LoaderFunctionArgs } from "@remix-run/node";
import { createReadStream, existsSync } from "fs";
import { join } from "path";
import { requireAuth } from "../lib/auth.guard";

export async function loader({ request, params }: LoaderFunctionArgs) {
	// Require authentication for image access
	await requireAuth(request);
	const filename = params["*"];

	if (!filename) {
		throw new Response("File not found", { status: 404 });
	}

	const filePath = join(process.cwd(), "storage", "images", filename);

	if (!existsSync(filePath)) {
		throw new Response("File not found", { status: 404 });
	}

	const stream = createReadStream(filePath);

	// Determine content type based on file extension
	const ext = filename.split(".").pop()?.toLowerCase();
	let contentType = "application/octet-stream";

	switch (ext) {
		case "png":
			contentType = "image/png";
			break;
		case "jpg":
		case "jpeg":
			contentType = "image/jpeg";
			break;
		case "gif":
			contentType = "image/gif";
			break;
		case "webp":
			contentType = "image/webp";
			break;
	}

	return new Response(stream as unknown as ReadableStream, {
		headers: {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=31536000",
		},
	});
}
