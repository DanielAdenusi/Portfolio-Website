import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenText, CalendarDays, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Container } from "../../components/layout/Container/Container";
import { Footer } from "../../components/layout/Footer/Footer";
import { Section } from "../../components/layout/Section/Section";
import Tag from "../../components/ui/Tag/Tag";
import Typography from "../../components/ui/Typography/Typography";
import { getBlogPost } from "../../data/blogApi";
import "./BlogPost.css";

const generatedChapterTitles = [
	"Opening Notes",
	"The Main Thread",
	"Details Worth Keeping",
	"Closing Thoughts",
];

const BlogPostLoadingSkeleton = () => (
	<div
		className="blog-post-page__content blog-post-page__skeleton"
		role="status"
		aria-label="Loading article"
	>
		<div className="blog-post-page__skeleton-back"></div>
		<header className="blog-post-page__header">
			<div className="blog-post-page__skeleton-kicker"></div>
			<div className="blog-post-page__skeleton-title"></div>
			<div className="blog-post-page__skeleton-title blog-post-page__skeleton-title--short"></div>
		</header>
		<div className="blog-post-page__dek">
			<div className="blog-post-page__skeleton-line"></div>
			<div className="blog-post-page__skeleton-line blog-post-page__skeleton-line--wide"></div>
			<div className="blog-post-page__skeleton-meta">
				<div></div>
				<div></div>
				<div></div>
			</div>
			<div className="blog-post-page__skeleton-tags">
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>
		<div className="blog-post-page__skeleton-hero"></div>
		<div className="blog-post-page__article-layout">
			<aside className="blog-post-page__toc">
				<div className="blog-post-page__skeleton-kicker"></div>
				<div className="blog-post-page__skeleton-toc-line"></div>
				<div className="blog-post-page__skeleton-toc-line"></div>
				<div className="blog-post-page__skeleton-toc-line blog-post-page__skeleton-toc-line--short"></div>
			</aside>
			<article className="blog-post-page__body">
				<div className="blog-post-page__skeleton-heading"></div>
				<div className="blog-post-page__skeleton-line"></div>
				<div className="blog-post-page__skeleton-line blog-post-page__skeleton-line--wide"></div>
				<div className="blog-post-page__skeleton-line blog-post-page__skeleton-line--medium"></div>
				<div className="blog-post-page__skeleton-quote"></div>
				<div className="blog-post-page__skeleton-line blog-post-page__skeleton-line--wide"></div>
				<div className="blog-post-page__skeleton-line"></div>
			</article>
		</div>
	</div>
);

const slugifyHeading = (value) =>
	value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const createFigureBlock = (image, key, caption) =>
	image
		? {
				type: "figure",
				key,
				image,
				caption: caption || image.alt || "",
			}
		: null;

