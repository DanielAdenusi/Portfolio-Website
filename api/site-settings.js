import { clearAdminCookie, isAdminSessionValid } from "./_blogAuth.js";
import {
	readSiteSettings,
	writeSiteSettings,
} from "./_siteSettingsStore.js";

const sendJson = (response, statusCode, payload) =>
	response.status(statusCode).json(payload);

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
	try {
		if (request.method === "GET") {
			return sendJson(response, 200, {
				settings: await readSiteSettings(),
			});
		}

		if (!isAdminSessionValid(request)) {
			return sendJson(response, 401, { error: "Unauthorized." });
		}

		if (request.method === "POST") {
			const { settings } = await readBody(request);
			const savedSettings = await writeSiteSettings(settings || {});
			return sendJson(response, 200, { settings: savedSettings });
		}

		response.setHeader("Allow", "GET, POST");
		return sendJson(response, 405, { error: "Method not allowed" });
	} catch (error) {
		if (!response.headersSent) {
			return sendJson(response, 500, {
				error: error.message || "Site settings failure.",
			});
		}

		clearAdminCookie(response);
		return undefined;
	}
}
