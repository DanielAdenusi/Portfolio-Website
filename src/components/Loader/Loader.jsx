import PropTypes from "prop-types";
import "./Loader.css";

const Loader = ({
	text = "Loading...",
	isFullScreen = false,
	isInline = false,
}) => {
	const blockClass = "loader";

	// Base block class
	const classes = [
		"loader",
		isFullScreen && `${blockClass}--fullscreen`,
		isInline && `${blockClass}--inline`,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	return (
		<div className={classes} role="status" aria-live="polite">
			<div className="loader__spinner" aria-hidden="true"></div>
			{text && text.trim().length > 0 && (
				<span className="loader__text">{text}</span>
			)}
		</div>
	);
};

export default Loader;

Loader.propTypes = {
	text: PropTypes.string,
	isFullScreen: PropTypes.bool,
	isInline: PropTypes.bool,
};
