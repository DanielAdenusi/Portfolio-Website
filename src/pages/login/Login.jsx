import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { Container } from "../../components/layout/Container/Container";
import { Footer } from "../../components/layout/Footer/Footer";
import { Section } from "../../components/layout/Section/Section";
import Typography from "../../components/ui/Typography/Typography";
import "./Login.css";

export const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const from =
		new URLSearchParams(location.search).get("from") ||
		location.state?.from?.pathname ||
		"/blog/admin";
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const checkSession = async () => {
			try {
				const response = await fetch("/api/blog-session", {
					credentials: "same-origin",
				});

				if (response.ok) {
					navigate(from, { replace: true });
				}
			} catch {
				return;
			}
		};

		checkSession();
	}, [from, navigate]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/blog-login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "same-origin",
				body: JSON.stringify({ password }),
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({}));
				setError(payload.error || "Incorrect password.");
				return;
			}

			navigate(from, { replace: true });
		} catch {
			setError("Unable to sign in right now.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-page">
			<Section variant="projects" className="login-page__section">
				<Container>
					<div className="login-page__card">
						<Link to="/" className="login-page__back-link">
							<ArrowLeft />
							Back to Portfolio
						</Link>

						<Typography as="h1" variant="heading-2">
							Sign in.
						</Typography>
						<Typography
							variant="muted"
							className="login-page__intro"
						>
							Enter your admin password to manage the site.
						</Typography>

						<form
							className="login-page__form"
							onSubmit={handleSubmit}
						>
							<label>
								<span>Password</span>
								<input
									type="password"
									value={password}
									onChange={(event) =>
										setPassword(event.target.value)
									}
									placeholder="Enter admin password"
									autoComplete="current-password"
								/>
							</label>

							{error && (
								<p className="login-page__error">
									{error}
								</p>
							)}

							<Button
								type="submit"
								variant="outline"
								disabled={isSubmitting}
								isLoading={isSubmitting}
							>
								{isSubmitting ? "Signing In" : "Sign In"}
							</Button>
						</form>
					</div>
				</Container>
			</Section>
			<Footer />
		</div>
	);
};
