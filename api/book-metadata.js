import { isAdminSessionValid } from "./_blogAuth.js";

const amazonHosts = new Set(["amzn.to"]);

const sendJson = (response, statusCode, payload) =>
	response.status(statusCode).json(payload);

const decodeHtml = (value = "") =>
	value
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#34;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/\s+/g, " ")
		.trim();

const stripTags = (value = "") =>
	decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " "));

const parseAttributes = (tag = "") => {
	const attributes = {};
	const attributePattern = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
	let match;

	while ((match = attributePattern.exec(tag))) {
		attributes[match[1].toLowerCase()] = decodeHtml(match[2] || match[3] || "");
	}

	return attributes;
};

const getMetaContent = (html, key) => {
	const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
	const normalizedKey = key.toLowerCase();

	for (const tag of metaTags) {
		const attributes = parseAttributes(tag);
		const metaKey = (attributes.property || attributes.name || "").toLowerCase();

		if (metaKey === normalizedKey && attributes.content) {
			return attributes.content;
		}
	}

	return "";
};

const getElementById = (html, id) => {
	const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(
		`<[^>]+id=["']${escapedId}["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
		"i",
	);
	const match = html.match(pattern);
	return match ? stripTags(match[1]) : "";
};

const getClassText = (html, className) => {
	const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const pattern = new RegExp(
		`<[^>]+class=["'][^"']*${escapedClassName}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`,
		"i",
	);
	const match = html.match(pattern);
	return match ? stripTags(match[1]) : "";
};

const cleanAmazonTitle = (title = "") =>
	decodeHtml(title)
		.replace(/\s*:\s*Amazon\.[^:]+.*$/i, "")
		.replace(/\s*\|\s*Amazon\.[^|]+.*$/i, "")
		.trim();

const cleanAuthor = (author = "") =>
	decodeHtml(author)
		.replace(/^by\s+/i, "")
		.replace(/^visit the\s+/i, "")
		.replace(/\s+page$/i, "")
		.replace(/\s*[,|]\s*Amazon\.[^,|]+.*$/i, "")
		.trim();

const getAuthorFromTitle = (title = "") => {
	const parts = decodeHtml(title)
		.split(":")
		.map((part) => part.trim())
		.filter(Boolean);
	const amazonIndex = parts.findIndex((part) => /^Amazon\./i.test(part));

	if (amazonIndex > 1) {
		return cleanAuthor(parts[amazonIndex - 1]);
	}

	return "";
};

const extractBookMetadata = (html, sourceUrl) => {
	const rawTitle =
		getElementById(html, "productTitle") ||
		getMetaContent(html, "og:title") ||
		getMetaContent(html, "twitter:title") ||
		html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ||
		"";
	const ogTitle = getMetaContent(html, "og:title");
	const rawAuthor =
		getClassText(html, "contributorNameID") ||
		getElementById(html, "bylineInfo") ||
		getMetaContent(html, "book:author") ||
		getAuthorFromTitle(ogTitle || rawTitle);

	return {
		author: cleanAuthor(rawAuthor),
		coverUrl:
			getMetaContent(html, "og:image") ||
			getMetaContent(html, "twitter:image") ||
			"",
		link: sourceUrl,
		title: cleanAmazonTitle(rawTitle),
	};
};

const isSupportedBookUrl = (value) => {
	try {
		const url = new URL(value);
		const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
		return hostname.includes("amazon.") || amazonHosts.has(hostname);
	} catch {
		return false;
	}
};

export default async function handler(request, response) {
	if (!isAdminSessionValid(request)) {
		return sendJson(response, 401, { error: "Unauthorized." });
	}

	if (request.method !== "GET") {
		response.setHeader("Allow", "GET");
		return sendJson(response, 405, { error: "Method not allowed" });
	}

	const sourceUrl = request.query?.url;

	if (!sourceUrl || !isSupportedBookUrl(sourceUrl)) {
		return sendJson(response, 400, {
			error: "Enter a valid Amazon book URL.",
		});
	}

	try {
		const metadataResponse = await fetch(sourceUrl, {
			headers: {
				Accept: "text/html,application/xhtml+xml",
				"Accept-Language": "en-GB,en;q=0.9",
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
			},
			redirect: "follow",
		});

		if (!metadataResponse.ok) {
			return sendJson(response, 502, {
				error: "Amazon did not return book details for that URL.",
			});
		}

		const html = await metadataResponse.text();
		const metadata = extractBookMetadata(html, metadataResponse.url || sourceUrl);

		if (!metadata.title && !metadata.author && !metadata.coverUrl) {
			return sendJson(response, 422, {
				error: "Unable to find book details on that Amazon page.",
			});
		}

		return sendJson(response, 200, { book: metadata });
	} catch (error) {
		return sendJson(response, 500, {
			error: error.message || "Unable to fetch book details.",
		});
	}
}
