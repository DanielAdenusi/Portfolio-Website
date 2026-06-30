import { ArrowRight } from "lucide-react";
import PropTypes from "prop-types";
import Tag from "../ui/Tag/Tag";
import { Button } from "../ui/Button/Button";
import { Typography } from "../ui/Typography/Typography";
import "./ArticleCard.css";

export const ArticleCard = ({
	Icon,
	image,
	title,
	excerpt,
	tags = [],
	link,
	ctaText = "Read Full Case Study",
}) => (
	<article className="article">
		<div className="article__media">
			{image?.src ? (
				<img
					src={image.src}
					alt={image.alt || title}
					className="article__media-image"
					loading="lazy"
				/>
			) : (
				Icon && <Icon className="article__media-icon" />
			)}
		</div>
		<Typography
			as="h4"
			variant="heading-3"
			className="article__title"
		>
			{title}
		</Typography>
		<Typography
			variant="muted"
			className="article__excerpt"
		>
			{excerpt}
		</Typography>
		{tags.length ? (
			<div className="article__tags">
				{tags.map((tag) => (
					<Tag key={tag} className="tag--outline">
						{tag}
					</Tag>
				))}
			</div>
		) : null}
		<Button href={link} variant="text" className="article__cta">
			{ctaText}
			<ArrowRight />
		</Button>
	</article>
);

ArticleCard.propTypes = {
	Icon: PropTypes.elementType,
	image: PropTypes.shape({
		alt: PropTypes.string,
		src: PropTypes.string.isRequired,
	}),
	title: PropTypes.string.isRequired,
	excerpt: PropTypes.string,
	tags: PropTypes.arrayOf(PropTypes.string),
	link: PropTypes.string,
	ctaText: PropTypes.string,
};
