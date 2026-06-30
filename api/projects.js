import { clearAdminCookie, isAdminSessionValid } from "./_blogAuth.js";
import {
	deleteProject,
	getProjectById,
	readAllProjects,
	upsertProject,
} from "./_projectStore.js";
import { slugifyProjectTitle } from "../src/data/projects.js";

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
			const { id, all } = request.query;
			if (id) {
				const project = await getProjectById(id);
				if (!project) {
					return sendJson(response, 404, {
						error: "Project not found.",
					});
				}

				return sendJson(response, 200, { project });
			}

			if (all === "true" && !isAdminSessionValid(request)) {
				return sendJson(response, 401, { error: "Unauthorized." });
			}

			return sendJson(response, 200, {
				projects: await readAllProjects(),
			});
		}

		if (!isAdminSessionValid(request)) {
			return sendJson(response, 401, { error: "Unauthorized." });
		}

		if (request.method === "POST") {
			const { project } = await readBody(request);
			if (!project || !project.title || !project.excerpt) {
				return sendJson(response, 400, {
					error: "Project content is incomplete.",
				});
			}

			const projects = await upsertProject(project);
			const savedProject =
				projects.find(
					(entry) =>
						entry.id ===
						(project.id || slugifyProjectTitle(project.title)),
				) || null;
			return sendJson(response, 200, {
				project: savedProject,
				projects,
			});
		}

		if (request.method === "DELETE") {
			const { id } = request.query;
			if (!id) {
				return sendJson(response, 400, { error: "Missing project id." });
			}

			const projects = await deleteProject(id);
			return sendJson(response, 200, { projects });
		}

		response.setHeader("Allow", "GET, POST, DELETE");
		return sendJson(response, 405, { error: "Method not allowed" });
	} catch (error) {
		if (!response.headersSent) {
			return sendJson(response, 500, {
				error: error.message || "Project store failure.",
			});
		}

		clearAdminCookie(response);
		return undefined;
	}
}
