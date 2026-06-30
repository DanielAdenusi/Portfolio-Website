import PropTypes from "prop-types";
import "./Section.css";

export const Section = ({
	variant = "default",
	id,
	className = "",
	children,
}) => {
	const variants = {
		default: "section",
		main: "section section--main",
		projects: "section section--projects",
		glossary: "section section--glossary",
		footer: "section section--footer",
	};

	return (
		<section id={id} className={`${variants[variant]} ${className}`}>
			{children}
		</section>
	);
};

Section.propTypes = {
	variant: PropTypes.oneOf([
		"default",
		"main",
		"projects",
		"glossary",
		"footer",
	]),
	id: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.node,
};
