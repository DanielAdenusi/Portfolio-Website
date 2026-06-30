import { Hash, Quote } from "lucide-react";
import { Typography } from "../../ui/Typography/Typography";
import "./Navigation.css";

export const Navigation = () => (
	<nav className="navigation">
		<div>
			<Typography
				as="h3"
				variant="subheading"
				className="navigation__header"
			>
				<Hash /> Index
			</Typography>
			<ul className="navigation__list typography-font-sans typography-sm">
				<li>
					<a href="#feature" className="navigation__link">
						<span>01. The Lead Story</span>{" "}
						<span className="navigation__link-page">Pg. 1</span>
					</a>
				</li>
				<li>
					<a href="#projects" className="navigation__link">
						<span>02. Architecture & Systems</span>{" "}
						<span className="navigation__link-page">Pg. 2</span>
					</a>
				</li>
				<li>
					<a href="#blog" className="navigation__link">
						<span>03. Writing Desk</span>{" "}
						<span className="navigation__link-page">Pg. 4</span>
					</a>
				</li>
				<li>
					<a href="#stack" className="navigation__link">
						<span>04. Technical Glossary</span>{" "}
						<span className="navigation__link-page">Pg. 5</span>
					</a>
				</li>
				<li>
					<a href="#contact" className="navigation__link">
						<span>05. Correspondence</span>{" "}
						<span className="navigation__link-page">Pg. 7</span>
					</a>
				</li>
			</ul>
		</div>

		<div>
			<Typography
				as="h3"
				variant="subheading"
				className="navigation__quote-heading"
			>
				Design Philosophy
			</Typography>
			<div className="navigation__quote">
				<Quote className="navigation__quote-icon" />
				<p className="navigation__quote-text typography-sans typography-sm">
					&ldquo;Design is more than just the what and how of a
					product; it is the why. Why does it exist? Why does it
					matter? Why should anyone care?&rdquo;
				</p>
			</div>
		</div>
	</nav>
);
