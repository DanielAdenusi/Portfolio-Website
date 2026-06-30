import fs from "fs/promises";
import path from "path";
import { kv } from "@vercel/kv";
import { getServerEnv } from "./_env.js";
import { ensureContentSchema, getSql, hasPostgres } from "./_postgres.js";
import {
	normalizeBlogPost,
	sortBlogPosts,
	seedBlogPosts,
	slugifyBlogTitle,
} from "../src/data/blogPosts.js";

const storeKey = "blog-posts";
const dataFilePath = path.join(process.cwd(), ".data", "blog-posts.json");
const hasKv = Boolean(
	getServerEnv("KV_REST_API_URL") && getServerEnv("KV_REST_API_TOKEN"),
);

const toPostgresPost = (row) =>
	normalizeBlogPost({
		...(row.data || {}),
		createdAt:
			row.data?.createdAt || row.created_at?.toISOString?.() || row.created_at,
		id: row.id,
		published: row.published,
		updatedAt:
			row.data?.updatedAt || row.updated_at?.toISOString?.() || row.updated_at,
	});

const readFilePosts = async () => {
	try {
		const fileContents = await fs.readFile(dataFilePath, "utf8");
		const parsedPosts = JSON.parse(fileContents);
		return Array.isArray(parsedPosts) ? parsedPosts : null;
	} catch {
		return null;
	}
};

const writeFilePosts = async (posts) => {
	await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
	await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), "utf8");
};

export const readAllPosts = async () => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		const rows = await sql`
			SELECT id, published, created_at, updated_at, data
			FROM portfolio_blog_posts
			ORDER BY post_date DESC, created_at DESC
		`;
		return sortBlogPosts(rows.map(toPostgresPost));
	}

	if (hasKv) {
		const storedPosts = await kv.get(storeKey);
		if (Array.isArray(storedPosts)) {
			return sortBlogPosts(storedPosts.map(normalizeBlogPost));
		}
	}

	const filePosts = await readFilePosts();
	if (filePosts) {
		return sortBlogPosts(filePosts.map(normalizeBlogPost));
	}

	return sortBlogPosts(seedBlogPosts.map(normalizeBlogPost));
};

export const writeAllPosts = async (posts) => {
	const nextPosts = sortBlogPosts(posts.map(normalizeBlogPost));

	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`DELETE FROM portfolio_blog_posts`;

		for (const post of nextPosts) {
			await sql`
				INSERT INTO portfolio_blog_posts (
					id,
					title,
					excerpt,
					post_date,
					published,
					created_at,
					updated_at,
					data
				)
				VALUES (
					${post.id},
					${post.title},
					${post.excerpt},
					${post.date || ""},
					${post.published !== false},
					${post.createdAt || new Date().toISOString()},
					${post.updatedAt || new Date().toISOString()},
					${JSON.stringify(post)}::jsonb
				)
				ON CONFLICT (id) DO UPDATE SET
					title = EXCLUDED.title,
					excerpt = EXCLUDED.excerpt,
					post_date = EXCLUDED.post_date,
					published = EXCLUDED.published,
					updated_at = EXCLUDED.updated_at,
					data = EXCLUDED.data
			`;
		}

		return nextPosts;
	}

	if (hasKv) {
		await kv.set(storeKey, nextPosts);
		return nextPosts;
	}

	await writeFilePosts(nextPosts);
	return nextPosts;
};

export const getPublicPosts = async () =>
	readAllPosts().then((posts) =>
		posts.filter((post) => post.published !== false),
	);

export const getPostById = async (postId) => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		const rows = await sql`
			SELECT id, published, created_at, updated_at, data
			FROM portfolio_blog_posts
			WHERE id = ${postId}
			LIMIT 1
		`;
		return rows[0] ? toPostgresPost(rows[0]) : undefined;
	}

	const posts = await readAllPosts();
	return posts.find((post) => post.id === postId);
};

export const upsertPost = async (post) => {
	const now = new Date().toISOString();
	const nextPost = normalizeBlogPost({
		...post,
		id: post.id || slugifyBlogTitle(post.title),
		createdAt: post.createdAt || now,
		updatedAt: now,
	});

	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`
			INSERT INTO portfolio_blog_posts (
				id,
				title,
				excerpt,
				post_date,
				published,
				created_at,
				updated_at,
				data
			)
			VALUES (
				${nextPost.id},
				${nextPost.title},
				${nextPost.excerpt},
				${nextPost.date || ""},
				${nextPost.published !== false},
				${nextPost.createdAt || now},
				${nextPost.updatedAt || now},
				${JSON.stringify(nextPost)}::jsonb
			)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				excerpt = EXCLUDED.excerpt,
				post_date = EXCLUDED.post_date,
				published = EXCLUDED.published,
				updated_at = EXCLUDED.updated_at,
				data = EXCLUDED.data
		`;
		return readAllPosts();
	}

	const posts = await readAllPosts();
	const nextPosts = posts.some(
		(existingPost) => existingPost.id === nextPost.id,
	)
		? posts.map((existingPost) =>
				existingPost.id === nextPost.id
					? { ...existingPost, ...nextPost }
					: existingPost,
			)
		: [nextPost, ...posts];

	return writeAllPosts(nextPosts);
};

export const deletePost = async (postId) => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`DELETE FROM portfolio_blog_posts WHERE id = ${postId}`;
		return readAllPosts();
	}

	return writeAllPosts(
		(await readAllPosts()).filter((post) => post.id !== postId),
	);
};

export const togglePublishPost = async (postId) => {
	if (hasPostgres) {
		const post = await getPostById(postId);
		if (!post) {
			return readAllPosts();
		}

		return upsertPost({
			...post,
			published: !post.published,
			updatedAt: new Date().toISOString(),
		});
	}

	const posts = await readAllPosts();
	const nextPosts = posts.map((post) =>
		post.id === postId
			? {
					...post,
					published: !post.published,
					updatedAt: new Date().toISOString(),
				}
			: post,
	);

	return writeAllPosts(nextPosts);
};
