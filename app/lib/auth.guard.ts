import { redirect } from "@remix-run/node";
import { verifyToken } from "./auth.server";

/**
 * Authentication guard for loaders
 * Checks if user is authenticated and redirects to login if not
 */
export async function requireAuth(request: Request): Promise<string> {
	const cookieHeader = request.headers.get("Cookie");
	
	if (!cookieHeader) {
		throw redirect("/login");
	}

	const cookies = Object.fromEntries(
		cookieHeader.split("; ").map((cookie) => cookie.split("=")),
	);

	if (!cookies.token) {
		throw redirect("/login");
	}

	const username = verifyToken(cookies.token);
	if (!username) {
		throw redirect("/login");
	}

	return username;
}

/**
 * Authentication guard for API routes
 * Returns authentication status and username
 */
export async function requireAuthAPI(request: Request): Promise<{ authenticated: boolean; username?: string }> {
	const cookieHeader = request.headers.get("Cookie");
	
	if (!cookieHeader) {
		return { authenticated: false };
	}

	const cookies = Object.fromEntries(
		cookieHeader.split("; ").map((cookie) => cookie.split("=")),
	);

	if (!cookies.token) {
		return { authenticated: false };
	}

	const username = verifyToken(cookies.token);
	if (!username) {
		return { authenticated: false };
	}

	return { authenticated: true, username };
}
