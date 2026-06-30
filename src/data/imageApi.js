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

export const uploadImage = async ({
	alt = "",
	file,
	fileName,
	folder = "blog",
}) =>
	requestJson("/api/images", {
		method: "POST",
		body: JSON.stringify({ alt, file, fileName, folder }),
	});

export const deleteImage = async ({ publicId }) =>
	requestJson(`/api/images?publicId=${encodeURIComponent(publicId)}`, {
		method: "DELETE",
	});
