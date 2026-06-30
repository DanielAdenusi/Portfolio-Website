import crypto from "crypto";
import { isAdminSessionValid } from "./_blogAuth.js";
import { getServerEnv } from "./_env.js";

const maxImageSizeBytes = 1024 * 1024 * 3;

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

const getDataUrlSize = (dataUrl) => {
	const base64 = String(dataUrl).split(",")[1] || "";
	const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;

	return Math.floor((base64.length * 3) / 4) - padding;
};

const signCloudinaryParams = (params, apiSecret) => {
	const signaturePayload = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join("&");

	return crypto
		.createHash("sha1")
		.update(`${signaturePayload}${apiSecret}`)
		.digest("hex");
};

const getCloudinaryConfig = () => {
	const cloudName = getServerEnv("CLOUDINARY_CLOUD_NAME");
	const apiKey = getServerEnv("CLOUDINARY_API_KEY");
	const apiSecret = getServerEnv("CLOUDINARY_API_SECRET");

	if (!cloudName || !apiKey || !apiSecret) {
		throw new Error("Cloudinary environment variables are missing.");
	}

	return { apiKey, apiSecret, cloudName };
};

const getCloudinaryFolder = (folderType) => {
	if (folderType === "project") {
		return (
			getServerEnv("CLOUDINARY_PROJECT_FOLDER") || "portfolio/project"
		);
	}

	return getServerEnv("CLOUDINARY_BLOG_FOLDER") || "portfolio/blog";
};

const handleUpload = async (request, response) => {
	const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();
	const {
		alt = "",
		file,
		fileName = "",
		folder: folderType = "blog",
	} = await readBody(request);

	if (!file || !String(file).startsWith("data:image/")) {
		return sendJson(response, 400, {
			error: "Upload an image file.",
		});
	}

	if (getDataUrlSize(file) > maxImageSizeBytes) {
		return sendJson(response, 413, {
			error: "Images must be 3 MB or smaller.",
		});
	}

	const folder = getCloudinaryFolder(folderType);
	const timestamp = Math.floor(Date.now() / 1000);
	const uploadParams = {
		folder,
		timestamp,
	};
	const signature = signCloudinaryParams(uploadParams, apiSecret);
	const formData = new FormData();

	formData.set("file", file);
	formData.set("api_key", apiKey);
	formData.set("folder", folder);
	formData.set("timestamp", String(timestamp));
	formData.set("signature", signature);

	const uploadResponse = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		{
			method: "POST",
			body: formData,
		},
	);
	const payload = await uploadResponse.json().catch(() => ({}));

	if (!uploadResponse.ok) {
		return sendJson(response, uploadResponse.status, {
			error: payload.error?.message || "Cloudinary upload failed.",
		});
	}

	return sendJson(response, 200, {
		image: {
			alt:
				alt.trim() ||
				fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
			bytes: payload.bytes || null,
			format: payload.format || "",
			height: payload.height || null,
			publicId: payload.public_id || "",
			src: payload.secure_url,
			width: payload.width || null,
		},
	});
};

const handleDelete = async (request, response) => {
	const { apiKey, apiSecret, cloudName } = getCloudinaryConfig();
	const publicId = String(request.query?.publicId || "").trim();

	if (!publicId) {
		return sendJson(response, 400, { error: "Missing image public id." });
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const deleteParams = {
		invalidate: true,
		public_id: publicId,
		timestamp,
	};
	const signature = signCloudinaryParams(deleteParams, apiSecret);
	const formData = new FormData();

	formData.set("api_key", apiKey);
	formData.set("invalidate", "true");
	formData.set("public_id", publicId);
	formData.set("timestamp", String(timestamp));
	formData.set("signature", signature);

	const deleteResponse = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
		{
			method: "POST",
			body: formData,
		},
	);
	const payload = await deleteResponse.json().catch(() => ({}));

	if (!deleteResponse.ok || payload.result === "error") {
		return sendJson(response, deleteResponse.status || 500, {
			error: payload.error?.message || "Cloudinary delete failed.",
		});
	}

	return sendJson(response, 200, {
		publicId,
		result: payload.result || "ok",
	});
};

export default async function handler(request, response) {
	try {
		if (!["POST", "DELETE"].includes(request.method)) {
			response.setHeader("Allow", "POST, DELETE");
			return sendJson(response, 405, { error: "Method not allowed" });
		}

		if (!isAdminSessionValid(request)) {
			return sendJson(response, 401, { error: "Unauthorized." });
		}

		if (request.method === "DELETE") {
			return handleDelete(request, response);
		}

		return handleUpload(request, response);
	} catch (error) {
		return sendJson(response, 500, {
			error: error.message || "Unable to process image.",
		});
	}
}
