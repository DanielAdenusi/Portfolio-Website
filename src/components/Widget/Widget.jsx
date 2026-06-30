import PropTypes from "prop-types";
import { Typography } from "../ui/Typography/Typography";
import "./Widget.css";

export const Widget = ({
	interactive,
	href,
	headerIcon: HeaderIcon,
	headerText,
	title,
	subtitle,
	children,
}) => (
	<div
		className={`widget ${interactive ? "widget--interactive" : ""}`}
		onClick={() => {
			if (interactive) {
				if (href) {
					window.open(href, "_blank");
				}
			}
		}}
	>
		<Typography as="h3" variant="subheading" className="widget__header">
			{HeaderIcon && <HeaderIcon />} {headerText}
		</Typography>

		<div className="widget__content">
			{children}
			<div className="widget__info">
				<div>
					<Typography
						as="h4"
						variant="display"
						className="widget__title"
						title={title}
					>
						{title}
					</Typography>
					{subtitle && (
						<Typography
							variant="muted"
							className="widget__subtitle"
						>
							{subtitle}
						</Typography>
					)}
				</div>
			</div>
		</div>
	</div>
);

Widget.propTypes = {
	interactive: PropTypes.bool,
	href: PropTypes.string,
	headerIcon: PropTypes.elementType,
	headerText: PropTypes.string,
	title: PropTypes.string,
	subtitle: PropTypes.string,
	children: PropTypes.node,
};
