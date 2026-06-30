import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { getSiteSettings, saveSiteSettings } from "../../data/siteSettingsApi";
import "./HomeAdmin.css";

const emptyCurrentBook = {
	author: "",
	coverUrl: "",
	link: "",
	title: "",
};

export const HomeAdmin = () => {
	const [currentBook, setCurrentBook] = useState(emptyCurrentBook);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [status, setStatus] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		getSiteSettings()
			.then(({ settings }) => {
				if (!isMounted) {
					return;
				}

				setCurrentBook(settings.currentBook || emptyCurrentBook);
			})
			.catch((requestError) => {
				if (isMounted) {
					setError(
						requestError.message ||
							"Unable to load homepage settings.",
					);
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, []);

	const updateCurrentBook = (updates) => {
		setStatus("");
		setError("");
		setCurrentBook((current) => ({
			...current,
			...updates,
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);
		setStatus("Saving homepage settings...");
		setError("");

		try {
			const { settings } = await saveSiteSettings({
				currentBook,
			});
			setCurrentBook(settings.currentBook || emptyCurrentBook);
			setStatus("Homepage settings saved.");
		} catch (requestError) {
			setError(
				requestError.message || "Unable to save homepage settings.",
			);
			setStatus("");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="home-admin-page">
			<header className="home-admin-page__topbar">
				<Link to="/" className="home-admin-page__back-link">
					<ArrowLeft />
					Back to Home
				</Link>
				<div>
					<h1>Homepage Controls</h1>
					<p>Manage small homepage modules without editing code.</p>
				</div>
				<div className="home-admin-page__actions">
					<Button
						type="button"
						variant="outline"
						onClick={handleSave}
						isLoading={isSaving}
						state="positive"
						disabled={isLoading}
					>
						<Save />
						Save
					</Button>
				</div>
			</header>

			{error || status ? (
				<div className="home-admin-page__status">
					{error ? <p className="is-error">{error}</p> : null}
					{status ? <p>{status}</p> : null}
				</div>
			) : null}

			<main className="home-admin-page__main">
				<section className="home-admin-page__panel">
					<div className="home-admin-page__panel-header">
						<div>
							<h2>Currently Reading</h2>
							<p>
								This appears in the Currently Reading widget on
								the home screen.
							</p>
						</div>
					</div>

					{isLoading ? (
						<div className="home-admin-page__skeleton" />
					) : (
						<div className="home-admin-page__reading-layout">
							<div className="home-admin-page__reading-preview">
								{currentBook.coverUrl ? (
									<img
										src={currentBook.coverUrl}
										alt={
											currentBook.title
												? `Cover of ${currentBook.title}`
												: ""
										}
									/>
								) : (
									<BookOpen />
								)}
							</div>

							<div className="home-admin-page__grid">
								<label>
									<span>Book title</span>
									<input
										value={currentBook.title}
										placeholder="Currently reading"
										onChange={(event) =>
											updateCurrentBook({
												title: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Author</span>
									<input
										value={currentBook.author}
										placeholder="Author name"
										onChange={(event) =>
											updateCurrentBook({
												author: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Cover image URL</span>
									<input
										value={currentBook.coverUrl}
										placeholder="https://..."
										onChange={(event) =>
											updateCurrentBook({
												coverUrl: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Book link</span>
									<input
										value={currentBook.link}
										placeholder="https://..."
										onChange={(event) =>
											updateCurrentBook({
												link: event.target.value,
											})
										}
									/>
								</label>
							</div>
						</div>
					)}
				</section>
			</main>
		</div>
	);
};
