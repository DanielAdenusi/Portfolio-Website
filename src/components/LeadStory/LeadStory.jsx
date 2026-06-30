import PropTypes from "prop-types";
import Tag from "../ui/Tag/Tag";
import Typography from "../ui/Typography/Typography";
import Button from "../ui/Button/Button";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

import "./LeadStory.css";

export const LeadStory = ({
	tag = "Lead Developer Story",
	headline,
	dropcap = "I",
	children,
	ctaLink,
	ctaText,
	imageSrc,
	imageAlt = "Portrait of Daniel Adenusi",
}) => {
	const paragraphs =
		typeof children === "string"
			? children
					.split(/\n\s*\n/)
					.map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
					.filter(Boolean)
			: null;

	return (
		<article className="lead-story">
			<Tag
				dot
				className="lead-story__tag typography-bold typography-uppercase typography-tracking-wide"
			>
				{tag}
			</Tag>

			<Typography
				as="h2"
				variant="heading-2"
				className="lead-story__headline"
			>
				{headline}
			</Typography>

			<div className="lead-story__body">
				<figure className="lead-story__portrait">
					{imageSrc ? (
						<img src={imageSrc} alt={imageAlt} />
					) : (
						<div className="lead-story__portrait-placeholder">
							<ImageIcon aria-hidden="true" />
							<span>Add portrait photo</span>
						</div>
					)}
				</figure>

				<div className="typography-body lead-story__content">
					{paragraphs
						? paragraphs.map((paragraph, index) => (
								<p key={index}>
									{index === 0 && (
										<span className="lead-story__dropcap u-font-display">
											{dropcap}
										</span>
									)}
									{paragraph}
								</p>
							))
						: children}
				</div>
			</div>

			<div className="lead-story__link-wrapper">
				<Button href={ctaLink} variant="text">
					<span>{ctaText}</span>
					<ArrowRight className="lead-story__cta-icon" />
				</Button>
			</div>
		</article>
	);
};

LeadStory.propTypes = {
	tag: PropTypes.string,
	headline: PropTypes.string.isRequired,
	dropcap: PropTypes.string,
	children: PropTypes.node.isRequired,
	ctaLink: PropTypes.string.isRequired,
	ctaText: PropTypes.string.isRequired,
	imageSrc: PropTypes.string,
	imageAlt: PropTypes.string,
};
