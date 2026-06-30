import { neon } from "@neondatabase/serverless";
import { getServerEnv } from "./_env.js";

const connectionString =
	getServerEnv("DATABASE_URL") ||
	getServerEnv("POSTGRES_URL") ||
	getServerEnv("NEON_DATABASE_URL");

let sqlClient;
let schemaReadyPromise;

export const hasPostgres = Boolean(connectionString);

export const getSql = () => {
	if (!connectionString) {
		throw new Error("DATABASE_URL is not configured.");
	}

	if (!sqlClient) {
		sqlClient = neon(connectionString);
	}

	return sqlClient;
};

export const ensureContentSchema = async () => {
	if (!hasPostgres) {
		return;
	}

	if (!schemaReadyPromise) {
		const sql = getSql();
		schemaReadyPromise = Promise.all([
			sql`
				CREATE TABLE IF NOT EXISTS portfolio_blog_posts (
					id TEXT PRIMARY KEY,
					title TEXT NOT NULL,
					excerpt TEXT NOT NULL DEFAULT '',
					post_date TEXT NOT NULL DEFAULT '',
					published BOOLEAN NOT NULL DEFAULT FALSE,
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					data JSONB NOT NULL
				)
			`,
			sql`
				CREATE TABLE IF NOT EXISTS portfolio_projects (
					id TEXT PRIMARY KEY,
					title TEXT NOT NULL,
					project_type TEXT NOT NULL DEFAULT '',
					timeline TEXT NOT NULL DEFAULT '',
					created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					data JSONB NOT NULL
				)
			`,
			sql`
				CREATE TABLE IF NOT EXISTS portfolio_site_settings (
					key TEXT PRIMARY KEY,
					updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
					data JSONB NOT NULL
				)
			`,
		]);
	}

	await schemaReadyPromise;
};
