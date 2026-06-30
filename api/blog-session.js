import { clearAdminCookie, isAdminSessionValid } from "./_blogAuth.js";
import { getServerEnv } from "./_env.js";

export default function handler(request, response) {
	if (!getServerEnv("BLOG_ADMIN_PASSWORD")) {
		return response
			.status(500)
			.json({ error: "Admin password is not configured." });
	}

	if (!isAdminSessionValid(request)) {
		clearAdminCookie(response);
		return response.status(401).json({ authenticated: false });
	}

	return response.status(200).json({ authenticated: true });
}