const parseBodyBlock = (block, index, images) => {
	const value = String(block || "").trim();

	if (!value) {
		return null;
	}

	const imageReference = value.match(/^\[image:(\d+)\](?:\s+(.+))?$/i);
	if (imageReference) {
		return createFigureBlock(
			images[Number(imageReference[1])],
			`image-reference-${index}`,
			imageReference[2],
		);
	}

	const markdownImage = value.match(/^!\[([^\]]*)\]\(([^)]+)\)(?:\s+(.+))?$/);
	if (markdownImage) {
		return createFigureBlock(
			{
				alt: markdownImage[1],
				src: markdownImage[2],
			},
			`markdown-image-${index}`,
			markdownImage[3],
		);
	}

	if (value.startsWith("### ")) {
		return {
			type: "subheading",
			key: `subheading-${index}`,
			text: value.replace(/^###\s+/, ""),
		};
	}

	if (value.startsWith("## ")) {
		const text = value.replace(/^##\s+/, "");

		return {
			type: "heading",
			key: `heading-${index}`,
			id: slugifyHeading(text) || `chapter-${index + 1}`,
			text,
		};
	}

	if (value.startsWith("> ")) {
		return {
			type: "quote",
			key: `quote-${index}`,
			text: value.replace(/^>\s?/, ""),
		};
	}

	if (/^-\s+/m.test(value)) {
		return {
			type: "list",
			key: `list-${index}`,
			items: value
				.split("\n")
				.map((item) => item.replace(/^-\s+/, "").trim())
				.filter(Boolean),
		};
	}

	return {
		type: "paragraph",
		key: `paragraph-${index}`,
		text: value,
	};
};

const buildArticleBlocks = (post, images) => {
	const body = Array.isArray(post?.body) ? post.body : [];
	const parsedBlocks = body
		.map((block, index) => parseBodyBlock(block, index, images))
		.filter(Boolean);
	const hasAuthoredHeadings = parsedBlocks.some(
		(block) => block.type === "heading",
	);
	const hasAuthoredImages = parsedBlocks.some(
		(block) => block.type === "figure",
	);
	const inlineImages = hasAuthoredImages ? [] : images.slice(1);
	let nextInlineImageIndex = 0;
	let paragraphCount = 0;

	if (hasAuthoredHeadings) {
		return parsedBlocks;
	}

	return parsedBlocks.flatMap((block, index) => {
		const nextBlocks = [];
		const shouldStartChapter =
			block.type === "paragraph" &&
			(paragraphCount === 0 || paragraphCount % 2 === 0);

		if (shouldStartChapter) {
			const chapterIndex = Math.floor(paragraphCount / 2);
			const title =
				generatedChapterTitles[chapterIndex] ||
				`Chapter ${chapterIndex + 1}`;

			nextBlocks.push({
				type: "heading",
				key: `generated-heading-${index}`,
				id: slugifyHeading(title),
				text: title,
			});
		}

		nextBlocks.push(block);

		if (block.type === "paragraph") {
			paragraphCount += 1;

			if (
				paragraphCount % 2 === 0 &&
				nextInlineImageIndex < inlineImages.length
			) {
				const image = inlineImages[nextInlineImageIndex];
				nextBlocks.push({
					type: "figure",
					key: `inline-image-${nextInlineImageIndex}`,
					image,
					caption: image.alt || post.title,
				});
				nextInlineImageIndex += 1;
			}
		}

		return nextBlocks;
	});
};

const getChapters = (blocks) =>
	blocks
		.filter((block) => block.type === "heading")
		.map((block, index) => ({
			...block,
			label: String(index + 1).padStart(2, "0"),
		}));

const renderArticleBlock = (block) => {
	switch (block.type) {
		case "heading":
			return (
				<h2
					id={block.id}
					key={block.key}
					className="blog-post-page__chapter-heading"
				>
					{block.text}
				</h2>
			);
		case "subheading":
			return (
				<h3 key={block.key} className="blog-post-page__subheading">
					{block.text}
				</h3>
			);
		case "quote":
			return (
				<blockquote key={block.key} className="blog-post-page__quote">
					<p>{block.text}</p>
				</blockquote>
			);
		case "list":
			return (
				<ul key={block.key} className="blog-post-page__list">
					{block.items.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ul>
			);
		case "figure":
			return (
				<figure key={block.key} className="blog-post-page__figure">
					<img
						src={block.image.src}
						alt={block.image.alt || block.caption || ""}
						loading="lazy"
					/>
					{block.caption ? (
						<figcaption>{block.caption}</figcaption>
					) : null}
				</figure>
			);
		default:
			return <p key={block.key}>{block.text}</p>;
	}
};

export const BlogPost = () => {
	const { postId } = useParams();
	const [post, setPost] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!postId) {
			setIsLoading(false);
			return undefined;
		}

		let isMounted = true;
		setIsLoading(true);
		getBlogPost(postId)
			.then(({ post: postResponse }) => {
				if (isMounted) {
					setPost(postResponse || null);
				}
			})
			.catch(() => {
				if (isMounted) {
					setPost(null);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [postId]);

	if (isLoading) {
		return (
			<div className="blog-post-page">
				<Section variant="projects" className="blog-post-page__section">
					<Container>
						<BlogPostLoadingSkeleton />
					</Container>
				</Section>
				<Footer />
			</div>
		);
	}

	if (!post || post.published === false) {
		return (
			<div className="blog-post-page">
				<Section variant="projects" className="blog-post-page__section">
					<Container>
						<div className="blog-post-page__not-found">
							<Typography as="h1" variant="heading-2">
								Article not found.
							</Typography>
							<Typography variant="muted">
								The requested article does not exist in the blog
								archive.
							</Typography>
							<Link
								to="/blog"
								className="blog-post-page__back-link"
							>
								<ArrowLeft />
								Back to Blog
							</Link>
						</div>
					</Container>
				</Section>
				<Footer />
			</div>
		);
	}

	const images = Array.isArray(post.images) ? post.images : [];
	const heroImage = images[0];
	const articleBlocks = buildArticleBlocks(post, images);
	const chapters = getChapters(articleBlocks);

	return (
		<div className="blog-post-page">
			<Section variant="projects" className="blog-post-page__section">
				<Container>
					<div className="blog-post-page__content">
						<Link to="/blog" className="blog-post-page__back-link">
							<ArrowLeft />
							Back to Blog
						</Link>

						<header className="blog-post-page__header">
							<Typography variant="subheading">
								Writing Desk
							</Typography>
							<Typography as="h1" variant="heading-2">
								{post.title}
							</Typography>
						</header>

						<div className="blog-post-page__dek">
							<Typography
								variant="muted"
								className="blog-post-page__lead"
							>
								{post.excerpt}
							</Typography>

							<div className="blog-post-page__meta">
								<div className="blog-post-page__meta-item">
									<CalendarDays />
									<span>
										{new Date(post.date).toLocaleDateString(
											"en-GB",
											{
												day: "numeric",
												month: "long",
												year: "numeric",
											},
										)}
									</span>
								</div>
								<div className="blog-post-page__meta-item">
									<Clock3 />
									<span>{post.readTime}</span>
								</div>
								<div className="blog-post-page__meta-item">
									<BookOpenText />
									<span>{chapters.length} chapters</span>
								</div>
							</div>

							<div className="blog-post-page__tags">
								{post.tags.map((tag) => (
									<Tag key={tag} className="tag--outline">
										{tag}
									</Tag>
								))}
							</div>
						</div>

						{heroImage ? (
							<figure className="blog-post-page__hero-figure">
								<div className="blog-post-page__hero-image-wrap">
									<img
										src={heroImage.src}
										alt={heroImage.alt || post.title}
										className="blog-post-page__hero-image"
									/>
								</div>
								{heroImage.alt ? (
									<figcaption>{heroImage.alt}</figcaption>
								) : null}
							</figure>
						) : null}

						<div className="blog-post-page__article-layout">
							{chapters.length ? (
								<aside
									className="blog-post-page__toc"
									aria-label="Article chapters"
								>
									<span>Chapters</span>
									<ol>
										{chapters.map((chapter) => (
											<li key={chapter.key}>
												<a href={`#${chapter.id}`}>
													<small>
														{chapter.label}
													</small>
													{chapter.text}
												</a>
											</li>
										))}
									</ol>
								</aside>
							) : null}

							<article className="blog-post-page__body">
								{articleBlocks.map(renderArticleBlock)}
							</article>
						</div>
					</div>
				</Container>
			</Section>
			<Footer />
		</div>
	);
};
