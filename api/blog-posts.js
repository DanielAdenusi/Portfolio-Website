import { clearAdminCookie, isAdminSessionValid } from "./_blogAuth.js";
import {
	deletePost,
	getPostById,
	getPublicPosts,
	readAllPosts,
	togglePublishPost,
	upsertPost,
} from "./_blogStore.js";
import { slugifyBlogTitle } from "../src/data/blogPosts.js";

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
				const post = await getPostById(id);
				if (!post) {
					return sendJson(response, 404, {
						error: "Post not found.",
					});
				}

				if (post.published === false && !isAdminSessionValid(request)) {
					return sendJson(response, 404, {
						error: "Post not found.",
					});
				}

				return sendJson(response, 200, { post });
			}

			if (all === "true") {
				if (!isAdminSessionValid(request)) {
					return sendJson(response, 401, { error: "Unauthorized." });
				}

				return sendJson(response, 200, { posts: await readAllPosts() });
			}

			return sendJson(response, 200, { posts: await getPublicPosts() });
		}

		if (!isAdminSessionValid(request)) {
			return sendJson(response, 401, { error: "Unauthorized." });
		}

		if (request.method === "POST") {
			const { post } = await readBody(request);
			if (!post || !post.title || !post.excerpt || !post.body) {
				return sendJson(response, 400, {
					error: "Post content is incomplete.",
				});
			}

			const posts = await upsertPost(post);
			const savedPost = posts.find(
				(entry) => entry.id === (post.id || slugifyBlogTitle(post.title)),
			);
			return sendJson(response, 200, { posts, post: savedPost || null });
		}

		if (request.method === "PATCH") {
			const { id } = request.query;
			if (!id) {
				return sendJson(response, 400, { error: "Missing post id." });
			}

			const posts = await togglePublishPost(id);
			const updatedPost = posts.find((post) => post.id === id) || null;
			return sendJson(response, 200, { posts, post: updatedPost });
		}

		if (request.method === "DELETE") {
			const { id } = request.query;
			if (!id) {
				return sendJson(response, 400, { error: "Missing post id." });
			}

			const posts = await deletePost(id);
			return sendJson(response, 200, { posts });
		}

		response.setHeader("Allow", "GET, POST, PATCH, DELETE");
		return sendJson(response, 405, { error: "Method not allowed" });
	} catch (error) {
		if (!response.headersSent) {
			return sendJson(response, 500, {
				error: error.message || "Blog store failure.",
			});
		}

		clearAdminCookie(response);
		return undefined;
	}
}
