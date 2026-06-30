import fs from "fs/promises";
import path from "path";
import { ensureContentSchema, getSql, hasPostgres } from "./_postgres.js";

const settingsKey = "site-settings";
const dataFilePath = path.join(process.cwd(), ".data", "site-settings.json");

const emptyCurrentBook = {
	author: "",
	coverUrl: "",
	link: "",
	title: "",
};

export const normalizeSiteSettings = (settings = {}) => ({
	currentBook: {
		author: settings.currentBook?.author?.trim() || "",
		coverUrl: settings.currentBook?.coverUrl?.trim() || "",
		link: settings.currentBook?.link?.trim() || "",
		title: settings.currentBook?.title?.trim() || "",
	},
});

const emptySettings = normalizeSiteSettings({
	currentBook: emptyCurrentBook,
});

const readFileSettings = async () => {
	try {
		const fileContents = await fs.readFile(dataFilePath, "utf8");
		return normalizeSiteSettings(JSON.parse(fileContents));
	} catch {
		return emptySettings;
	}
};

const writeFileSettings = async (settings) => {
	await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
	await fs.writeFile(
		dataFilePath,
		JSON.stringify(settings, null, 2),
		"utf8",
	);
};

export const readSiteSettings = async () => {
	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		const rows = await sql`
			SELECT data
			FROM portfolio_site_settings
			WHERE key = ${settingsKey}
			LIMIT 1
		`;
		return rows[0]?.data ? normalizeSiteSettings(rows[0].data) : emptySettings;
	}

	return readFileSettings();
};

export const writeSiteSettings = async (settings) => {
	const nextSettings = normalizeSiteSettings(settings);

	if (hasPostgres) {
		await ensureContentSchema();
		const sql = getSql();
		await sql`
			INSERT INTO portfolio_site_settings (key, updated_at, data)
			VALUES (${settingsKey}, NOW(), ${JSON.stringify(nextSettings)}::jsonb)
			ON CONFLICT (key) DO UPDATE SET
				updated_at = EXCLUDED.updated_at,
				data = EXCLUDED.data
		`;
		return nextSettings;
	}

	await writeFileSettings(nextSettings);
	return nextSettings;
};
