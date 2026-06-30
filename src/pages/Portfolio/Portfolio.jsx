import { useEffect, useState } from "react";
import {
	ArrowUp,
	Bookmark,
	Database,
	Layout,
	PenLine,
	Server,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../../components/layout/Container/Container";
import { Grid } from "../../components/layout/Grid/Grid";
import { Navigation } from "../../components/layout/Navigation/Navigation";
import { Section } from "../../components/layout/Section/Section";
import { Masthead } from "../../components/Masthead/Masthead";
import Typography from "../../components/ui/Typography/Typography";
import { Divider } from "../../components/layout/Divider/Divider";
import { ArticleCard } from "../../components/ArticleCard/ArticleCard";
import { Glossary } from "../../components/Glossary/Glossary";
import { Footer } from "../../components/layout/Footer/Footer";
import { LeadStory } from "../../components/LeadStory/LeadStory";
import { Button } from "../../components/ui/Button/Button";
import { listBlogPosts } from "../../data/blogApi";
import { listProjects } from "../../data/projectApi";
import { getSiteSettings } from "../../data/siteSettingsApi";
import { normalizeProject } from "../../data/projects";
import { useAdminSession } from "../../hooks/useAdminSession";
import "./Portfolio.css";

const BlogArticleSkeleton = () => (
	<article className="blog-page__skeleton" aria-hidden="true">
		<div className="blog-page__skeleton-media"></div>
		<div className="blog-page__skeleton-line blog-page__skeleton-line--title"></div>
		<div className="blog-page__skeleton-line"></div>
		<div className="blog-page__skeleton-line blog-page__skeleton-line--short"></div>
		<div className="blog-page__skeleton-tags">
			<div className="blog-page__skeleton-tag"></div>
			<div className="blog-page__skeleton-tag"></div>
			<div className="blog-page__skeleton-tag"></div>
		</div>
		<div className="blog-page__skeleton-line blog-page__skeleton-line--cta"></div>
	</article>
);

const projectIconMap = {
	database: Database,
	layout: Layout,
	server: Server,
};

const getProjectTimestamp = (project) => {
	const timestamp = Date.parse(project.updatedAt || project.createdAt || "");
	return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortProjectsByLatest = (projects) =>
	[...projects].sort(
		(left, right) => getProjectTimestamp(right) - getProjectTimestamp(left),
	);

export const Portfolio = () => {
	const currentDate = new Date().toLocaleDateString("en-GB", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const [featuredBlogPosts, setFeaturedBlogPosts] = useState([]);
	const [isLoadingBlogPosts, setIsLoadingBlogPosts] = useState(true);
	const [featuredProjects, setFeaturedProjects] = useState([]);
	const [latestProject, setLatestProject] = useState(null);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [currentBook, setCurrentBook] = useState(null);
	const [isLoadingSiteSettings, setIsLoadingSiteSettings] = useState(true);
	const [showScrollTop, setShowScrollTop] = useState(false);
	const { isAdmin } = useAdminSession();

	useEffect(() => {
		const updateScrollTopVisibility = () => {
			setShowScrollTop(window.scrollY > window.innerHeight * 1.15);
		};

		window.addEventListener("scroll", updateScrollTopVisibility, {
			passive: true,
		});
		updateScrollTopVisibility();

		return () => {
			window.removeEventListener("scroll", updateScrollTopVisibility);
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		listBlogPosts()
			.then(({ posts }) => {
				if (isMounted) {
					setFeaturedBlogPosts(posts.slice(0, 2));
					setIsLoadingBlogPosts(false);
				}
			})
			.catch(() => {
				if (isMounted) {
					setFeaturedBlogPosts([]);
					setIsLoadingBlogPosts(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		listProjects()
			.then(({ projects }) => {
				if (!isMounted) {
					return;
				}

				const nextProjects = Array.isArray(projects)
					? sortProjectsByLatest(projects.map(normalizeProject))
					: [];
				setLatestProject(nextProjects[0] || null);
				setFeaturedProjects(nextProjects.slice(0, 2));
				setIsLoadingProjects(false);
			})
			.catch(() => {
				if (isMounted) {
					setLatestProject(null);
					setFeaturedProjects([]);
					setIsLoadingProjects(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let isMounted = true;
		getSiteSettings()
			.then(({ settings }) => {
				if (!isMounted) {
					return;
				}

				const book = settings.currentBook;
				setCurrentBook(book?.title ? book : null);
				setIsLoadingSiteSettings(false);
			})
			.catch(() => {
				if (isMounted) {
					setCurrentBook(null);
					setIsLoadingSiteSettings(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const LatestProjectIcon = latestProject
		? projectIconMap[latestProject.icon] || Layout
		: Layout;

	return (
		<div className="portfolio">
			<Section variant="main">
				<Masthead
					title="The Folio."
					volume="Vol. MMXXVI"
					date={currentDate}
					location="Birmingham, UK"
				/>
				<Container>
					<Grid>
						<Navigation />

						<LeadStory
							headline="Engineering the Web, One Line at a Time."
							ctaLink="#projects"
							ctaText="Continue to Volume II"
							imageSrc="/images/portfolio-portrait.jpg"
							imageAlt="A portrait of Daniel Adenusi, a graduate Computer Science student."
						>
							am Daniel Adenusi, a graduate Computer Science
							student focused on software engineering and web
							development. I build polished, user-centred web
							experiences with thoughtful architecture, reliable
							data flows, and an eye for the small details that
							make products feel clear.
						</LeadStory>

						<aside className="portfolio-sidebar">
							<div>
								<Typography
									as="h3"
									variant="subheading"
									className="portfolio-widget-heading widget__header widget__header--alt"
								>
									<Bookmark /> Currently Reading
								</Typography>
								{isLoadingSiteSettings ? (
									<div className="portfolio-project-empty">
										Loading reading note...
									</div>
								) : currentBook ? (
									<a
										href={currentBook.link || undefined}
										className={`portfolio-reading-card${
											currentBook.link
												? " is-clickable"
												: ""
										}`}
										target={
											currentBook.link
												? "_blank"
												: undefined
										}
										rel={
											currentBook.link
												? "noopener noreferrer"
												: undefined
										}
										aria-disabled={
											currentBook.link
												? undefined
												: "true"
										}
									>
										{currentBook.coverUrl ? (
											<img
												src={currentBook.coverUrl}
												alt={`Cover of ${currentBook.title}`}
												className="portfolio-reading-card__cover"
											/>
										) : (
											<div className="portfolio-reading-card__cover portfolio-reading-card__cover--empty">
												<Bookmark />
											</div>
										)}
										<div>
											<Typography
												as="h4"
												variant="display"
												className="portfolio-reading-card__title widget-title-hover"
											>
												{currentBook.title}
											</Typography>
											{currentBook.author ? (
												<Typography
													variant="muted"
													className="portfolio-reading-card__author"
												>
													{currentBook.author}
												</Typography>
											) : null}
										</div>
									</a>
								) : (
									<div className="portfolio-project-empty">
										No reading note has been added yet.
									</div>
								)}
								{isAdmin ? (
									<div className="portfolio-reading-actions">
										<Button
											href="/home/admin"
											variant="outline"
										>
											Manage Reading
										</Button>
									</div>
								) : null}
							</div>

							<Divider className="typography-hidden" />

							<div>
								<Typography
									as="h3"
									variant="subheading"
									className="portfolio-widget-heading widget__header widget__header--alt"
								>
									Latest Project
								</Typography>
								{isLoadingProjects ? (
									<div className="portfolio-project-empty">
										Loading latest project...
									</div>
								) : latestProject ? (
									<Link
										to={`/projects/${latestProject.id}`}
										className="portfolio-reading-card portfolio-project-card is-clickable"
									>
										<div className="portfolio-reading-card__cover portfolio-project-card__media">
											{latestProject.media[0]?.src ? (
												<img
													src={
														latestProject.media[0]
															.src
													}
													alt={
														latestProject.media[0]
															.alt ||
														latestProject.title
													}
												/>
											) : (
												<LatestProjectIcon />
											)}
										</div>
										<div>
											<Typography
												as="h4"
												variant="display"
												className="portfolio-reading-card__title portfolio-project-widget__title widget-title-hover"
											>
												{latestProject.title}
											</Typography>
											<Typography
												variant="muted"
												className="portfolio-project-widget__excerpt"
											>
												{latestProject.excerpt}
											</Typography>
										</div>
									</Link>
								) : (
									<div className="portfolio-project-empty">
										No projects have been added yet.
									</div>
								)}
							</div>
						</aside>
					</Grid>
				</Container>
			</Section>

			<Section id="projects" variant="projects">
				<Container>
					<div className="volume-header">
						<Typography
							variant="subheading"
							className="volume-header__kicker"
						>
							Volume II
						</Typography>
						<Typography
							as="h3"
							variant="heading-2"
							className="typography-uppercase"
						>
							Architecture & Systems.
						</Typography>
						<div className="volume-header__actions">
							<Button href="/projects" variant="outline">
								Browse All Projects
							</Button>
						</div>
					</div>

					<Grid className="grid--article">
						{isLoadingProjects ? (
							<BlogArticleSkeleton />
						) : featuredProjects.length ? (
							featuredProjects.map((project) => {
								const Icon =
									projectIconMap[project.icon] || Layout;

								return (
									<ArticleCard
										key={project.id}
										Icon={Icon}
										image={project.media[0]}
										title={project.title}
										excerpt={project.excerpt}
										tags={project.tags}
										link={`/projects/${project.id}`}
									/>
								);
							})
						) : (
							<div className="portfolio-project-empty portfolio-project-empty--wide">
								No projects have been added yet. Come back soon
								to see the latest work in my portfolio.
							</div>
						)}
					</Grid>
				</Container>
			</Section>

			<Section id="blog" variant="projects">
				<Container>
					<div className="volume-header">
						<Typography
							variant="subheading"
							className="volume-header__kicker"
						>
							Volume III
						</Typography>
						<Typography
							as="h3"
							variant="heading-2"
							className="typography-uppercase"
						>
							Writing Desk.
						</Typography>
						<div className="volume-header__actions">
							<Button href="/blog" variant="outline">
								Browse All Articles
							</Button>
						</div>
					</div>

					<Grid className="grid--article">
						{isLoadingBlogPosts ? (
							<BlogArticleSkeleton />
						) : featuredBlogPosts.length ? (
							featuredBlogPosts.map((post) => (
								<ArticleCard
									key={post.id}
									Icon={PenLine}
									title={post.title}
									excerpt={post.excerpt}
									tags={post.tags}
									link={`/blog/${post.id}`}
									ctaText="Read Article"
								/>
							))
						) : (
							<div className="portfolio-project-empty portfolio-project-empty--wide">
								No articles have been published yet. Come back
								soon to read the latest insights and musings
								from my writing desk.
							</div>
						)}
					</Grid>
				</Container>
			</Section>

			<Glossary />

			<Footer />

			<Button
				type="button"
				variant="icon"
				className={`portfolio-scroll-top${
					showScrollTop ? " portfolio-scroll-top--visible" : ""
				}`}
				onClick={() => {
					window.scrollTo({
						top: 0,
						behavior: window.matchMedia(
							"(prefers-reduced-motion: reduce)",
						).matches
							? "auto"
							: "smooth",
					});
				}}
				aria-label="Scroll back to top"
				title="Scroll back to top"
			>
				<ArrowUp className="portfolio-scroll-top__icon" />
			</Button>
		</div>
	);
};
