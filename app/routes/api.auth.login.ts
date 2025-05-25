import { type ActionFunctionArgs } from "@remix-run/node";
import { authenticateUser, generateToken } from "../lib/auth.server";

export async function action({ request }: ActionFunctionArgs) {
	if (request.method !== "POST") {
		return Response.json({ error: "Method not allowed" }, { status: 405 });
	}

	try {
		const body = await request.json();
		const { username, password } = body;

		// Validate input
		if (!username || !password) {
			return Response.json(
				{ error: "ユーザー名とパスワードが必要です" },
				{ status: 400 },
			);
		}

		// Authenticate user
		const isAuthenticated = await authenticateUser(username, password);

		if (!isAuthenticated) {
			return Response.json(
				{ error: "ユーザー名またはパスワードが正しくありません" },
				{ status: 401 },
			);
		}

		// Generate JWT token
		const token = generateToken(username);

		// Set HTTP-only cookie with the token
		const headers = new Headers();
		headers.append(
			"Set-Cookie",
			`token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
		);

		return Response.json(
			{ success: true, message: "ログインに成功しました" },
			{ headers },
		);
	} catch (error) {
		console.error("Login error:", error);
		return Response.json(
			{ error: "サーバーエラーが発生しました" },
			{ status: 500 },
		);
	}
}
