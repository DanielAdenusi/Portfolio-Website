import PropTypes from "prop-types";
import "./Button.css";
import Loader from "../../Loader/Loader";

export const Button = ({
	href,
	children,
	variant = "primary",
	className = "",
	isLoading = false,
	state,
	centered = false,
	...props
}) => {
	const Component = href ? "a" : "button";
	const blockClass = "button";

	const classes = [
		blockClass,
		variant ? `${blockClass}--${variant}` : "",
		isLoading && `${blockClass}--loading`,
		state && `${blockClass}--${state}`,
		centered && `${blockClass}--centered`,
		className,
	]
		.filter(Boolean)
		.join(" ")
		.trim();

	return (
		<Component href={href} className={classes} {...props}>
			{isLoading && <Loader text="" isInline />}
			{children}
		</Component>
	);
};

Button.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node.isRequired,
	variant: PropTypes.oneOf([
		"primary",
		"text",
		"outline",
		"outline-accent",
		"outline-inverse",
		"accent",
		"icon",
	]),
	className: PropTypes.string,
	isLoading: PropTypes.bool,
	state: PropTypes.oneOf(["positive", "negative", "warning"]),
	centered: PropTypes.bool,
};

export default Button;
