import PropTypes from "prop-types";
import { Section } from "../Section/Section";
import { Typography } from "../../ui/Typography/Typography";
import { Button } from "../../ui/Button/Button";
import { ThemeToggle } from "../../ui/ThemeToggle/ThemeToggle";
import { useAdminSession } from "../../../hooks/useAdminSession";
import "./Footer.css";

const GithubIcon = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
	>
		<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
		<path d="M9 18c-4.51 2-5-2-7-2" />
	</svg>
);

const LinkedinIcon = ({ className }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
		aria-hidden="true"
	>
		<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
		<rect width="4" height="12" x="2" y="9" />
		<circle cx="4" cy="4" r="2" />
	</svg>
);

GithubIcon.propTypes = {
	className: PropTypes.string,
};

LinkedinIcon.propTypes = {
	className: PropTypes.string,
};

export const Footer = () => {
	const { isAdmin, isLoadingAdminSession } = useAdminSession();

	return (
		<Section id="contact" variant="footer">
			<div className="footer__content">
				<Typography
					as="h2"
					variant="heading-2"
					className="footer__heading"
				>
					Correspondence.
				</Typography>
				<Typography
					variant="muted"
					className="footer__intro"
				>
					Whether you are starting a project, have business inquiries
					or just want to say hi, my inbox is always open so feel free
					to reach out and I will get back to you as soon as possible.
				</Typography>

				<div className="footer__actions">
					<Button
						href="mailto:danieladenusi26@gmail.com?subject=Getting%20in%20touch%20via%20your%20portfolio&body=Hi%20Daniel%2C%0A%0AI%20just%20visited%20your%20portfolio%20website%20and%20wanted%20to%20reach%20out.%0A%0ABest%20regards%2C%0A%0A%5BYour%20Name%5D"
						variant="outline-inverse"
					>
						Send a Telegraph
					</Button>
					<Button
						href="/assets/files/Daniel_Adenusi_CV.pdf"
						variant="accent"
						download
					>
						Download Resume
					</Button>
				</div>

				<div className="footer__socials">
					<a
						href="https://github.com/DanielAdenusi"
						className="footer__social-link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Daniel Adenusi on GitHub"
					>
						<GithubIcon />
					</a>
					<a
						href="https://www.linkedin.com/in/danieladenusi26/"
						className="footer__social-link"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Daniel Adenusi on LinkedIn"
					>
						<LinkedinIcon />
					</a>
				</div>

				<ThemeToggle className="footer__theme-toggle" />

				<Typography variant="subheading" className="footer__copyright">
					{isLoadingAdminSession ? (
						<>
							&copy;{new Date().getFullYear()} Daniel Adenusi.
							Printed on the Web.
						</>
					) : (
						<Button
							href={
								isAdmin
									? "/home/admin"
									: "/login?from=/home/admin"
							}
							variant="text"
						>
							&copy;{new Date().getFullYear()} Daniel Adenusi.
							Printed on the Web.
						</Button>
					)}
				</Typography>
			</div>
		</Section>
	);
};
