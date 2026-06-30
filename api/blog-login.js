import { createAdminCookieValue, setAdminCookie } from "./_blogAuth.js";
import { getServerEnv } from "./_env.js";

const maxAgeSeconds = 60 * 60 * 8;

const readBody = async (request) => {
	if (request.body && typeof request.body === "object") {
		return request.body;
	}

	if (typeof request.body === "string") {
		try {
			return JSON.parse(request.body);
		} catch {
			return {};
		}
	}

	if (typeof request.json === "function") {
		try {
			return await request.json();
		} catch {
			return {};
		}
	}

	let rawBody = "";
	for await (const chunk of request) {
		rawBody += chunk;
	}

	if (!rawBody) {
		return {};
	}

	try {
		return JSON.parse(rawBody);
	} catch {
		return {};
	}
};

export default async function handler(request, response) {
	if (request.method !== "POST") {
		response.setHeader("Allow", "POST");
		return response.status(405).json({ error: "Method not allowed" });
	}

	const adminPassword = getServerEnv("BLOG_ADMIN_PASSWORD");
	if (!adminPassword) {
		return response
			.status(500)
			.json({ error: "Admin password is not configured." });
	}

	const { password } = await readBody(request);

	if (password !== adminPassword) {
		return response.status(401).json({
			error: "Incorrect password.",
		});
	}

	const expiry = Date.now() + maxAgeSeconds * 1000;
	const cookieValue = createAdminCookieValue(expiry);

	setAdminCookie(response, cookieValue, maxAgeSeconds);
	return response.status(200).json({ authenticated: true });
}
