import crypto from "crypto";
import { getServerEnv, isVercel } from "./_env.js";

const cookieName = "portfolio_blog_admin";

const parseCookieHeader = (cookieHeader = "") =>
	cookieHeader.split(";").reduce((accumulator, part) => {
		const [rawKey, ...rawValueParts] = part.trim().split("=");
		if (!rawKey) {
			return accumulator;
		}

		accumulator[rawKey] = rawValueParts.join("=");
		return accumulator;
	}, {});

const createSignature = (password, expiry) =>
	crypto.createHmac("sha256", password).update(String(expiry)).digest("hex");

const cookieOptions = () => {
	const secureAttribute = isVercel() ? "Secure; " : "";
	return `Path=/; HttpOnly; SameSite=Strict; ${secureAttribute}`;
};

export const setAdminCookie = (response, value, maxAgeSeconds) => {
	response.setHeader(
		"Set-Cookie",
		`${cookieName}=${value}; ${cookieOptions()}Max-Age=${maxAgeSeconds};`,
	);
};

export const clearAdminCookie = (response) => {
	response.setHeader(
		"Set-Cookie",
		`${cookieName}=; ${cookieOptions()}Max-Age=0;`,
	);
};

export const isAdminSessionValid = (request) => {
	const adminPassword = getServerEnv("BLOG_ADMIN_PASSWORD");
	if (!adminPassword) {
		return false;
	}

	const cookies = parseCookieHeader(request.headers.cookie || "");
	const token = cookies[cookieName];
	if (!token) {
		return false;
	}

	const [expiryText, signature] = token.split(".");
	const expiry = Number(expiryText);
	if (!expiry || Number.isNaN(expiry) || expiry < Date.now()) {
		return false;
	}

	const expectedSignature = createSignature(adminPassword, expiry);
	return signature === expectedSignature;
};

export const createAdminCookieValue = (expiry) => {
	const adminPassword = getServerEnv("BLOG_ADMIN_PASSWORD") || "";
	const signature = createSignature(adminPassword, expiry);
	return `${expiry}.${signature}`;
};
