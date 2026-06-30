import { isVercel } from "./_env.js";

const cookieName = "portfolio_blog_admin";
const secureAttribute = isVercel() ? "Secure; " : "";

export default function handler(request, response) {
	if (request.method !== "POST") {
		response.setHeader("Allow", "POST");
		return response.status(405).json({ error: "Method not allowed" });
	}

	response.setHeader(
		"Set-Cookie",
		`${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; ${secureAttribute}`,
	);
	return response.status(200).json({ authenticated: false });
}
