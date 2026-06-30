const requestJson = async (url, options = {}) => {
	const response = await fetch(url, {
		headers: {
			"Content-Type": "application/json",
			...(options.headers || {}),
		},
		...options,
	});
	const payload = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new Error(payload.error || "Site settings request failed.");
	}

	return payload;
};

export const normalizeSiteSettings = (settings = {}) => ({
	currentBook: {
		author: settings.currentBook?.author?.trim() || "",
		coverUrl: settings.currentBook?.coverUrl?.trim() || "",
		link: settings.currentBook?.link?.trim() || "",
		title: settings.currentBook?.title?.trim() || "",
	},
});

export const getSiteSettings = async () =>
	requestJson("/api/site-settings").then(({ settings }) => ({
		settings: normalizeSiteSettings(settings),
	}));

export const saveSiteSettings = async (settings) =>
	requestJson("/api/site-settings", {
		method: "POST",
		body: JSON.stringify({ settings: normalizeSiteSettings(settings) }),
	}).then(({ settings: savedSettings }) => ({
		settings: normalizeSiteSettings(savedSettings),
	}));

export const fetchBookMetadata = async (url) =>
	requestJson(`/api/book-metadata?url=${encodeURIComponent(url)}`).then(
		({ book }) => ({
			book: {
				author: book?.author?.trim() || "",
				coverUrl: book?.coverUrl?.trim() || "",
				link: book?.link?.trim() || url.trim(),
				title: book?.title?.trim() || "",
			},
		}),
	);
