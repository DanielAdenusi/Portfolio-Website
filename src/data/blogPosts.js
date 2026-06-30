export const seedBlogPosts = [];

const readingWordsPerMinute = 225;
const averageWordLength = 5;

export const calculateReadTimeDetails = (content) => {
	const text = Array.isArray(content) ? content.join(" ") : content || "";
	const words = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) || [];

	if (words.length === 0) {
		return {
			averageWordLength: 0,
			minutes: 0,
			readTime: "0 min read",
			wordCount: 0,
		};
	}

	const totalLetters = words.reduce(
		(total, word) => total + word.replace(/[^A-Za-z0-9]/g, "").length,
		0,
	);
	const actualAverageWordLength = totalLetters / words.length;
	const wordLengthMultiplier = Math.min(
		1.35,
		Math.max(0.85, actualAverageWordLength / averageWordLength),
	);
	const adjustedWordCount = words.length * wordLengthMultiplier;
	const minutes = Math.max(
		1,
		Math.ceil(adjustedWordCount / readingWordsPerMinute),
	);

	return {
		averageWordLength: actualAverageWordLength,
		minutes,
		readTime: `${minutes} min read`,
		wordCount: words.length,
	};
};

export const calculateReadTime = (content) =>
	calculateReadTimeDetails(content).readTime;

export const normalizeBlogImages = (images) => {
	if (!Array.isArray(images)) {
		return [];
	}

	return images
		.map((image) => {
			if (typeof image === "string") {
				return {
					alt: "",
					src: image.trim(),
				};
			}

			return {
				alt: image?.alt?.trim() || "",
				bytes: image?.bytes || null,
				format: image?.format || "",
				height: image?.height || null,
				publicId: image?.publicId || image?.public_id || "",
				src: image?.src?.trim() || "",
				width: image?.width || null,
			};
		})
		.filter((image) => image.src);
};

export const normalizeBlogPost = (post) => ({
	...post,
	tags: Array.isArray(post.tags) ? post.tags : [],
	body: Array.isArray(post.body) ? post.body : [],
	images: normalizeBlogImages(post.images),
	readTime: post.readTime || calculateReadTime(post.body),
	published: post.published ?? true,
});

export const sortBlogPosts = (posts) =>
	[...posts].sort(
		(left, right) => new Date(right.date) - new Date(left.date),
	);

export const slugifyBlogTitle = (value) =>
	value
		.toLowerCase()
		.trim()
		.replace(/["']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const blogPosts = seedBlogPosts;
