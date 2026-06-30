import PropTypes from "prop-types";
import "./Container.css";

export const Container = ({ children, className = "" }) => (
	<div className={`container ${className}`}>{children}</div>
);

Container.propTypes = {
	children: PropTypes.node,
	className: PropTypes.string,
};
