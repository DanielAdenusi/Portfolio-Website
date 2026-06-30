import fs from "fs";
import path from "path";

let localEnv;

const parseEnvFile = (contents) =>
	contents.split(/\r?\n/).reduce((env, line) => {
		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith("#")) {
			return env;
		}

		const separatorIndex = trimmedLine.indexOf("=");
		if (separatorIndex === -1) {
			return env;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
		const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");

		return {
			...env,
			[key]: value,
		};
	}, {});

const readLocalEnvFile = (fileName) => {
	try {
		const envPath = path.join(process.cwd(), fileName);
		return parseEnvFile(fs.readFileSync(envPath, "utf8"));
	} catch {
		return {};
	}
};

const readLocalEnv = () => {
	if (localEnv) {
		return localEnv;
	}

	localEnv = {
		...readLocalEnvFile(".env"),
		...readLocalEnvFile(".env.local"),
	};

	return localEnv;
};

export const getServerEnv = (name) => process.env[name] || readLocalEnv()[name];

export const isVercel = () => Boolean(process.env.VERCEL);
