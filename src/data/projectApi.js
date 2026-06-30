const requestJson = async (url, options = {}) => {
	const response = await fetch(url, {
		credentials: "same-origin",
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});

	const payload = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error(payload.error || "Request failed");
	}

	return payload;
};

export const listProjects = async ({ all = false } = {}) =>
	requestJson(`/api/projects${all ? "?all=true" : ""}`);

export const getProject = async (projectId) =>
	requestJson(`/api/projects?id=${encodeURIComponent(projectId)}`);

export const saveProject = async (project) =>
	requestJson("/api/projects", {
		method: "POST",
		body: JSON.stringify({ project }),
	});

export const deleteProject = async (projectId) =>
	requestJson(`/api/projects?id=${encodeURIComponent(projectId)}`, {
		method: "DELETE",
	});
