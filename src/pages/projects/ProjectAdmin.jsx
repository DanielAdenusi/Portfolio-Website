import { useEffect, useMemo, useState } from "react";
import {
	ArrowLeft,
	Database,
	GripVertical,
	ImagePlus,
	Layout,
	Plus,
	Save,
	Server,
	Trash2,
	X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { deleteImage, uploadImage } from "../../data/imageApi";
import {
	deleteProject,
	listProjects,
	saveProject,
} from "../../data/projectApi";
import {
	normalizeProject,
	projects as seedProjects,
	slugifyProjectTitle,
} from "../../data/projects";
import "./ProjectAdmin.css";

const iconOptions = [
	{ icon: Layout, label: "Layout", value: "layout" },
	{ icon: Database, label: "Database", value: "database" },
	{ icon: Server, label: "Server", value: "server" },
];

const emptyProject = normalizeProject({
	challenge: "",
	excerpt: "",
	highlights: [""],
	icon: "layout",
	impact: "",
	media: [],
	solution: "",
	tags: [],
	technologies: [{ info: "", name: "" }],
	timeline: "",
	title: "",
	type: "",
});

const readFileAsDataUrl = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});

const getImageDimensions = (src) =>
	new Promise((resolve) => {
		const image = new Image();
		image.onload = () =>
			resolve({
				height: image.naturalHeight || null,
				width: image.naturalWidth || null,
			});
		image.onerror = () => resolve({ height: null, width: null });
		image.src = src;
	});

