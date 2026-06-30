import { useEffect, useState } from "react";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Database,
	Layout,
	Server,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { Container } from "../../components/layout/Container/Container";
import { Footer } from "../../components/layout/Footer/Footer";
import { Section } from "../../components/layout/Section/Section";
import Tag from "../../components/ui/Tag/Tag";
import Typography from "../../components/ui/Typography/Typography";
import { getProject } from "../../data/projectApi";
import { getProjectById, normalizeProject } from "../../data/projects";
import "./ProjectDetail.css";

const iconMap = {
	database: Database,
	layout: Layout,
	server: Server,
};

export const ProjectDetail = () => {
	const { projectId } = useParams();
	const [project, setProject] = useState(() =>
		getProjectById(projectId || ""),
	);
	const [activeMediaIndex, setActiveMediaIndex] = useState(0);

	useEffect(() => {
		let isMounted = true;

		getProject(projectId || "")
			.then(({ project }) => {
				if (isMounted) {
					setProject(project ? normalizeProject(project) : null);
					setActiveMediaIndex(0);
				}
			})
			.catch(() => {
				if (isMounted) {
					setProject(getProjectById(projectId || "") || null);
					setActiveMediaIndex(0);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [projectId]);

	if (!project) {
		return (
			<div className="project-detail-page">
				<Section
					variant="projects"
					className="project-detail-page__section"
				>
					<Container>
						<div className="project-detail-page__not-found">
							<Typography as="h1" variant="heading-2">
								Project not found.
							</Typography>
							<Typography variant="muted">
								The requested project entry does not exist in
								the catalogue.
							</Typography>
							<Link
								to="/projects"
								className="project-detail-page__back-link"
							>
								<ArrowLeft />
								Back to All Projects
							</Link>
						</div>
					</Container>
				</Section>
				<Footer />
			</div>
		);
	}

	const Icon = iconMap[project.icon] || Layout;
	const media = project.media || [];
	const activeMedia = media[activeMediaIndex] || null;
	const chapters = [
		project.technologies.length
			? { id: "technologies", title: "Technologies" }
			: null,
		project.challenge ? { id: "challenge", title: "Challenge" } : null,
		project.solution
			? { id: "implementation", title: "Implementation" }
			: null,
		project.impact ? { id: "impact", title: "Impact" } : null,
		project.highlights.length
			? { id: "highlights", title: "Key Highlights" }
			: null,
	].filter(Boolean);

	const changeMedia = (direction) => {
		if (!media.length) {
			return;
		}

		setActiveMediaIndex(
			(current) => (current + direction + media.length) % media.length,
		);
	};

	return (
		<div className="project-detail-page">
			<Section
				variant="projects"
				className="project-detail-page__section"
			>
				<Container>
					<article className="project-detail-page__content">
						<Link
							to="/projects"
							className="project-detail-page__back-link"
						>
							<ArrowLeft />
							Back to All Projects
						</Link>

						{activeMedia ? (
							<figure className="project-detail-page__carousel">
								<img
									src={activeMedia.src}
									alt={activeMedia.alt || project.title}
								/>
								{media.length > 1 ? (
									<div className="project-detail-page__carousel-controls">
										<Button
											type="button"
											variant="icon"
											onClick={() => changeMedia(-1)}
											aria-label="Previous project media"
										>
											<ChevronLeft />
										</Button>
										<span>
											{activeMediaIndex + 1} /{" "}
											{media.length}
										</span>
										<Button
											type="button"
											variant="icon"
											onClick={() => changeMedia(1)}
											aria-label="Next project media"
										>
											<ChevronRight />
										</Button>
									</div>
								) : null}
								{activeMedia.alt ? (
									<figcaption>{activeMedia.alt}</figcaption>
								) : null}
							</figure>
						) : null}

						<header className="project-detail-page__title-row">
							<div className="project-detail-page__icon-wrap">
								<Icon />
							</div>
							<div>
								<Typography variant="subheading">
									Expanded View
								</Typography>
								<Typography as="h1" variant="heading-2">
									{project.title}
								</Typography>
							</div>
						</header>

						<div className="project-detail-page__meta">
							<Tag className="tag--outline">{project.type}</Tag>
							<Tag className="tag--outline">
								{project.timeline}
							</Tag>
							{project.tags.map((tag) => (
								<Tag key={tag} className="tag--outline">
									{tag}
								</Tag>
							))}
						</div>

						<Typography
							variant="muted"
							className="project-detail-page__lead"
						>
							{project.excerpt}
						</Typography>

						<div className="project-detail-page__article-layout">
							<aside
								className="project-detail-page__toc"
								aria-label="Project chapters"
							>
								<span>Chapters</span>
								<ol>
									{chapters.map((chapter, index) => (
										<li key={chapter.id}>
											<a href={`#${chapter.id}`}>
												<small>
													{String(index + 1).padStart(
														2,
														"0",
													)}
												</small>
												{chapter.title}
											</a>
										</li>
									))}
								</ol>
							</aside>

							<div className="project-detail-page__body">
								{project.technologies.length ? (
									<section
										id="technologies"
										className="project-detail-page__technologies"
									>
										<Typography as="h2" variant="heading-3">
											Technologies
										</Typography>
										<ul>
											{project.technologies.map(
												(technology) => (
													<li key={technology.name}>
														<strong>
															{technology.name}
														</strong>
														<span>
															{technology.info}
														</span>
													</li>
												),
											)}
										</ul>
									</section>
								) : null}

								<div className="project-detail-page__sections">
									<section id="challenge">
										<Typography as="h2" variant="heading-3">
											Challenge
										</Typography>
										<Typography variant="body">
											{project.challenge}
										</Typography>
									</section>
									<section id="implementation">
										<Typography as="h2" variant="heading-3">
											Implementation
										</Typography>
										<Typography variant="body">
											{project.solution}
										</Typography>
									</section>
									<section id="impact">
										<Typography as="h2" variant="heading-3">
											Impact
										</Typography>
										<Typography variant="body">
											{project.impact}
										</Typography>
									</section>
								</div>

								<div id="highlights">
									<Typography as="h2" variant="heading-3">
										Key Highlights
									</Typography>
									<ul className="project-detail-page__highlights">
										{project.highlights.map((highlight) => (
											<li key={highlight}>
												<Typography variant="body-sans">
													{highlight}
												</Typography>
											</li>
										))}
									</ul>
								</div>
							</div>
						</div>
					</article>
				</Container>
			</Section>
			<Footer />
		</div>
	);
};
