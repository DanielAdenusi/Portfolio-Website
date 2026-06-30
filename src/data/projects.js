export const projects = [];

export const normalizeProjectMedia = (media) => {
	if (!Array.isArray(media)) {
		return [];
	}

	return media
		.map((item) => {
			if (typeof item === "string") {
				return {
					alt: "",
					publicId: "",
					src: item.trim(),
				};
			}

			return {
				alt: item?.alt?.trim() || "",
				bytes: item?.bytes || null,
				fileName: item?.fileName || "",
				format: item?.format || "",
				height: item?.height || null,
				publicId: item?.publicId || item?.public_id || "",
				src: item?.src?.trim() || "",
				width: item?.width || null,
			};
		})
		.filter((item) => item.src);
};

export const normalizeTechnologies = (technologies, tags = []) => {
	if (Array.isArray(technologies) && technologies.length) {
		return technologies
			.map((technology) => {
				if (typeof technology === "string") {
					return {
						info: "",
						name: technology.trim(),
					};
				}

				return {
					info: technology?.info?.trim() || "",
					name: technology?.name?.trim() || "",
				};
			})
			.filter((technology) => technology.name);
	}

	return (Array.isArray(tags) ? tags : [])
		.map((tag) => ({
			info: "",
			name: String(tag || "").trim(),
		}))
		.filter((technology) => technology.name);
};

export const normalizeProject = (project) => ({
	...project,
	challenge: project?.challenge?.trim() || "",
	excerpt: project?.excerpt?.trim() || "",
	highlights: Array.isArray(project?.highlights) ? project.highlights : [],
	icon: project?.icon || "layout",
	id: project?.id || slugifyProjectTitle(project?.title || ""),
	impact: project?.impact?.trim() || "",
	media: normalizeProjectMedia(project?.media),
	solution: project?.solution?.trim() || "",
	tags: Array.isArray(project?.tags) ? project.tags : [],
	technologies: normalizeTechnologies(project?.technologies, project?.tags),
	timeline: project?.timeline?.trim() || "",
	title: project?.title?.trim() || "",
	type: project?.type?.trim() || "",
});

export const sortProjects = (items) =>
	[...items].sort((left, right) => left.title.localeCompare(right.title));

export const slugifyProjectTitle = (value) =>
	String(value || "")
		.toLowerCase()
		.trim()
		.replace(/["']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const getProjectById = (projectId) =>
	projects.map(normalizeProject).find((project) => project.id === projectId);