const createLocalMedia = async (file) => {
	const src = await readFileAsDataUrl(file);
	const { height, width } = await getImageDimensions(src);
	const alt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

	return {
		alt,
		bytes: file.size || null,
		fileName: file.name,
		format: file.type?.replace(/^image\//, "") || "",
		height,
		isLocal: true,
		publicId: "",
		src,
		width,
	};
};

const isLocalMedia = (media) =>
	Boolean(media?.isLocal) ||
	String(media?.src || "").startsWith("data:image/");

const ProjectAdminEditorSkeleton = () => (
	<div
		className="project-admin-page__editor project-admin-page__editor--skeleton"
		aria-hidden="true"
	>
		<section className="project-admin-page__panel project-admin-page__skeleton-panel">
			<div className="project-admin-page__skeleton-title"></div>
			<div className="project-admin-page__skeleton-grid">
				<div className="project-admin-page__skeleton-field"></div>
				<div className="project-admin-page__skeleton-field"></div>
				<div className="project-admin-page__skeleton-field"></div>
				<div className="project-admin-page__skeleton-field"></div>
			</div>
			<div className="project-admin-page__skeleton-textarea"></div>
			<div className="project-admin-page__skeleton-tags">
				<div></div>
				<div></div>
				<div></div>
			</div>
		</section>
		<section className="project-admin-page__panel project-admin-page__skeleton-panel">
			<div className="project-admin-page__skeleton-title"></div>
			<div className="project-admin-page__skeleton-upload"></div>
			<div className="project-admin-page__skeleton-media-row"></div>
		</section>
		<section className="project-admin-page__panel project-admin-page__skeleton-panel">
			<div className="project-admin-page__skeleton-title"></div>
			<div className="project-admin-page__skeleton-repeater"></div>
			<div className="project-admin-page__skeleton-repeater"></div>
			<div className="project-admin-page__skeleton-repeater"></div>
		</section>
	</div>
);

export const ProjectAdmin = () => {
	const [projects, setProjects] = useState(
		seedProjects.map(normalizeProject),
	);
	const [selectedProjectId, setSelectedProjectId] = useState("");
	const [form, setForm] = useState(emptyProject);
	const [tagDraft, setTagDraft] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [status, setStatus] = useState("");
	const [error, setError] = useState("");
	const [deleteTargetProjectId, setDeleteTargetProjectId] = useState("");
	const [pendingDeletedMediaPublicIds, setPendingDeletedMediaPublicIds] =
		useState([]);
	const [draggedMediaIndex, setDraggedMediaIndex] = useState(null);
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState(
		JSON.stringify(emptyProject),
	);

	const isDirty = useMemo(
		() => JSON.stringify(form) !== lastSavedSnapshot,
		[form, lastSavedSnapshot],
	);

	useEffect(() => {
		let isMounted = true;

		listProjects({ all: true })
			.then(({ projects: loadedProjects }) => {
				if (!isMounted) {
					return;
				}

				const nextProjects = Array.isArray(loadedProjects)
					? loadedProjects.map(normalizeProject)
					: [];
				setProjects(nextProjects);
				if (nextProjects[0]) {
					setSelectedProjectId(nextProjects[0].id);
					setForm(nextProjects[0]);
					setLastSavedSnapshot(JSON.stringify(nextProjects[0]));
				}
			})
			.catch((requestError) => {
				if (isMounted) {
					setError(
						requestError.message || "Unable to load projects.",
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

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			if (!isDirty) {
				return;
			}

			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () =>
			window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [isDirty]);

	const confirmUnsavedChanges = () =>
		!isDirty ||
		window.confirm(
			"You have unsaved project changes. Leave without saving?",
		);

	const updateForm = (updates) => {
		setStatus("");
		setError("");
		setForm((current) => ({
			...current,
			...(typeof updates === "function" ? updates(current) : updates),
		}));
	};

	const handleSelectProject = (project) => {
		if (!confirmUnsavedChanges()) {
			return;
		}

		const nextProject = normalizeProject(project);
		setSelectedProjectId(nextProject.id);
		setForm(nextProject);
		setLastSavedSnapshot(JSON.stringify(nextProject));
		setPendingDeletedMediaPublicIds([]);
		setStatus("");
		setError("");
	};

	const handleNewProject = () => {
		if (!confirmUnsavedChanges()) {
			return;
		}

		setSelectedProjectId("");
		setForm(emptyProject);
		setLastSavedSnapshot(JSON.stringify(emptyProject));
		setPendingDeletedMediaPublicIds([]);
		setStatus("");
		setError("");
	};

	const addTag = (value = tagDraft) => {
		const nextTags = String(value || "")
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);

		if (!nextTags.length) {
			setTagDraft("");
			return;
		}

		updateForm((current) => ({
			tags: Array.from(new Set([...current.tags, ...nextTags])),
			technologies: (() => {
				const existingTechnologyNames = new Set(
					current.technologies
						.map((technology) =>
							technology.name.trim().toLowerCase(),
						)
						.filter(Boolean),
				);
				const missingTechnologies = [];

				nextTags.forEach((tag) => {
					const normalizedTag = tag.toLowerCase();

					if (existingTechnologyNames.has(normalizedTag)) {
						return;
					}

					existingTechnologyNames.add(normalizedTag);
					missingTechnologies.push(tag);
				});

				if (!missingTechnologies.length) {
					return current.technologies;
				}

				const nextTechnologies = [...current.technologies];
				const blankIndex = nextTechnologies.findIndex(
					(technology) =>
						!technology.name.trim() && !technology.info.trim(),
				);
				const technologiesToAppend = [...missingTechnologies];

				if (blankIndex >= 0) {
					nextTechnologies[blankIndex] = {
						info: "",
						name: technologiesToAppend.shift(),
					};
				}

				return [
					...nextTechnologies,
					...technologiesToAppend.map((name) => ({
						info: "",
						name,
					})),
				];
			})(),
		}));
		setTagDraft("");
	};

	const removeTag = (tag) => {
		updateForm((current) => ({
			tags: current.tags.filter((currentTag) => currentTag !== tag),
		}));
	};

	const updateTechnology = (index, updates) => {
		updateForm((current) => ({
			technologies: current.technologies.map((technology, itemIndex) =>
				itemIndex === index
					? { ...technology, ...updates }
					: technology,
			),
		}));
	};

	const removeTechnology = (index) => {
		updateForm((current) => ({
			technologies:
				current.technologies.length > 1
					? current.technologies.filter(
							(_, itemIndex) => itemIndex !== index,
						)
					: [{ info: "", name: "" }],
		}));
	};

	const updateHighlight = (index, value) => {
		updateForm((current) => ({
			highlights: current.highlights.map((highlight, itemIndex) =>
				itemIndex === index ? value : highlight,
			),
		}));
	};

	const removeHighlight = (index) => {
		updateForm((current) => ({
			highlights:
				current.highlights.length > 1
					? current.highlights.filter(
							(_, itemIndex) => itemIndex !== index,
						)
					: [""],
		}));
	};

	const handleMediaUpload = async (event) => {
		const files = Array.from(event.target.files || []);
		event.target.value = "";

		if (!files.length) {
			return;
		}

		const imageFiles = files.filter((file) =>
			file.type.startsWith("image/"),
		);
		if (imageFiles.length !== files.length) {
			setError("Only image files can be added to project media.");
			return;
		}

		const nextMedia = await Promise.all(imageFiles.map(createLocalMedia));
		updateForm((current) => ({
			media: [...current.media, ...nextMedia],
		}));
	};

	const updateMedia = (index, updates) => {
		updateForm((current) => ({
			media: current.media.map((media, itemIndex) =>
				itemIndex === index ? { ...media, ...updates } : media,
			),
		}));
	};

	const removeMedia = (index) => {
		const media = form.media[index];
		if (media && !isLocalMedia(media) && media.publicId) {
			setPendingDeletedMediaPublicIds((current) =>
				current.includes(media.publicId)
					? current
					: [...current, media.publicId],
			);
		}

		updateForm((current) => ({
			media: current.media.filter((_, itemIndex) => itemIndex !== index),
		}));
	};

	const moveMedia = (fromIndex, toIndex) => {
		if (
			fromIndex === toIndex ||
			fromIndex < 0 ||
			toIndex < 0 ||
			fromIndex >= form.media.length ||
			toIndex >= form.media.length
		) {
			return;
		}

		updateForm((current) => {
			const nextMedia = [...current.media];
			const [movedMedia] = nextMedia.splice(fromIndex, 1);
			nextMedia.splice(toIndex, 0, movedMedia);

			return {
				media: nextMedia,
			};
		});
		setDraggedMediaIndex(toIndex);
	};

	const uploadLocalMediaForSave = async (draftProject) => {
		const media = [];
		const localMedia = draftProject.media.filter(isLocalMedia);

		for (const [index, item] of draftProject.media.entries()) {
			if (!isLocalMedia(item)) {
				media.push(item);
				continue;
			}

			const localIndex = localMedia.findIndex(
				(mediaItem) => mediaItem === item,
			);
			setStatus(
				`Uploading ${item.fileName || item.alt || `image ${index + 1}`} (${localIndex + 1}/${localMedia.length})...`,
			);

			try {
				const { image } = await uploadImage({
					alt: item.alt,
					file: item.src,
					fileName: item.fileName,
					folder: "project",
				});
				media.push({
					...image,
					alt: image.alt || item.alt,
					isLocal: false,
				});
			} catch (uploadError) {
				throw new Error(
					`Failed to upload ${item.fileName || item.alt || `image ${index + 1}`}: ${
						uploadError.message || "Cloudinary upload failed."
					}`,
				);
			}
		}

		return {
			...draftProject,
			media,
		};
	};

	const handleSave = async () => {
		const nextId = selectedProjectId || slugifyProjectTitle(form.title);
		const draftProject = normalizeProject({
			...form,
			id: nextId,
			highlights: form.highlights
				.map((item) => item.trim())
				.filter(Boolean),
			technologies: form.technologies.filter((item) => item.name.trim()),
		});

		if (!draftProject.title || !draftProject.excerpt) {
			setError("Add a project title and description before saving.");
			return;
		}

		setIsSaving(true);
		setStatus("Saving project...");
		setError("");

		try {
			const cloudinaryProject =
				await uploadLocalMediaForSave(draftProject);
			const { projects: nextProjects, project: savedProject } =
				await saveProject(cloudinaryProject);

			if (pendingDeletedMediaPublicIds.length) {
				setStatus("Cleaning up removed Cloudinary media...");
				await Promise.all(
					pendingDeletedMediaPublicIds.map((publicId) =>
						deleteImage({ publicId }),
					),
				);
				setPendingDeletedMediaPublicIds([]);
			}

			const nextProject = normalizeProject(
				savedProject || cloudinaryProject,
			);
			setProjects(nextProjects.map(normalizeProject));
			setSelectedProjectId(nextProject.id);
			setForm(nextProject);
			setLastSavedSnapshot(JSON.stringify(nextProject));
			setStatus("Project saved.");
		} catch (requestError) {
			setError(requestError.message || "Unable to save project.");
			setStatus("");
		} finally {
			setIsSaving(false);
		}
	};

	const handleRequestDelete = (projectId) => {
		setDeleteTargetProjectId(projectId);
	};

	const handleCancelDelete = () => {
		setDeleteTargetProjectId("");
	};

	const handleConfirmDelete = async () => {
		const projectId = deleteTargetProjectId;
		if (!projectId) {
			return;
		}

		setError("");
		setStatus("");

		try {
			const { projects: nextProjects } = await deleteProject(projectId);
			setProjects(nextProjects.map(normalizeProject));
			setSelectedProjectId("");
			setForm(emptyProject);
			setLastSavedSnapshot(JSON.stringify(emptyProject));
			setPendingDeletedMediaPublicIds([]);
			setDeleteTargetProjectId("");
		} catch (requestError) {
			setError(requestError.message || "Unable to delete project.");
		}
	};

	return (
		<div className="project-admin-page">
			<aside className="project-admin-page__sidebar">
				<div className="project-admin-page__sidebar-header">
					<h1>Projects</h1>
				</div>
				<Button
					type="button"
					variant="outline-accent"
					onClick={handleNewProject}
					centered
				>
					<Plus />
					New Project
				</Button>

				<div className="project-admin-page__list">
					{isLoading ? (
						<>
							<span className="sr-only">Loading projects...</span>
							{Array.from({ length: 3 }, (_, index) => (
								<div
									className="project-admin-page__list-skeleton"
									key={index}
									aria-hidden="true"
								>
									<div></div>
									<div></div>
								</div>
							))}
						</>
					) : null}
					{!isLoading && !projects.length ? (
						<div className="project-admin-page__empty">
							<strong>No projects yet</strong>
							<span>Create the first project case study.</span>
						</div>
					) : null}
					{!isLoading
						? projects.map((project) => (
								<div
									className={`project-admin-page__list-item${selectedProjectId === project.id ? " is-active" : ""}`}
									key={project.id}
								>
									<button
										type="button"
										onClick={() =>
											handleSelectProject(project)
										}
									>
										<span>{project.title}</span>
										<small>
											{project.type || "Project"} -{" "}
											{project.timeline || "No timeline"}
										</small>
									</button>
									<Button
										type="button"
										variant="icon"
										onClick={() =>
											handleRequestDelete(project.id)
										}
										aria-label="Delete project"
									>
										<Trash2 />
									</Button>
								</div>
							))
						: null}
				</div>
			</aside>

			<main className="project-admin-page__main">
				<header className="project-admin-page__topbar">
					<Link
						to="/projects"
						onClick={(event) => {
							if (!confirmUnsavedChanges()) {
								event.preventDefault();
							}
						}}
						className="project-admin-page__back-link"
					>
						<ArrowLeft />
						Back to All Projects
					</Link>
					<div>
						<h2>
							{selectedProjectId ? "Edit Project" : "New Project"}
						</h2>
						<p>
							{isDirty ? "Unsaved changes" : "All changes saved"}
						</p>
					</div>
					<div className="project-admin-page__toolbar-actions">
						<Button
							type="button"
							variant="outline"
							onClick={() =>
								handleRequestDelete(selectedProjectId)
							}
							disabled={!selectedProjectId}
							state="negative"
						>
							<Trash2 />
							Delete
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleSave}
							isLoading={isSaving}
							state="positive"
						>
							<Save />
							Save
						</Button>
					</div>
				</header>

				{error || status ? (
					<div className="project-admin-page__status">
						{error ? <p className="is-error">{error}</p> : null}
						{status ? <p>{status}</p> : null}
					</div>
				) : null}

				{isLoading ? <ProjectAdminEditorSkeleton /> : null}

				{!isLoading ? (
					<div className="project-admin-page__editor">
						<section className="project-admin-page__panel">
							<h3>Core details</h3>
							<div className="project-admin-page__grid">
								<label>
									<span>Title</span>
									<input
										value={form.title}
										onChange={(event) =>
											updateForm({
												title: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Type</span>
									<input
										value={form.type}
										placeholder="Full-Stack"
										onChange={(event) =>
											updateForm({
												type: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Timeline</span>
									<input
										value={form.timeline}
										placeholder="2026"
										onChange={(event) =>
											updateForm({
												timeline: event.target.value,
											})
										}
									/>
								</label>
								<label>
									<span>Icon</span>
									<select
										value={form.icon}
										onChange={(event) =>
											updateForm({
												icon: event.target.value,
											})
										}
									>
										{iconOptions.map((option) => (
											<option
												key={option.value}
												value={option.value}
											>
												{option.label}
											</option>
										))}
									</select>
								</label>
							</div>
							<label>
								<span>Description</span>
								<textarea
									rows="4"
									value={form.excerpt}
									onChange={(event) =>
										updateForm({
											excerpt: event.target.value,
										})
									}
								/>
							</label>
							<div className="project-admin-page__tag-editor">
								<label>
									<span>Technologies used</span>
									<input
										value={tagDraft}
										placeholder="React, Node.js, MongoDB"
										onBlur={() => addTag()}
										onChange={(event) =>
											setTagDraft(event.target.value)
										}
										onKeyDown={(event) => {
											if (
												event.key === "Enter" ||
												event.key === ","
											) {
												event.preventDefault();
												addTag();
											}
										}}
									/>
								</label>
								<div className="project-admin-page__tags">
									{form.tags.length ? (
										form.tags.map((tag) => (
											<button
												key={tag}
												type="button"
												onClick={() => removeTag(tag)}
											>
												{tag}
												<span aria-hidden="true">
													<X className="project-admin-page__tag-remove" />
												</span>
											</button>
										))
									) : (
										<span>No technologies added yet</span>
									)}
								</div>
							</div>
						</section>

						<section className="project-admin-page__panel">
							<h3>Media carousel</h3>
							<label className="project-admin-page__upload">
								<ImagePlus className="w-5 h-5" />
								<span>Add carousel images</span>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleMediaUpload}
								/>
							</label>
							{form.media.length ? (
								<div className="project-admin-page__media-list">
									{form.media.map((media, index) => (
										<div
											className={`project-admin-page__media-item${
												draggedMediaIndex === index
													? " is-dragging"
													: ""
											}`}
											key={`${media.src}-${index}`}
											onDragEnter={() => {
												if (
													draggedMediaIndex !== null
												) {
													moveMedia(
														draggedMediaIndex,
														index,
													);
												}
											}}
											onDragOver={(event) => {
												event.preventDefault();
												event.dataTransfer.dropEffect =
													"move";
											}}
										>
											<span
												className="project-admin-page__media-drag-handle"
												aria-label="Drag to reorder media"
												draggable
												onDragStart={(event) => {
													setDraggedMediaIndex(index);
													event.dataTransfer.effectAllowed =
														"move";
													event.dataTransfer.setData(
														"text/plain",
														String(index),
													);
												}}
												onDragEnd={() =>
													setDraggedMediaIndex(null)
												}
											>
												<GripVertical />
											</span>
											<img
												src={media.src}
												alt={media.alt || ""}
											/>
											<label>
												<span>Caption / alt text</span>
												<input
													value={media.alt}
													onChange={(event) =>
														updateMedia(index, {
															alt: event.target
																.value,
														})
													}
												/>
											</label>
											<Button
												type="button"
												variant="icon"
												onClick={() =>
													removeMedia(index)
												}
												aria-label="Remove media"
											>
												<Trash2 />
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="project-admin-page__empty">
									<strong>No carousel media yet</strong>
									<span>
										Add screenshots or visuals for this
										project.
									</span>
								</div>
							)}
						</section>

						<section className="project-admin-page__panel">
							<div className="project-admin-page__panel-header">
								<h3>Technology details</h3>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										updateForm((current) => ({
											technologies: [
												...current.technologies,
												{ info: "", name: "" },
											],
										}))
									}
								>
									<Plus />
									Add
								</Button>
							</div>
							<div className="project-admin-page__repeater">
								{form.technologies.map((technology, index) => (
									<div
										className="project-admin-page__repeater-item"
										key={index}
									>
										<input
											value={technology.name}
											placeholder="Technology"
											onChange={(event) =>
												updateTechnology(index, {
													name: event.target.value,
												})
											}
										/>
										<textarea
											rows="2"
											value={technology.info}
											placeholder="How it was used"
											onChange={(event) =>
												updateTechnology(index, {
													info: event.target.value,
												})
											}
										/>
										<Button
											type="button"
											variant="icon"
											onClick={() =>
												removeTechnology(index)
											}
											aria-label="Remove technology"
										>
											<Trash2 />
										</Button>
									</div>
								))}
							</div>
						</section>

						<section className="project-admin-page__panel">
							<h3>Case study</h3>
							<label>
								<span>Challenge</span>
								<textarea
									rows="4"
									value={form.challenge}
									onChange={(event) =>
										updateForm({
											challenge: event.target.value,
										})
									}
								/>
							</label>
							<label>
								<span>Implementation</span>
								<textarea
									rows="4"
									value={form.solution}
									onChange={(event) =>
										updateForm({
											solution: event.target.value,
										})
									}
								/>
							</label>
							<label>
								<span>Impact</span>
								<textarea
									rows="4"
									value={form.impact}
									onChange={(event) =>
										updateForm({
											impact: event.target.value,
										})
									}
								/>
							</label>
						</section>

						<section className="project-admin-page__panel">
							<div className="project-admin-page__panel-header">
								<h3>Highlights</h3>
								<Button
									type="button"
									variant="outline"
									onClick={() =>
										updateForm((current) => ({
											highlights: [
												...current.highlights,
												"",
											],
										}))
									}
								>
									<Plus />
									Add
								</Button>
							</div>
							<div className="project-admin-page__repeater">
								{form.highlights.map((highlight, index) => (
									<div
										className="project-admin-page__repeater-item"
										key={index}
									>
										<textarea
											rows="2"
											value={highlight}
											placeholder="Project highlight"
											onChange={(event) =>
												updateHighlight(
													index,
													event.target.value,
												)
											}
										/>
										<Button
											type="button"
											variant="icon"
											onClick={() =>
												removeHighlight(index)
											}
											aria-label="Remove highlight"
										>
											<Trash2 />
										</Button>
									</div>
								))}
							</div>
						</section>
					</div>
				) : null}
			</main>
			<ConfirmDialog
				isOpen={Boolean(deleteTargetProjectId)}
				title="Delete this project?"
				description="This removes the project from the public project archive. The action cannot be undone."
				confirmLabel="Delete project"
				onCancel={handleCancelDelete}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
};
