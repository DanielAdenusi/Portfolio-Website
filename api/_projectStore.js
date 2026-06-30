import fs from "fs/promises";
import path from "path";
import { kv } from "@vercel/kv";
import { getServerEnv } from "./_env.js";
import { ensureContentSchema, getSql, hasPostgres } from "./_postgres.js";
import {
	normalizeProject,
	projects as seedProjects,
	sortProjects,
	slugifyProjectTitle,
} from "../src/data/projects.js";

const storeKey = "portfolio-projects";
const dataFilePath = path.join(process.cwd(), ".data", "projects.json");
const hasKv = Boolean(
	getServerEnv("KV_REST_API_URL") && getServerEnv("KV_REST_API_TOKEN"),
);

const toPostgresProject = (row) =>
	normalizeProject({
		...(row.data || {}),
		createdAt:
			row.data?.createdAt || row.created_at?.toISOString?.() || row.created_at,
		id: row.id,
		updatedAt:
			row.data?.updatedAt || row.updated_at?.toISOString?.() || row.updated_at,
	});

const readFileProjects = async () => {
	try {
		const fileContents = await fs.readFile(dataFilePath, "utf8");
		const parsedProjects = JSON.parse(fileContents);
		return Array.isArray(parsedProjects) ? parsedProjects : null;
	} catch {
		return null;
	}
};

const writeFileProjects = async (projects) => {
	await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
	await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2), "utf8");
};

export const readAllProjects = async () => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		const rows = await sql`
			SELECT id, created_at, updated_at, data
			FROM portfolio_projects
			ORDER BY created_at DESC
		`;
		return sortProjects(rows.map(toPostgresProject));
	}

	if (hasKv) {
		const storedProjects = await kv.get(storeKey);
		if (Array.isArray(storedProjects)) {
			return sortProjects(storedProjects.map(normalizeProject));
		}
	}

	const fileProjects = await readFileProjects();
	if (fileProjects) {
		return sortProjects(fileProjects.map(normalizeProject));
	}

	return sortProjects(seedProjects.map(normalizeProject));
};

export const writeAllProjects = async (projects) => {
	const nextProjects = sortProjects(projects.map(normalizeProject));

	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`DELETE FROM portfolio_projects`;

		for (const project of nextProjects) {
			await sql`
				INSERT INTO portfolio_projects (
					id,
					title,
					project_type,
					timeline,
					created_at,
					updated_at,
					data
				)
				VALUES (
					${project.id},
					${project.title},
					${project.type || ""},
					${project.timeline || ""},
					${project.createdAt || new Date().toISOString()},
					${project.updatedAt || new Date().toISOString()},
					${JSON.stringify(project)}::jsonb
				)
				ON CONFLICT (id) DO UPDATE SET
					title = EXCLUDED.title,
					project_type = EXCLUDED.project_type,
					timeline = EXCLUDED.timeline,
					updated_at = EXCLUDED.updated_at,
					data = EXCLUDED.data
			`;
		}

		return nextProjects;
	}

	if (hasKv) {
		await kv.set(storeKey, nextProjects);
		return nextProjects;
	}

	await writeFileProjects(nextProjects);
	return nextProjects;
};

export const getProjectById = async (projectId) => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		const rows = await sql`
			SELECT id, created_at, updated_at, data
			FROM portfolio_projects
			WHERE id = ${projectId}
			LIMIT 1
		`;
		return rows[0] ? toPostgresProject(rows[0]) : undefined;
	}

	const projects = await readAllProjects();
	return projects.find((project) => project.id === projectId);
};

export const upsertProject = async (project) => {
	const now = new Date().toISOString();
	const nextProject = normalizeProject({
		...project,
		id: project.id || slugifyProjectTitle(project.title),
		createdAt: project.createdAt || now,
		updatedAt: now,
	});

	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`
			INSERT INTO portfolio_projects (
				id,
				title,
				project_type,
				timeline,
				created_at,
				updated_at,
				data
			)
			VALUES (
				${nextProject.id},
				${nextProject.title},
				${nextProject.type || ""},
				${nextProject.timeline || ""},
				${nextProject.createdAt || now},
				${nextProject.updatedAt || now},
				${JSON.stringify(nextProject)}::jsonb
			)
			ON CONFLICT (id) DO UPDATE SET
				title = EXCLUDED.title,
				project_type = EXCLUDED.project_type,
				timeline = EXCLUDED.timeline,
				updated_at = EXCLUDED.updated_at,
				data = EXCLUDED.data
		`;
		return readAllProjects();
	}

	const projects = await readAllProjects();
	const nextProjects = projects.some(
		(existingProject) => existingProject.id === nextProject.id,
	)
		? projects.map((existingProject) =>
				existingProject.id === nextProject.id
					? { ...existingProject, ...nextProject }
					: existingProject,
			)
		: [nextProject, ...projects];

	return writeAllProjects(nextProjects);
};

export const deleteProject = async (projectId) => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`DELETE FROM portfolio_projects WHERE id = ${projectId}`;
		return readAllProjects();
	}

	return writeAllProjects(
		(await readAllProjects()).filter((project) => project.id !== projectId),
	);
};
