import { Typography } from "../ui/Typography/Typography";
import PropTypes from "prop-types";
import "./Glossary.css";
import { Section } from "../layout/Section/Section";
import { Container } from "../layout/Container/Container";

export const Glossary = ({ glossaryData = [] }) => {
	glossaryData = [
		{
			title: "The Interface",
			sectionNumber: "I",
			items: [
				{ name: "React.js", type: "Core" },
				{ name: "JavaScript", type: "Typing" },
				{ name: "Vanilla CSS", type: "Styling" },
			],
		},
		{
			title: "The Server",
			sectionNumber: "II",
			items: [
				{ name: "Node.js", type: "Runtime" },
				{ name: "Vite", type: "Framework" },
				{ name: "Neon Postgres", type: "Database" },
				{ name: "REST APIs", type: "Architecture" },
			],
		},
		{
			title: "The Infrastructure",
			sectionNumber: "III",
			items: [
				{ name: "Git / GitHub", type: "VCS" },
				{ name: "Vercel", type: "Edge and Backend Deploy" },
				{ name: "Cloudinary", type: "Asset CDN" },
			],
		},
	];

	return (
		<Section id={"stack"} variant="glossary" className="glossary">
			<Container>
				<div className="glossary__header">
					<Typography
						as="h3"
						variant="heading-3"
						className="glossary__title"
					>
						Technical Glossary
					</Typography>
					<Typography
						variant="subheading"
						className="glossary__kicker"
					>
						Appendix A
					</Typography>
				</div>

				<div className="glossary__grid">
					{glossaryData.map((section, index) => (
						<div key={index}>
							<Typography
								as="h4"
								variant="subheading"
								className="glossary__section-title"
							>
								{section.sectionNumber}. {section.title}
							</Typography>
							<ul className="glossary__list">
								{section.items.map((item, itemIndex) => (
									<li
										key={itemIndex}
										className="glossary__item"
									>
										<span>{item.name}</span>
										<span className="glossary__item-type">
											{item.type}
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Container>
		</Section>
	);
};

Glossary.propTypes = {
	glossaryData: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string.isRequired,
			sectionNumber: PropTypes.string.isRequired,
			items: PropTypes.arrayOf(
				PropTypes.shape({
					name: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
				}),
			).isRequired,
		}),
	),
};
