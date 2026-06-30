import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Database, Layout, Server } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "../../components/layout/Container/Container";
import { Footer } from "../../components/layout/Footer/Footer";
import { Section } from "../../components/layout/Section/Section";
import { Button } from "../../components/ui/Button/Button";
import Tag from "../../components/ui/Tag/Tag";
import Typography from "../../components/ui/Typography/Typography";
import { listProjects } from "../../data/projectApi";
import { useAdminSession } from "../../hooks/useAdminSession";
import {
	normalizeProject,
	projects as seedProjects,
} from "../../data/projects";
import "./Projects.css";

const iconMap = {
	database: Database,
	layout: Layout,
	server: Server,
};

const ProjectCardSkeleton = () => (
	<article className="projects-page__skeleton" aria-hidden="true">
		<div className="projects-page__skeleton-media"></div>
		<div className="projects-page__skeleton-body">
			<div className="projects-page__skeleton-meta"></div>
			<div className="projects-page__skeleton-title"></div>
			<div className="projects-page__skeleton-line"></div>
			<div className="projects-page__skeleton-line projects-page__skeleton-line--short"></div>
			<div className="projects-page__skeleton-tags">
				<div></div>
				<div></div>
				<div></div>
			</div>
			<div className="projects-page__skeleton-cta"></div>
		</div>
	</article>
);

export const Projects = () => {
	const [projectList, setProjectList] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { isAdmin } = useAdminSession();

	useEffect(() => {
		let isMounted = true;

		listProjects()
			.then(({ projects }) => {
				if (isMounted && Array.isArray(projects)) {
					setProjectList(projects.map(normalizeProject));
				}
			})
			.catch(() => {
				if (isMounted) {
					setProjectList(seedProjects.map(normalizeProject));
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
	}, []);

	return (
		<div className="projects-page">
			<Section variant="projects" className="projects-page__section">
				<Container>
					<div className="projects-page__header">
						<Link
							to="/#projects"
							className="projects-page__back-link"
						>
							<ArrowLeft />
							Back to Portfolio
						</Link>
						<Typography as="h1" variant="heading-2">
							All Projects.
						</Typography>
						<Typography
							variant="muted"
							className="projects-page__intro"
						>
							A complete archive of case studies, system
							decisions, and implementation stories.
						</Typography>
						{isAdmin ? (
							<div className="projects-page__header-actions">
								<Button
									href="/projects/admin"
									variant="outline"
								>
									Manage Projects
								</Button>
							</div>
						) : null}
					</div>

					<div className="projects-page__grid">
						{isLoading ? (
							<>
								<span className="sr-only">
									Loading projects...
								</span>
								{Array.from({ length: 3 }, (_, index) => (
									<ProjectCardSkeleton key={index} />
								))}
							</>
						) : projectList.length ? (
							projectList.map((project) => (
								<article
									key={project.id}
									className="projects-page__card"
								>
									<div className="projects-page__card-media">
										{project.media[0]?.src ? (
											<img
												src={project.media[0].src}
												alt={
													project.media[0].alt ||
													project.title
												}
												loading="lazy"
											/>
										) : (
											(() => {
												const Icon =
													iconMap[project.icon] ||
													Layout;
												return <Icon />;
											})()
										)}
									</div>
									<div className="projects-page__card-body">
										<div className="projects-page__card-meta">
											<span>
												{project.type || "Project"}
											</span>
											<span>{project.timeline}</span>
										</div>
										<h2>{project.title}</h2>
										<p>{project.excerpt}</p>
										<div className="projects-page__card-tags">
											{project.tags.map((tag) => (
												<Tag
													key={tag}
													className="tag--outline"
												>
													{tag}
												</Tag>
											))}
										</div>
										<Link
											to={`/projects/${project.id}`}
											className="projects-page__card-link"
										>
											Read case study
											<ArrowRight />
										</Link>
									</div>
								</article>
							))
						) : (
							<div className="projects-page__empty">
								<strong>No projects yet</strong>
								<span>
									There are currently no projects available.
									Please check back later for updates.
								</span>
							</div>
						)}
					</div>
				</Container>
			</Section>
			<Footer />
		</div>
	);
};
