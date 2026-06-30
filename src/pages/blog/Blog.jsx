import { useEffect, useState } from "react";
import { ArrowLeft, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { ArticleCard } from "../../components/ArticleCard/ArticleCard";
import { Container } from "../../components/layout/Container/Container";
import { Footer } from "../../components/layout/Footer/Footer";
import { Section } from "../../components/layout/Section/Section";
import Typography from "../../components/ui/Typography/Typography";
import { Button } from "../../components/ui/Button/Button";
import { listBlogPosts } from "../../data/blogApi";
import { useAdminSession } from "../../hooks/useAdminSession";
import "./Blog.css";

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

export const Blog = () => {
	const [blogPosts, setBlogPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { isAdmin } = useAdminSession();

	useEffect(() => {
		let isMounted = true;
		listBlogPosts()
			.then(({ posts }) => {
				if (isMounted) {
					setBlogPosts(posts);
				}
			})
			.catch(() => {
				if (isMounted) {
					setBlogPosts([]);
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
		<div className="blog-page">
			<Section variant="projects" className="blog-page__section">
				<Container>
					<div className="blog-page__header">
						<Link to="/#blog" className="blog-page__back-link">
							<ArrowLeft />
							Back to Portfolio
						</Link>
						<Typography as="h1" variant="heading-2">
							Blog.
						</Typography>
						<Typography
							variant="muted"
							className="blog-page__intro"
						>
							An evolving notebook for design thoughts, build
							notes, and technical essays.
						</Typography>
						{isAdmin ? (
							<div className="blog-page__admin-actions">
								<Button href="/blog/admin" variant="outline">
									Manage Posts
								</Button>
							</div>
						) : null}
					</div>

					<div className="blog-page__grid">
						{isLoading ? (
							<>
								<span className="sr-only">
									Loading articles...
								</span>
								{Array.from({ length: 4 }, (_, index) => (
									<BlogArticleSkeleton key={index} />
								))}
							</>
						) : blogPosts.length ? (
							blogPosts.map((post) => (
								<ArticleCard
									key={post.id}
									Icon={PenLine}
									title={post.title}
									excerpt={post.excerpt}
									tags={post.tags}
									image={post.images?.[0]}
									link={`/blog/${post.id}`}
									ctaText="Read Article"
								/>
							))
						) : (
							<div className="blog-page__empty">
								<strong>No articles yet</strong>
								<span>
									There are currently no articles available.
									Please check back later for updates and new
									content.
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
