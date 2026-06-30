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

export const listBlogPosts = async ({ all = false } = {}) =>
	requestJson(`/api/blog-posts${all ? "?all=true" : ""}`);

export const getBlogPost = async (postId) =>
	requestJson(`/api/blog-posts?id=${encodeURIComponent(postId)}`);

export const saveBlogPost = async (post) =>
	requestJson("/api/blog-posts", {
		method: "POST",
		body: JSON.stringify({ post }),
	});

export const deleteBlogPost = async (postId) =>
	requestJson(`/api/blog-posts?id=${encodeURIComponent(postId)}`, {
		method: "DELETE",
	});

export const toggleBlogPostPublish = async (postId) =>
	requestJson(`/api/blog-posts?id=${encodeURIComponent(postId)}`, {
		method: "PATCH",
	});
