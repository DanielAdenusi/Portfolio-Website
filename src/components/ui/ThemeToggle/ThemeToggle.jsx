import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Monitor, MoonStar, SunMedium } from "lucide-react";

import "./ThemeToggle.css";

const storageKey = "portfolio-theme";

const getPreferredTheme = () => {
	if (typeof window === "undefined") {
		return "system";
	}

	const storedTheme = window.localStorage.getItem(storageKey);
	if (
		storedTheme === "light" ||
		storedTheme === "dark" ||
		storedTheme === "system"
	) {
		return storedTheme;
	}

	return "system";
};

const applyTheme = (theme) => {
	const root = document.documentElement;
	root.classList.remove(
		"light-mode",
		"dark-mode",
		"theme-light",
		"theme-dark",
	);

	if (theme === "system") {
		return;
	}

	root.classList.add(theme === "dark" ? "dark-mode" : "light-mode");
	root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
};

export const ThemeToggle = ({ className = "" }) => {
	const [theme, setTheme] = useState(getPreferredTheme);

	const themeOptions = [
		{ value: "light", label: "Light", icon: SunMedium },
		{ value: "system", label: "System", icon: Monitor },
		{ value: "dark", label: "Dark", icon: MoonStar },
	];

	const activeIndex = themeOptions.findIndex(
		(option) => option.value === theme,
	);

	useEffect(() => {
		applyTheme(theme);
		window.localStorage.setItem(storageKey, theme);
	}, [theme]);

	return (
		<div
			className={`theme-toggle ${className}`.trim()}
			role="radiogroup"
			aria-label="Theme mode"
			style={{ "--theme-toggle-index": Math.max(activeIndex, 0) }}
		>
			{themeOptions.map(({ value, label, icon: Icon }) => (
				<button
					key={value}
					type="button"
					className={`theme-toggle__option${theme === value ? " is-active" : ""}`}
					role="radio"
					aria-checked={theme === value}
					onClick={() => setTheme(value)}
					aria-label={
						label === "System"
							? "Use system theme"
							: `Switch to ${label.toLowerCase()} theme`
					}
				>
					<Icon className="theme-toggle__icon" aria-hidden="true" />
					<span>{label}</span>
				</button>
			))}
		</div>
	);
};

ThemeToggle.propTypes = {
	className: PropTypes.string,
};

export default ThemeToggle;
