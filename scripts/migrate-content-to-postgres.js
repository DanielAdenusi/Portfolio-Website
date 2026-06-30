import fs from "fs/promises";
import path from "path";
import { writeAllPosts } from "../api/_blogStore.js";
import { hasPostgres } from "../api/_postgres.js";
import { writeAllProjects } from "../api/_projectStore.js";
import {
	normalizeBlogPost,
	seedBlogPosts,
} from "../src/data/blogPosts.js";
import {
	normalizeProject,
	projects as seedProjects,
} from "../src/data/projects.js";

const readJsonArray = async (filePath) => {
	try {
		const contents = await fs.readFile(filePath, "utf8");
		const parsed = JSON.parse(contents);
		return Array.isArray(parsed) ? parsed : null;
	} catch {
		return null;
	}
};

const root = process.cwd();
const blogPostsPath = path.join(root, ".data", "blog-posts.json");
const projectsPath = path.join(root, ".data", "projects.json");

if (!hasPostgres) {
	throw new Error(
		"Set DATABASE_URL, POSTGRES_URL, or NEON_DATABASE_URL before migrating content.",
	);
}

const blogPosts =
	(await readJsonArray(blogPostsPath)) || seedBlogPosts.map(normalizeBlogPost);
const projects =
	(await readJsonArray(projectsPath)) || seedProjects.map(normalizeProject);

await writeAllPosts(blogPosts);
await writeAllProjects(projects);

console.log(
	`Migrated ${blogPosts.length} blog post(s) and ${projects.length} project(s) to Postgres.`,
);
