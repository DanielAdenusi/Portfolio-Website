import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
	ArrowDown,
	ArrowLeft,
	ArrowUp,
	CalendarDays,
	Clock3,
	GripVertical,
	Eye,
	EyeOff,
	Heading2,
	Heading3,
	ImagePlus,
	List,
	PanelRightClose,
	PanelRightOpen,
	Plus,
	Quote,
	Save,
	Text,
	Trash2,
	Type,
	PanelTopClose,
	PanelTopOpen,
	Trash,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { Button } from "../../components/ui/Button/Button";
import { ThemeToggle } from "../../components/ui/ThemeToggle/ThemeToggle";
import {
	deleteBlogPost,
	listBlogPosts,
	saveBlogPost,
	toggleBlogPostPublish,
} from "../../data/blogApi";
import { deleteImage, uploadImage } from "../../data/imageApi";
import {
	calculateReadTime,
	calculateReadTimeDetails,
} from "../../data/blogPosts";
import "./BlogAdmin.css";

const getToday = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
	if (!value) {
		return "";
	}

	const [year, month, day] = value.split("-");

	if (!year || !month || !day) {
		return value;
	}

	return `${day}/${month}/${year}`;
};

const parseTags = (value) =>
	String(value || "")
		.split(",")
		.map((tag) => tag.trim())
		.filter(Boolean);

const serializeTags = (tags) => tags.join(", ");

const today = getToday();
const maxUploadSizeBytes = 1024 * 1024 * 3;

const createBlockId = () =>
	typeof crypto !== "undefined" && crypto.randomUUID
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const createBlock = (type = "paragraph", overrides = {}) => ({
	id: createBlockId(),
	type,
	text: "",
	imageIndex: 0,
	...overrides,
});

const emptyForm = {
	title: "",
	excerpt: "",
	date: today,
	tags: "",
	images: [],
	blocks: [createBlock("paragraph")],
	published: false,
};

const blockOptions = [
	{ icon: Type, label: "Text", type: "paragraph" },
	{ icon: Heading2, label: "Chapter", type: "heading" },
	{ icon: Heading3, label: "Section", type: "subheading" },
	{ icon: Quote, label: "Quote", type: "quote" },
	{ icon: List, label: "List", type: "list" },
	{ icon: ImagePlus, label: "Image", type: "image" },
];

const blockOptionGroups = [
	["paragraph"],
	["heading", "subheading"],
	["quote", "list"],
	["image"],
];

const getBlockOption = (type) =>
	blockOptions.find((option) => option.type === type);

const slugify = (value) =>
	value
		.toLowerCase()
		.trim()
		.replace(/["']/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

const normalizeFormImages = (images) =>
	Array.isArray(images)
		? images
				.map((image) => ({
					alt: image.alt?.trim() || "",
					bytes: image.bytes || null,
					fileName: image.fileName || "",
					format: image.format || "",
					height: image.height || null,
					isLocal: Boolean(image.isLocal),
					publicId: image.publicId || image.public_id || "",
					src: image.src?.trim() || "",
					width: image.width || null,
				}))
				.filter((image) => image.src)
		: [];

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

		image.onload = () => {
			resolve({
				height: image.naturalHeight || null,
				width: image.naturalWidth || null,
			});
		};

		image.onerror = () => {
			resolve({ height: null, width: null });
		};

		image.src = src;
	});

const createLocalImageFromFile = async (file) => {
	const src = await readFileAsDataUrl(file);
	const { height, width } = await getImageDimensions(src);
	const fallbackAlt = file.name
		.replace(/\.[^/.]+$/, "")
		.replace(/[-_]+/g, " ")
		.trim();

	return {
		alt: fallbackAlt,
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

const isLocalImage = (image) =>
	Boolean(image?.isLocal) ||
	String(image?.src || "").startsWith("data:image/");

const bodyBlockToEditorBlock = (block) => {
	const value = String(block || "").trim();
	const imageReference = value.match(/^\[image:(\d+)\](?:\s+(.+))?$/i);

	if (imageReference) {
		return createBlock("image", {
			imageIndex: Number(imageReference[1]),
			text: imageReference[2] || "",
		});
	}

	if (value.startsWith("## ")) {
		return createBlock("heading", {
			text: value.replace(/^##\s+/, ""),
		});
	}

	if (value.startsWith("### ")) {
		return createBlock("subheading", {
			text: value.replace(/^###\s+/, ""),
		});
	}

	if (value.startsWith("> ")) {
		return createBlock("quote", {
			text: value.replace(/^>\s?/, ""),
		});
	}

	if (/^-\s+/m.test(value)) {
		return createBlock("list", {
			text: value
				.split("\n")
				.map((item) => item.replace(/^-\s+/, "").trim())
				.filter(Boolean)
				.join("\n"),
		});
	}

	return createBlock("paragraph", { text: value });
};

const postBodyToEditorBlocks = (body) => {
	const blocks = (
		Array.isArray(body) ? body : String(body || "").split(/\n\s*\n/)
	)
		.map(bodyBlockToEditorBlock)
		.filter((block) => block.text || block.type === "image");

	return blocks.length ? blocks : [createBlock("paragraph")];
};

const editorBlockToBodyBlock = (block) => {
	const text = String(block.text || "").trim();

	if (block.type === "image") {
		return `[image:${block.imageIndex}]${text ? ` ${text}` : ""}`;
	}

	if (!text) {
		return "";
	}

	if (block.type === "heading") {
		return `## ${text}`;
	}

	if (block.type === "subheading") {
		return `### ${text}`;
	}

	if (block.type === "quote") {
		return `> ${text}`;
	}

	if (block.type === "list") {
		return text
			.split("\n")
			.map((item) => item.trim())
			.filter(Boolean)
			.map((item) => `- ${item}`)
			.join("\n");
	}

	return text;
};

const editorBlocksToBodyArray = (blocks) =>
	blocks.map(editorBlockToBodyBlock).filter(Boolean);

const editorBlocksToText = (blocks) =>
	editorBlocksToBodyArray(blocks).join("\n\n");

const postToForm = (post) => ({
	title: post.title || "",
	excerpt: post.excerpt || "",
	date: post.date || today,
	tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
	images: normalizeFormImages(post.images),
	blocks: postBodyToEditorBlocks(post.body),
	published: post.published ?? true,
});

const formToPost = (form, id) => {
	const body = editorBlocksToBodyArray(form.blocks);

	return {
		id,
		title: form.title.trim(),
		excerpt: form.excerpt.trim(),
		date: form.date || today,
		readTime: calculateReadTime(body),
		tags: parseTags(form.tags),
		images: normalizeFormImages(form.images).map(
			({ fileName, isLocal, ...image }) => image,
		),
		body,
		published: form.published,
	};
};

const formatImageMeta = (image) =>
	[
		image.width && image.height ? `${image.width}x${image.height}` : null,
		image.format,
	]
		.filter(Boolean)
		.join(" - ");

const getBlockLabel = (type) => getBlockOption(type)?.label || "Text";

const getChapterBlocks = (blocks) =>
	blocks
		.filter((block) => block.type === "heading")
		.map((block, index) => ({
			...block,
			label: String(index + 1).padStart(2, "0"),
		}));

const localDraftStoragePrefix = "blog-admin-local-draft";

const getLocalDraftStorageKey = (postId) =>
	`${localDraftStoragePrefix}:${postId || "new"}`;

const normalizeDraftBlocks = (blocks) => {
	if (!Array.isArray(blocks) || !blocks.length) {
		return [createBlock("paragraph")];
	}

	return blocks.map((block) => ({
		...createBlock(block.type || "paragraph"),
		...block,
		id: block.id || createBlockId(),
		imageIndex: Number.isFinite(Number(block.imageIndex))
			? Number(block.imageIndex)
			: 0,
		text: String(block.text || ""),
		type: block.type || "paragraph",
	}));
};

const normalizeDraftForm = (draftForm = {}) => ({
	...emptyForm,
	...draftForm,
	date: draftForm.date || today,
	excerpt: draftForm.excerpt || "",
	images: normalizeFormImages(draftForm.images),
	blocks: normalizeDraftBlocks(draftForm.blocks),
	published: Boolean(draftForm.published),
	tags: draftForm.tags || "",
	title: draftForm.title || "",
});

const loadLocalDraft = (postId) => {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const storageKey = getLocalDraftStorageKey(postId);
		const savedDraft = window.localStorage.getItem(storageKey);

		if (!savedDraft) {
			return null;
		}

		const parsedDraft = JSON.parse(savedDraft);

		if (!parsedDraft?.form) {
			return null;
		}

		return {
			...parsedDraft,
			form: normalizeDraftForm(parsedDraft.form),
			storageKey,
		};
	} catch {
		return null;
	}
};

const saveLocalDraft = (postId, form) => {
	if (typeof window === "undefined") {
		return null;
	}

	const payload = {
		form: normalizeDraftForm(form),
		postId: postId || "",
		updatedAt: new Date().toISOString(),
	};

	window.localStorage.setItem(
		getLocalDraftStorageKey(postId),
		JSON.stringify(payload),
	);

	return payload;
};

const removeLocalDraft = (postIdOrStorageKey) => {
	if (typeof window === "undefined" || !postIdOrStorageKey) {
		return;
	}

	const storageKey = postIdOrStorageKey.startsWith(localDraftStoragePrefix)
		? postIdOrStorageKey
		: getLocalDraftStorageKey(postIdOrStorageKey);

	window.localStorage.removeItem(storageKey);
};

const formatLocalDraftTime = (value) => {
	if (!value) {
		return "just now";
	}

	try {
		return new Intl.DateTimeFormat("en-GB", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(value));
	} catch {
		return "recently";
	}
};

const BlogPostSkeleton = () => (
	<div className="blog-admin-page__list-item__skeleton">
		<div className="blog-page__skeleton-line blog-page__skeleton-line--title"></div>
		<div className="blog-page__skeleton-line"></div>
		<div className="blog-page__skeleton-line blog-page__skeleton-line--short"></div>
	</div>
);

const BlogAdminEditorSkeleton = () => (
	<>
		<main
			className="blog-admin-page__writing-panel blog-admin-page__editor-skeleton"
			role="status"
			aria-label="Loading editor"
		>
			<div className="blog-admin-page__skeleton-toolbar">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
			<article className="blog-admin-page__document">
				<div className="blog-admin-page__skeleton-hero"></div>
				<div className="blog-admin-page__skeleton-kicker"></div>
				<div className="blog-admin-page__skeleton-title"></div>
				<div className="blog-admin-page__skeleton-title blog-admin-page__skeleton-title--short"></div>
				<div className="blog-admin-page__skeleton-line blog-admin-page__skeleton-line--wide"></div>
				<div className="blog-admin-page__skeleton-meta-row">
					<div></div>
					<div></div>
				</div>
				<div className="blog-admin-page__skeleton-layout">
					<aside>
						<div className="blog-admin-page__skeleton-kicker"></div>
						<div className="blog-admin-page__skeleton-line"></div>
						<div className="blog-admin-page__skeleton-line blog-admin-page__skeleton-line--short"></div>
					</aside>
					<div>
						<div className="blog-admin-page__skeleton-heading"></div>
						<div className="blog-admin-page__skeleton-line blog-admin-page__skeleton-line--wide"></div>
						<div className="blog-admin-page__skeleton-line"></div>
						<div className="blog-admin-page__skeleton-line blog-admin-page__skeleton-line--medium"></div>
						<div className="blog-admin-page__skeleton-image"></div>
					</div>
				</div>
			</article>
		</main>
		<aside
			className="blog-admin-page__side-panel blog-admin-page__side-panel-skeleton"
			aria-hidden="true"
		>
			<section className="blog-admin-page__panel-section">
				<div className="blog-admin-page__skeleton-kicker"></div>
				<div className="blog-admin-page__skeleton-field"></div>
				<div className="blog-admin-page__skeleton-field"></div>
				<div className="blog-admin-page__skeleton-status-grid">
					<div></div>
					<div></div>
					<div></div>
				</div>
			</section>
			<section className="blog-admin-page__panel-section">
				<div className="blog-admin-page__skeleton-kicker"></div>
				<div className="blog-admin-page__skeleton-upload"></div>
				<div className="blog-admin-page__skeleton-image-item"></div>
				<div className="blog-admin-page__skeleton-image-item"></div>
			</section>
		</aside>
	</>
);

const EditableText = ({
	as: Component = "div",
	className = "",
	onChange,
	placeholder,
	value,
	...props
}) => {
	const elementRef = useRef(null);

	useLayoutEffect(() => {
		const element = elementRef.current;

		if (!element || document.activeElement === element) {
			return;
		}

		if (element.innerText !== value) {
			element.innerText = value || "";
		}
	}, [Component, value]);

	return (
		<Component
			ref={elementRef}
			className={className}
			contentEditable
			data-placeholder={placeholder}
			onInput={(event) => onChange(event.currentTarget.innerText)}
			suppressContentEditableWarning
			{...props}
		/>
	);
};

const BlockControls = ({
	canMoveDown,
	canMoveUp,
	onAddBelow,
	onDragStart,
	onMoveDown,
	onMoveUp,
	onRemove,
	onTypeChange,
	type,
}) => (
	<div className="blog-admin-page__floating-controls">
		<span
			className="blog-admin-page__drag-handle"
			draggable
			onDragStart={onDragStart}
			role="button"
			tabIndex="0"
			title="Drag to reorder"
			aria-label="Drag block to reorder"
		>
			<GripVertical />
		</span>
		<label className="blog-admin-page__floating-type">
			<span className="sr-only">Block type</span>
			<select
				value={type}
				onChange={(event) => onTypeChange(event.target.value)}
				aria-label="Change block type"
			>
				{blockOptions.map((option) => (
					<option key={option.type} value={option.type}>
						{option.label}
					</option>
				))}
			</select>
		</label>
		<Button
			type="button"
			variant="icon"
			onClick={onMoveUp}
			disabled={!canMoveUp}
			aria-label="Move block up"
		>
			<ArrowUp />
		</Button>
		<Button
			type="button"
			variant="icon"
			onClick={onMoveDown}
			disabled={!canMoveDown}
			aria-label="Move block down"
		>
			<ArrowDown />
		</Button>
		<Button
			type="button"
			variant="icon"
			onClick={onAddBelow}
			aria-label="Add text below"
		>
			<Plus />
		</Button>
		<Button
			type="button"
			variant="icon"
			onClick={onRemove}
			aria-label="Delete block"
		>
			<Trash2 />
		</Button>
	</div>
);

const EditableArticleBlock = ({
	block,
	canMoveDown,
	canMoveUp,
	isActive,
	isDragging,
	isDragTarget,
	images,
	onAddBelow,
	onChange,
	onDragEnd,
	onDragOver,
	onDragStart,
	onDrop,
	isUploading,
	onImageUpload,
	onImageSelect,
	onMoveDown,
	onMoveUp,
	onRemove,
	onSetActive,
	onTypeChange,
}) => {
	const image = images[block.imageIndex];
	const text = String(block.text || "").trim();
	const controls = (
		<BlockControls
			canMoveDown={canMoveDown}
			canMoveUp={canMoveUp}
			onAddBelow={onAddBelow}
			onDragStart={onDragStart}
			onMoveDown={onMoveDown}
			onMoveUp={onMoveUp}
			onRemove={onRemove}
			onTypeChange={onTypeChange}
			type={block.type}
		/>
	);
	const blockClassName = [
		"blog-admin-page__article-block",
		isActive ? "is-active" : "",
		isDragging ? "is-dragging" : "",
		isDragTarget ? "is-drag-target" : "",
		isDragTarget ? `is-drag-target-${isDragTarget}` : "",
	]
		.filter(Boolean)
		.join(" ");
	const blockProps = {
		className: blockClassName,
		"data-block-id": block.id,
		onDragEnd,
		onDragOver,
		onFocusCapture: onSetActive,
		onPointerDownCapture: onSetActive,
		onDrop,
	};

	if (block.type === "heading") {
		return (
			<section {...blockProps}>
				{controls}
				<EditableText
					as="h2"
					className="blog-admin-page__editable-chapter"
					onChange={onChange}
					placeholder="Chapter heading"
					value={text}
				/>
			</section>
		);
	}

	if (block.type === "subheading") {
		return (
			<section {...blockProps}>
				{controls}
				<EditableText
					as="h3"
					className="blog-admin-page__editable-subheading"
					onChange={onChange}
					placeholder="Section heading"
					value={text}
				/>
			</section>
		);
	}

	if (block.type === "quote") {
		return (
			<section {...blockProps}>
				{controls}
				<blockquote className="blog-admin-page__editable-quote">
					<EditableText
						as="p"
						onChange={onChange}
						placeholder="Pull quote"
						value={text}
					/>
				</blockquote>
			</section>
		);
	}

	if (block.type === "list") {
		const items = text
			.split("\n")
			.map((item) => item.trim())
			.filter(Boolean);

		return (
			<section {...blockProps}>
				{controls}
				<EditableText
					as="div"
					className="blog-admin-page__editable-list"
					onChange={onChange}
					placeholder="One list item per line"
					value={items.length ? items.join("\n") : ""}
				/>
			</section>
		);
	}

	if (block.type === "image") {
		const imageUploadControl = (
			<label className="blog-admin-page__image-inline-upload">
				<ImagePlus />
				<span>{image ? "Replace image" : "Upload image"}</span>
				<input
					type="file"
					accept="image/*"
					disabled={isUploading}
					onChange={onImageUpload}
				/>
			</label>
		);
		const imageSelectControl = images.length ? (
			<label className="blog-admin-page__image-inline-select">
				<span>Use saved image</span>
				<select
					value={image ? block.imageIndex : ""}
					onChange={(event) =>
						onImageSelect(Number(event.target.value))
					}
				>
					<option value="" disabled>
						Choose image
					</option>
					{images.map((availableImage, index) => (
						<option
							key={`${availableImage.src}-${index}`}
							value={index}
						>
							{index === 0 ? "Hero image" : `Image ${index + 1}`}{" "}
							{availableImage.alt
								? `- ${availableImage.alt}`
								: ""}
						</option>
					))}
				</select>
			</label>
		) : null;

		return image ? (
			<section {...blockProps}>
				{controls}
				<figure className="blog-admin-page__editable-figure">
					<div className="blog-admin-page__editable-figure-media">
						<img src={image.src} alt={image.alt || text || ""} />
						<div className="blog-admin-page__editable-figure-actions">
							{imageUploadControl}
							{imageSelectControl}
						</div>
					</div>
					<EditableText
						as="figcaption"
						onChange={onChange}
						placeholder="Image caption"
						value={text}
					/>
				</figure>
			</section>
		) : (
			<section {...blockProps}>
				{controls}
				<div className="blog-admin-page__preview-empty-image">
					<span>
						Choose an image from the sidebar, or upload one here.
					</span>
					<div className="blog-admin-page__preview-empty-actions">
						{imageUploadControl}
						{imageSelectControl}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section {...blockProps}>
			{controls}
			<EditableText
				as="p"
				className="blog-admin-page__editable-paragraph"
				onChange={onChange}
				placeholder="Click here to start writing..."
				value={text}
			/>
		</section>
	);
};

EditableText.propTypes = undefined;
EditableArticleBlock.propTypes = undefined;

export const BlogAdmin = () => {
	const [posts, setPosts] = useState([]);
	const [selectedPostId, setSelectedPostId] = useState("");
	const [form, setForm] = useState(emptyForm);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isArticlesPanelOpen, setIsArticlesPanelOpen] = useState(true);
	const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
	const [draggedBlockId, setDraggedBlockId] = useState("");
	const [dragTargetBlockId, setDragTargetBlockId] = useState("");
	const [dragTargetPosition, setDragTargetPosition] = useState("before");
	const [activeBlockId, setActiveBlockId] = useState("");
	const [drawerDragOffset, setDrawerDragOffset] = useState(0);
	const drawerDragStartY = useRef(null);
	const skipNextAutosaveRef = useRef(true);
	const [tagDraft, setTagDraft] = useState("");
	const [draftRecovery, setDraftRecovery] = useState(null);
	const [localDraftSavedAt, setLocalDraftSavedAt] = useState("");
	const [pendingDeletedImagePublicIds, setPendingDeletedImagePublicIds] =
		useState([]);
	const [deleteTargetPostId, setDeleteTargetPostId] = useState("");
	const [error, setError] = useState("");
	const [saveStatus, setSaveStatus] = useState("");
	const [uploadStatus, setUploadStatus] = useState("");
	const [lastSavedSnapshot, setLastSavedSnapshot] = useState(
		JSON.stringify(emptyForm),
	);
	const hasUnsavedChanges = useMemo(
		() => JSON.stringify(form) !== lastSavedSnapshot,
		[form, lastSavedSnapshot],
	);
	const bodyText = useMemo(
		() => editorBlocksToText(form.blocks),
		[form.blocks],
	);
	const readTimeDetails = useMemo(
		() => calculateReadTimeDetails(bodyText),
		[bodyText],
	);
	const bodyHasChapters = form.blocks.some(
		(block) => block.type === "heading",
	);
	const heroImage = form.images[0];
	const chapterBlocks = getChapterBlocks(form.blocks);
	const formTags = useMemo(() => parseTags(form.tags), [form.tags]);

	const getIsMobileViewport = () => {
		if (typeof window === "undefined") {
			return false;
		}

		if (window.matchMedia) {
			return window.matchMedia("(max-width: 768px)").matches;
		}

		if (window.innerWidth) {
			return window.innerWidth <= 768;
		}

		return false;
	};
	const [isMobile, setIsMobile] = useState(getIsMobileViewport);

	useEffect(() => {
		if (typeof window === "undefined") {
			return undefined;
		}

		const mediaQuery = window.matchMedia
			? window.matchMedia("(max-width: 768px)")
			: null;
		const updateIsMobile = () => {
			setIsMobile(getIsMobileViewport());
		};

		updateIsMobile();

		if (mediaQuery) {
			mediaQuery.addEventListener("change", updateIsMobile);

			return () => {
				mediaQuery.removeEventListener("change", updateIsMobile);
			};
		}

		window.addEventListener("resize", updateIsMobile);

		return () => {
			window.removeEventListener("resize", updateIsMobile);
		};
	}, []);

	useEffect(() => {
		const savedDraft = loadLocalDraft(selectedPostId);

		setDraftRecovery(savedDraft);
		setLocalDraftSavedAt(savedDraft?.updatedAt || "");
		skipNextAutosaveRef.current = true;
	}, [selectedPostId]);

	useEffect(() => {
		if (typeof window === "undefined" || isLoading) {
			return undefined;
		}

		if (skipNextAutosaveRef.current) {
			skipNextAutosaveRef.current = false;
			return undefined;
		}

		const timeoutId = window.setTimeout(() => {
			try {
				const payload = saveLocalDraft(selectedPostId, form);
				setLocalDraftSavedAt(payload?.updatedAt || "");
			} catch {
				setError(
					"Local draft could not be saved. Try removing one or two large images.",
				);
			}
		}, 1500);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [form, isLoading, selectedPostId]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return undefined;
		}

		const handleBeforeUnload = (event) => {
			if (!hasUnsavedChanges) {
				return;
			}

			event.preventDefault();
			event.returnValue = "";
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [hasUnsavedChanges]);

	useEffect(() => {
		if (hasUnsavedChanges && saveStatus === "Saved.") {
			setSaveStatus("");
		}
	}, [hasUnsavedChanges, saveStatus]);

	useEffect(() => {
		let isMounted = true;

		listBlogPosts({ all: true })
			.then(({ posts: loadedPosts }) => {
				if (!isMounted) {
					return;
				}

				const nextPosts = Array.isArray(loadedPosts) ? loadedPosts : [];

				setPosts(nextPosts);
				if (nextPosts[0]) {
					const nextForm = postToForm(nextPosts[0]);
					skipNextAutosaveRef.current = true;
					setSelectedPostId(nextPosts[0].id);
					setForm(nextForm);
					setLastSavedSnapshot(JSON.stringify(nextForm));
					setTagDraft("");
					setActiveBlockId("");
				}
			})
			.catch((requestError) => {
				if (isMounted) {
					setError(requestError.message || "Unable to load posts.");
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
		if (!isDetailsPanelOpen) {
			setDrawerDragOffset(0);
			drawerDragStartY.current = null;
		}
	}, [isDetailsPanelOpen]);

	const updateBlocks = (updater) => {
		setForm((current) => ({
			...current,
			blocks:
				typeof updater === "function"
					? updater(current.blocks)
					: updater,
		}));
	};

	const updateBlock = (blockId, updates) => {
		setActiveBlockId(blockId);
		updateBlocks((blocks) =>
			blocks.map((block) =>
				block.id === blockId ? { ...block, ...updates } : block,
			),
		);
	};

	const changeBlockType = (blockId, type) => {
		setActiveBlockId(blockId);
		updateBlocks((blocks) =>
			blocks.map((block) => {
				if (block.id !== blockId) {
					return block;
				}

				return {
					...block,
					type,
					imageIndex:
						type === "image"
							? Math.min(
									block.imageIndex ?? 0,
									Math.max(0, form.images.length - 1),
								)
							: block.imageIndex,
				};
			}),
		);
	};

	const addBlock = (
		type = "paragraph",
		afterIndex = form.blocks.length - 1,
	) => {
		const imageIndex =
			type === "image"
				? Math.min(0, Math.max(0, form.images.length - 1))
				: 0;
		const nextBlock = createBlock(type, { imageIndex });
		setActiveBlockId(nextBlock.id);
		updateBlocks((blocks) => {
			const nextBlocks = [...blocks];
			nextBlocks.splice(afterIndex + 1, 0, nextBlock);

			return nextBlocks;
		});
	};

	const addImageBlock = (imageIndex) => {
		const nextBlock = createBlock("image", {
			imageIndex,
			text: form.images[imageIndex]?.alt || "",
		});
		setActiveBlockId(nextBlock.id);
		updateBlocks((blocks) => [...blocks, nextBlock]);
	};

	const removeBlock = (blockId) => {
		setActiveBlockId((current) => (current === blockId ? "" : current));
		updateBlocks((blocks) => {
			const nextBlocks = blocks.filter((block) => block.id !== blockId);
			return nextBlocks.length ? nextBlocks : [createBlock("paragraph")];
		});
	};

	const moveBlock = (blockIndex, direction) => {
		const blockId = form.blocks[blockIndex]?.id || "";
		setActiveBlockId(blockId);
		updateBlocks((blocks) => {
			const nextIndex = blockIndex + direction;

			if (nextIndex < 0 || nextIndex >= blocks.length) {
				return blocks;
			}

			const nextBlocks = [...blocks];
			const [block] = nextBlocks.splice(blockIndex, 1);
			nextBlocks.splice(nextIndex, 0, block);

			return nextBlocks;
		});
	};

	const reorderBlock = (
		sourceBlockId,
		targetBlockId,
		targetPosition = "before",
	) => {
		if (
			!sourceBlockId ||
			!targetBlockId ||
			sourceBlockId === targetBlockId
		) {
			return;
		}

		setActiveBlockId(sourceBlockId);
		updateBlocks((blocks) => {
			const sourceIndex = blocks.findIndex(
				(block) => block.id === sourceBlockId,
			);
			const targetIndex = blocks.findIndex(
				(block) => block.id === targetBlockId,
			);

			if (sourceIndex === -1 || targetIndex === -1) {
				return blocks;
			}

			const nextBlocks = [...blocks];
			const [sourceBlock] = nextBlocks.splice(sourceIndex, 1);
			const nextTargetIndex = nextBlocks.findIndex(
				(block) => block.id === targetBlockId,
			);

			if (nextTargetIndex === -1) {
				return blocks;
			}

			nextBlocks.splice(
				nextTargetIndex + (targetPosition === "after" ? 1 : 0),
				0,
				sourceBlock,
			);

			return nextBlocks;
		});
	};

	const handleBlockDragStart = (event, blockId) => {
		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData("text/plain", blockId);
		setDraggedBlockId(blockId);
		setActiveBlockId(blockId);
	};

	const handleBlockDragOver = (event, blockId) => {
		if (!draggedBlockId || draggedBlockId === blockId) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = "move";
		const blockBounds = event.currentTarget.getBoundingClientRect();
		const nextPosition =
			event.clientY > blockBounds.top + blockBounds.height / 2
				? "after"
				: "before";

		setDragTargetBlockId(blockId);
		setDragTargetPosition(nextPosition);
	};

	const handleBlockDrop = (event, blockId) => {
		event.preventDefault();
		event.stopPropagation();
		const sourceBlockId =
			event.dataTransfer.getData("text/plain") || draggedBlockId;
		const blockBounds = event.currentTarget.getBoundingClientRect();
		const nextPosition =
			event.clientY > blockBounds.top + blockBounds.height / 2
				? "after"
				: "before";

		reorderBlock(sourceBlockId, blockId, nextPosition);
		setDraggedBlockId("");
		setDragTargetBlockId("");
		setDragTargetPosition("before");
	};

	const updateContainerDragTarget = (event) => {
		if (!draggedBlockId) {
			return null;
		}

		const blockElements = Array.from(
			event.currentTarget.querySelectorAll(
				".blog-admin-page__article-block",
			),
		);
		const availableBlocks = blockElements.filter(
			(element) => element.dataset.blockId !== draggedBlockId,
		);

		if (!availableBlocks.length) {
			return null;
		}

		const nextTarget =
			availableBlocks.find((element) => {
				const bounds = element.getBoundingClientRect();
				return event.clientY < bounds.top + bounds.height / 2;
			}) || availableBlocks[availableBlocks.length - 1];
		const targetBounds = nextTarget.getBoundingClientRect();
		const nextPosition =
			event.clientY < targetBounds.top + targetBounds.height / 2
				? "before"
				: "after";
		const nextTargetId = nextTarget.dataset.blockId;

		if (!nextTargetId) {
			return null;
		}

		setDragTargetBlockId(nextTargetId);
		setDragTargetPosition(nextPosition);
		return {
			blockId: nextTargetId,
			position: nextPosition,
		};
	};

	const handleBlockListDragOver = (event) => {
		if (!draggedBlockId) {
			return;
		}

		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
		updateContainerDragTarget(event);
	};

	const handleBlockListDrop = (event) => {
		if (!draggedBlockId) {
			return;
		}

		event.preventDefault();
		const dropTarget = updateContainerDragTarget(event);
		const sourceBlockId =
			event.dataTransfer.getData("text/plain") || draggedBlockId;

		reorderBlock(
			sourceBlockId,
			dropTarget?.blockId || dragTargetBlockId,
			dropTarget?.position || dragTargetPosition,
		);
		setDraggedBlockId("");
		setDragTargetBlockId("");
		setDragTargetPosition("before");
	};

	const handleBlockDragEnd = () => {
		setDraggedBlockId("");
		setDragTargetBlockId("");
		setDragTargetPosition("before");
	};

	const handleDrawerPointerDown = (event) => {
		drawerDragStartY.current = event.clientY;
		event.currentTarget.setPointerCapture?.(event.pointerId);
	};

	const handleDrawerPointerMove = (event) => {
		if (drawerDragStartY.current === null) {
			return;
		}

		const nextOffset = Math.max(
			0,
			event.clientY - drawerDragStartY.current,
		);
		setDrawerDragOffset(Math.min(nextOffset, 220));
	};

	const handleDrawerPointerEnd = () => {
		if (drawerDragOffset > 80) {
			setIsDetailsPanelOpen(false);
		}

		setDrawerDragOffset(0);
		drawerDragStartY.current = null;
	};

	const addTag = (value = tagDraft) => {
		const nextTags = parseTags(value);

		if (!nextTags.length) {
			return;
		}

		setForm((current) => {
			const existingTags = parseTags(current.tags);
			const mergedTags = [...existingTags];

			nextTags.forEach((nextTag) => {
				const hasTag = mergedTags.some(
					(tag) => tag.toLowerCase() === nextTag.toLowerCase(),
				);

				if (!hasTag) {
					mergedTags.push(nextTag);
				}
			});

			return {
				...current,
				tags: serializeTags(mergedTags),
			};
		});

		setTagDraft("");
	};

	const removeTag = (tagToRemove) => {
		setForm((current) => ({
			...current,
			tags: serializeTags(
				parseTags(current.tags).filter((tag) => tag !== tagToRemove),
			),
		}));
	};

	const confirmUnsavedChanges = () =>
		!hasUnsavedChanges ||
		window.confirm("You have unsaved blog changes. Leave without saving?");

	const handleSelectPost = (post) => {
		if (!confirmUnsavedChanges()) {
			return;
		}

		const nextForm = postToForm(post);
		skipNextAutosaveRef.current = true;
		setSelectedPostId(post.id);
		setForm(nextForm);
		setLastSavedSnapshot(JSON.stringify(nextForm));
		setTagDraft("");
		setActiveBlockId("");
		setPendingDeletedImagePublicIds([]);
		setError("");
		setSaveStatus("");
		setUploadStatus("");
	};

	const handleNewPost = () => {
		if (!confirmUnsavedChanges()) {
			return;
		}

		const nextBlock = createBlock("paragraph");
		const nextForm = {
			...emptyForm,
			blocks: [nextBlock],
		};
		skipNextAutosaveRef.current = true;
		setSelectedPostId("");
		setForm(nextForm);
		setLastSavedSnapshot(JSON.stringify(nextForm));
		setTagDraft("");
		setActiveBlockId(nextBlock.id);
		setPendingDeletedImagePublicIds([]);
		setError("");
		setSaveStatus("");
		setUploadStatus("");
	};

	const handleImageUpload = async (event, options = {}) => {
		const files = Array.from(event.target.files || []);
		if (!files.length) {
			return;
		}

		const imageFiles = files.filter((file) =>
			file.type.startsWith("image/"),
		);
		if (imageFiles.length !== files.length) {
			setError("Only image files can be uploaded.");
		}

		const oversizedFile = imageFiles.find(
			(file) => file.size > maxUploadSizeBytes,
		);
		if (oversizedFile) {
			setError("Images must be 3 MB or smaller.");
			event.target.value = "";
			return;
		}

		setIsUploading(true);
		setError("");

		try {
			const localImages = [];

			for (const file of imageFiles) {
				localImages.push(await createLocalImageFromFile(file));
			}

			setForm((current) => {
				const imageStartIndex = current.images.length;
				const nextImages = [...current.images, ...localImages];
				const firstNewImage = localImages[0];

				if (options.hero) {
					return promoteImageToHero(
						{
							...current,
							images: nextImages,
						},
						imageStartIndex,
					);
				}

				if (!options.blockId) {
					return {
						...current,
						images: nextImages,
					};
				}

				return {
					...current,
					images: nextImages,
					blocks: current.blocks.map((block) =>
						block.id === options.blockId
							? {
									...block,
									imageIndex: imageStartIndex,
									text:
										block.text || firstNewImage?.alt || "",
								}
							: block,
					),
				};
			});
		} catch (requestError) {
			setError(requestError.message || "Unable to prepare images.");
		} finally {
			setIsUploading(false);
			event.target.value = "";
		}
	};

	const handleImageAltChange = (imageIndex, alt) => {
		setForm((current) => ({
			...current,
			images: current.images.map((image, index) =>
				index === imageIndex ? { ...image, alt } : image,
			),
		}));
	};

	const promoteImageToHero = (current, imageIndex) => {
		if (imageIndex <= 0) {
			return current;
		}

		const heroImageCandidate = current.images[imageIndex];

		if (!heroImageCandidate) {
			return current;
		}

		const nextImages = [
			heroImageCandidate,
			...current.images.slice(0, imageIndex),
			...current.images.slice(imageIndex + 1),
		];
		const remapImageIndex = (currentIndex) => {
			if (currentIndex === imageIndex) {
				return 0;
			}

			if (currentIndex < imageIndex) {
				return currentIndex + 1;
			}

			return currentIndex;
		};

		return {
			...current,
			images: nextImages,
			blocks: current.blocks.map((block) =>
				block.type === "image"
					? {
							...block,
							imageIndex: remapImageIndex(block.imageIndex),
						}
					: block,
			),
		};
	};

	const handleSetHeroImage = (imageIndex) => {
		setForm((current) => promoteImageToHero(current, imageIndex));
	};

	const removeImageFromForm = (imageIndex) => {
		setForm((current) => ({
			...current,
			images: current.images.filter((_, index) => index !== imageIndex),
			blocks: current.blocks
				.filter(
					(block) =>
						block.type !== "image" ||
						block.imageIndex !== imageIndex,
				)
				.map((block) =>
					block.type === "image" && block.imageIndex > imageIndex
						? { ...block, imageIndex: block.imageIndex - 1 }
						: block,
				),
		}));
	};

	const handleRemoveImage = (imageIndex) => {
		const image = form.images[imageIndex];

		if (!image) {
			return;
		}

		if (!isLocalImage(image) && image.publicId) {
			setPendingDeletedImagePublicIds((current) =>
				current.includes(image.publicId)
					? current
					: [...current, image.publicId],
			);
		}

		removeImageFromForm(imageIndex);
	};

	const uploadLocalImagesForSave = async (draftForm) => {
		const images = [];
		let didUpload = false;
		const localImages = normalizeFormImages(draftForm.images).filter(
			isLocalImage,
		);
		let uploadedCount = 0;

		for (const image of normalizeFormImages(draftForm.images)) {
			if (!isLocalImage(image)) {
				images.push(image);
				continue;
			}

			didUpload = true;
			uploadedCount += 1;
			const imageName =
				image.fileName || image.alt || `image ${uploadedCount}`;
			setUploadStatus(
				`Uploading ${imageName} (${uploadedCount}/${localImages.length})...`,
			);

			let uploadedImage;
			try {
				({ image: uploadedImage } = await uploadImage({
					alt: image.alt,
					file: image.src,
					fileName: image.fileName,
				}));
			} catch (uploadError) {
				throw new Error(
					`Failed to upload ${imageName}: ${
						uploadError.message || "Cloudinary upload failed."
					}`,
				);
			}

			images.push({
				...uploadedImage,
				alt: uploadedImage.alt || image.alt,
				isLocal: false,
			});
		}

		return {
			didUpload,
			form: {
				...draftForm,
				images,
			},
		};
	};

	const handleRestoreLocalDraft = () => {
		if (!draftRecovery?.form) {
			return;
		}

		setForm(draftRecovery.form);
		setDraftRecovery(null);
		setActiveBlockId("");
		setPendingDeletedImagePublicIds([]);
		setError("");
	};

	const handleDiscardLocalDraft = () => {
		if (draftRecovery?.storageKey) {
			removeLocalDraft(draftRecovery.storageKey);
		}

		setDraftRecovery(null);
		setLocalDraftSavedAt("");
	};

	const handleSave = async () => {
		const currentDraftKey = getLocalDraftStorageKey(selectedPostId);
		const nextId = selectedPostId || slugify(form.title);
		const draftPost = formToPost(form, nextId);

		if (
			!draftPost.id ||
			!draftPost.title ||
			!draftPost.excerpt ||
			!draftPost.body.length
		) {
			setError("Add a title, excerpt, and body before saving.");
			return;
		}

		setIsSaving(true);
		setIsUploading(
			form.images.some(isLocalImage) ||
				pendingDeletedImagePublicIds.length > 0,
		);
		setError("");
		setSaveStatus("Saving post...");
		setUploadStatus("");

		try {
			const { didUpload, form: cloudinaryForm } =
				await uploadLocalImagesForSave(form);
			if (didUpload) {
				skipNextAutosaveRef.current = true;
				setForm(cloudinaryForm);
			}

			const nextPost = formToPost(cloudinaryForm, nextId);
			setSaveStatus("Saving post content...");
			const { posts: nextPosts, post: savedPost } =
				await saveBlogPost(nextPost);
			setPosts(nextPosts);

			if (savedPost) {
				if (pendingDeletedImagePublicIds.length) {
					setUploadStatus("Removing deleted Cloudinary images...");
					await Promise.all(
						pendingDeletedImagePublicIds.map((publicId) =>
							deleteImage({ publicId }),
						),
					);
					setPendingDeletedImagePublicIds([]);
				}

				removeLocalDraft(currentDraftKey);
				removeLocalDraft(savedPost.id);
				setDraftRecovery(null);
				setLocalDraftSavedAt("");
				skipNextAutosaveRef.current = true;
				setSelectedPostId(savedPost.id);
				const nextForm = postToForm(savedPost);
				setForm(nextForm);
				setLastSavedSnapshot(JSON.stringify(nextForm));
				setTagDraft("");
				setSaveStatus("Saved.");
				setUploadStatus("");
			}
		} catch (requestError) {
			setError(requestError.message || "Unable to save post.");
			setSaveStatus("");
		} finally {
			setIsSaving(false);
			setIsUploading(false);
		}
	};

	const handleRequestDelete = (postId) => {
		if (!postId) {
			return;
		}

		setDeleteTargetPostId(postId);
	};

	const handleCancelDelete = () => {
		setDeleteTargetPostId("");
	};

	const handleConfirmDelete = () => {
		const postId = deleteTargetPostId;
		if (!postId) {
			return;
		}

		setError("");
		deleteBlogPost(postId)
			.then(({ posts: nextPosts }) => {
				setPosts(nextPosts);

				if (selectedPostId === postId) {
					const nextBlock = createBlock("paragraph");
					const nextForm = {
						...emptyForm,
						blocks: [nextBlock],
					};
					skipNextAutosaveRef.current = true;
					setSelectedPostId("");
					setForm(nextForm);
					setLastSavedSnapshot(JSON.stringify(nextForm));
					setTagDraft("");
					setActiveBlockId(nextBlock.id);
					setPendingDeletedImagePublicIds([]);
				}

				setDeleteTargetPostId("");
			})
			.catch((requestError) => {
				setError(requestError.message || "Unable to delete post.");
			});
	};

	const handleTogglePublish = (postId) => {
		setError("");
		toggleBlogPostPublish(postId)
			.then(({ posts: nextPosts, post: updatedPost }) => {
				setPosts(nextPosts);

				if (updatedPost && selectedPostId === postId) {
					const nextForm = postToForm(updatedPost);
					setForm(nextForm);
					setLastSavedSnapshot(JSON.stringify(nextForm));
				}
			})
			.catch((requestError) => {
				setError(requestError.message || "Unable to update post.");
			});
	};

	const handleLogout = () => {
		fetch("/api/blog-logout", {
			method: "POST",
			credentials: "same-origin",
		}).finally(() => {
			window.location.href = "/login";
		});
	};

	const handleClickOutside = (event) => {
		if (
			!event.target.closest(".blog-admin-page__article-block.is-active")
		) {
			setActiveBlockId("");
		}
	};

	const heroUploadControl = (
		<label className="blog-admin-page__image-inline-upload">
			<ImagePlus />
			<span>{heroImage ? "Replace hero" : "Upload hero"}</span>
			<input
				type="file"
				accept="image/*"
				disabled={isUploading}
				onChange={(event) => handleImageUpload(event, { hero: true })}
			/>
		</label>
	);
	const heroSelectControl = form.images.length ? (
		<label className="blog-admin-page__image-inline-select">
			<span>Use saved hero image</span>
			<select
				value={heroImage ? 0 : ""}
				onChange={(event) =>
					handleSetHeroImage(Number(event.target.value))
				}
			>
				<option value="" disabled>
					Choose hero
				</option>
				{form.images.map((availableImage, index) => (
					<option
						key={`${availableImage.src}-${index}`}
						value={index}
					>
						{index === 0 ? "Current hero" : `Image ${index + 1}`}{" "}
						{availableImage.alt ? `- ${availableImage.alt}` : ""}
					</option>
				))}
			</select>
		</label>
	) : null;

	return (
		<div className="blog-admin-page" onClick={handleClickOutside}>
			<div
				className={`blog-admin-page__shell${
					isArticlesPanelOpen
						? ""
						: " blog-admin-page__shell--articles-collapsed"
				}${
					isDetailsPanelOpen
						? ""
						: " blog-admin-page__shell--details-collapsed"
				}`}
			>
				<aside className="blog-admin-page__sidebar">
					<div className="blog-admin-page__sidebar-header">
						<h2>Articles</h2>
						<Button
							type="button"
							variant="icon"
							onClick={() =>
								setIsArticlesPanelOpen((isOpen) => !isOpen)
							}
							aria-label={
								isArticlesPanelOpen
									? "Collapse articles panel"
									: "Expand articles panel"
							}
						>
							{isMobile ? (
								isArticlesPanelOpen ? (
									<PanelTopClose />
								) : (
									<PanelTopOpen />
								)
							) : isArticlesPanelOpen ? (
								<PanelRightOpen />
							) : (
								<PanelRightClose />
							)}
						</Button>
					</div>

					<Button
						type="button"
						variant="outline-accent"
						centered
						onClick={handleNewPost}
					>
						<Plus />
						New Post
					</Button>

					<div className="blog-admin-page__list">
						{isLoading ? (
							<>
								<span className="sr-only">
									Loading posts...
								</span>
								{Array.from({ length: 4 }, (_, index) => (
									<BlogPostSkeleton key={index} />
								))}
							</>
						) : null}
						{!isLoading && posts.length === 0 ? (
							<div className="blog-admin-page__empty-state">
								<strong>No posts yet</strong>
								<span>
									Create your first article and save it here.
								</span>
							</div>
						) : null}
						{posts.map((post) => (
							<div
								key={post.id}
								className={`blog-admin-page__list-item${selectedPostId === post.id ? " is-active" : ""}`}
							>
								<button
									type="button"
									onClick={() => handleSelectPost(post)}
								>
									<span>{post.title}</span>
									<small>
										{post.published === false
											? "Draft"
											: "Published"}{" "}
										- {post.readTime}
									</small>
								</button>
							</div>
						))}
					</div>
				</aside>

				<div
					className={`blog-admin-page__main ${
						error || draftRecovery || saveStatus || uploadStatus
							? "has-status-row"
							: ""
					}`}
				>
					<header className="blog-admin-page__topbar">
						<Link
							to="/blog"
							className="blog-admin-page__back-link"
							onClick={(event) => {
								if (!confirmUnsavedChanges()) {
									event.preventDefault();
								}
							}}
						>
							<ArrowLeft />
							Back to Blogs
						</Link>
						<div className="blog-admin-page__topbar-title">
							<h1>{selectedPostId ? "Edit Post" : "New Post"}</h1>
							<p>
								{readTimeDetails.wordCount} words -{" "}
								{readTimeDetails.readTime}
							</p>
							{localDraftSavedAt ? (
								<p className="blog-admin-page__autosave-status">
									Local draft saved{" "}
									{formatLocalDraftTime(localDraftSavedAt)}
								</p>
							) : null}
							<p className="blog-admin-page__save-state">
								{hasUnsavedChanges
									? "Unsaved changes"
									: saveStatus || "All changes saved"}
							</p>
						</div>
						<div className="blog-admin-page__toolbar-actions">
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									setForm((current) => ({
										...current,
										published: !current.published,
									}))
								}
							>
								{form.published ? <Eye /> : <EyeOff />}
								{form.published ? "Published" : "Draft"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									handleRequestDelete(selectedPostId)
								}
								disabled={!selectedPostId}
								state={"negative"}
							>
								<Trash />
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
							<Button
								type="button"
								variant="icon"
								className="blog-admin-page__panel-toggle"
								onClick={() =>
									setIsDetailsPanelOpen((isOpen) => !isOpen)
								}
								aria-label={
									isDetailsPanelOpen
										? "Collapse details panel"
										: "Expand details panel"
								}
							>
								{isMobile ? (
									isDetailsPanelOpen ? (
										<PanelTopOpen />
									) : (
										<PanelTopClose />
									)
								) : isDetailsPanelOpen ? (
									<PanelRightClose />
								) : (
									<PanelRightOpen />
								)}
							</Button>
						</div>
					</header>

					{error || draftRecovery || saveStatus || uploadStatus ? (
						<div className="blog-admin-page__status">
							{error ? (
								<p className="is-error">{error}</p>
							) : null}

							{uploadStatus ? (
								<p>{uploadStatus}</p>
							) : null}

							{saveStatus && !uploadStatus ? (
								<p>{saveStatus}</p>
							) : null}

							{draftRecovery ? (
								<div className="blog-admin-page__draft-recovery">
									<div>
										<strong>Local draft available</strong>
										<span>
											Saved{" "}
											{formatLocalDraftTime(
												draftRecovery.updatedAt,
											)}
											. Restore your unsaved changes?
										</span>
									</div>
									<div className="blog-admin-page__draft-recovery-actions">
										<Button
											type="button"
											variant="outline"
											onClick={handleRestoreLocalDraft}
										>
											Restore draft
										</Button>
										<Button
											type="button"
											variant="icon"
											onClick={handleDiscardLocalDraft}
											aria-label="Discard local draft"
										>
											<Trash2 />
										</Button>
									</div>
								</div>
							) : null}
						</div>
					) : null}

					<div className="blog-admin-page__workspace">
						{isLoading ? (
							<BlogAdminEditorSkeleton />
						) : (
							<>
								<main
									className="blog-admin-page__writing-panel"
									onDragOver={handleBlockListDragOver}
									onDrop={handleBlockListDrop}
								>
									<div className="blog-admin-page__block-toolbar">
										{blockOptionGroups.map(
											(group, groupIndex) => (
												<div
													className="blog-admin-page__block-toolbar-group"
													key={group.join("-")}
												>
													{groupIndex > 0 ? (
														<span
															className="blog-admin-page__block-toolbar-divider"
															aria-hidden="true"
														/>
													) : null}
													{group.map((type) => {
														const option =
															getBlockOption(
																type,
															);
														if (!option) {
															return null;
														}

														const Icon =
															option.icon;

														return (
															<Button
																key={
																	option.type
																}
																type="button"
																variant="outline"
																onClick={() =>
																	addBlock(
																		option.type,
																	)
																}
															>
																<Icon />
																{!isMobile &&
																	option.label}
															</Button>
														);
													})}
												</div>
											),
										)}
									</div>

									<article
										className="blog-admin-page__document"
										onDragOver={handleBlockListDragOver}
										onDrop={handleBlockListDrop}
									>
										{heroImage ? (
											<figure className="blog-admin-page__document-hero">
												<div className="blog-admin-page__document-hero-media blog-admin-page__editable-figure-media">
													<img
														src={heroImage.src}
														alt={
															heroImage.alt || ""
														}
													/>
													<div className="blog-admin-page__editable-figure-actions">
														{heroUploadControl}
														{heroSelectControl}
													</div>
												</div>
												<EditableText
													as="figcaption"
													onChange={(value) =>
														handleImageAltChange(
															0,
															value,
														)
													}
													placeholder="Hero image caption"
													value={heroImage.alt || ""}
												/>
											</figure>
										) : (
											<div className="blog-admin-page__document-hero blog-admin-page__preview-empty-image">
												<span>
													Add a hero image, or choose
													one from the image library.
												</span>
												<div className="blog-admin-page__preview-empty-actions">
													{heroUploadControl}
													{heroSelectControl}
												</div>
											</div>
										)}

										<div className="blog-admin-page__document-header">
											<p className="blog-admin-page__document-kicker">
												Writing Desk
											</p>
											<EditableText
												as="h1"
												className="blog-admin-page__document-title"
												onChange={(value) =>
													setForm((current) => ({
														...current,
														title: value,
													}))
												}
												placeholder="Untitled blog post"
												value={form.title}
											/>
											<EditableText
												as="p"
												className="blog-admin-page__document-excerpt"
												onChange={(value) =>
													setForm((current) => ({
														...current,
														excerpt: value,
													}))
												}
												placeholder="Write a short excerpt for the post."
												value={form.excerpt}
											/>
											<div className="blog-admin-page__document-meta">
												<span>
													<CalendarDays />
													{form.date || today}
												</span>
												<span>
													<Clock3 />
													{readTimeDetails.readTime}
												</span>
											</div>
										</div>

										<div className="blog-admin-page__document-layout">
											<aside className="blog-admin-page__document-toc">
												<span>Chapters</span>
												<ol>
													{chapterBlocks.length ? (
														chapterBlocks.map(
															(chapter) => (
																<li
																	key={
																		chapter.id
																	}
																>
																	<small>
																		{
																			chapter.label
																		}
																	</small>
																	{chapter.text ||
																		"Chapter heading"}
																</li>
															),
														)
													) : (
														<li>
															<small>01</small>
															Auto chapters
														</li>
													)}
												</ol>
											</aside>

											<div
												className="blog-admin-page__document-body"
												onDragOver={
													handleBlockListDragOver
												}
												onDrop={handleBlockListDrop}
											>
												{form.blocks.map(
													(block, index) => (
														<EditableArticleBlock
															key={block.id}
															block={block}
															canMoveDown={
																index <
																form.blocks
																	.length -
																	1
															}
															canMoveUp={
																index > 0
															}
															isDragging={
																draggedBlockId ===
																block.id
															}
															isDragTarget={
																dragTargetBlockId ===
																block.id
																	? dragTargetPosition
																	: ""
															}
															isActive={
																activeBlockId ===
																block.id
															}
															images={form.images}
															isUploading={
																isUploading
															}
															onImageUpload={(
																event,
															) =>
																handleImageUpload(
																	event,
																	{
																		blockId:
																			block.id,
																	},
																)
															}
															onImageSelect={(
																imageIndex,
															) =>
																updateBlock(
																	block.id,
																	{
																		imageIndex,
																		text:
																			block.text ||
																			form
																				.images[
																				imageIndex
																			]
																				?.alt ||
																			"",
																	},
																)
															}
															onAddBelow={() =>
																addBlock(
																	"paragraph",
																	index,
																)
															}
															onChange={(value) =>
																updateBlock(
																	block.id,
																	{
																		text: value,
																	},
																)
															}
															onDragEnd={
																handleBlockDragEnd
															}
															onDragOver={(
																event,
															) =>
																handleBlockDragOver(
																	event,
																	block.id,
																)
															}
															onDragStart={(
																event,
															) =>
																handleBlockDragStart(
																	event,
																	block.id,
																)
															}
															onDrop={(event) =>
																handleBlockDrop(
																	event,
																	block.id,
																)
															}
															onMoveDown={() =>
																moveBlock(
																	index,
																	1,
																)
															}
															onMoveUp={() =>
																moveBlock(
																	index,
																	-1,
																)
															}
															onRemove={() =>
																removeBlock(
																	block.id,
																)
															}
															onSetActive={() =>
																setActiveBlockId(
																	block.id,
																)
															}
															onTypeChange={(
																type,
															) =>
																changeBlockType(
																	block.id,
																	type,
																)
															}
														/>
													),
												)}
											</div>
										</div>
									</article>
								</main>

								<button
									type="button"
									className="blog-admin-page__drawer-backdrop"
									onClick={() => setIsDetailsPanelOpen(false)}
									aria-label="Close post details"
								/>

								<aside
									className="blog-admin-page__side-panel"
									aria-label="Post details and images"
									style={{
										"--drawer-drag-offset": `${drawerDragOffset}px`,
									}}
								>
									<button
										type="button"
										className="blog-admin-page__drawer-handle"
										onPointerDown={handleDrawerPointerDown}
										onPointerMove={handleDrawerPointerMove}
										onPointerCancel={handleDrawerPointerEnd}
										onPointerUp={handleDrawerPointerEnd}
										aria-label="Drag down to close post details"
									/>
									<section className="blog-admin-page__panel-section blog-admin-page__details-card">
										<h3>Post details</h3>
										<div className="blog-admin-page__metadata-list">
											<div className="blog-admin-page__metadata-row">
												<span className="blog-admin-page__metadata-label">
													Date
												</span>
												<time
													className="blog-admin-page__metadata-value"
													dateTime={form.date}
												>
													{formatDisplayDate(
														form.date,
													)}
												</time>
											</div>
											<label className="blog-admin-page__metadata-row blog-admin-page__metadata-row--input">
												<span className="blog-admin-page__metadata-label">
													Tags
												</span>
												<div className="blog-admin-page__tag-editor">
													<input
														type="text"
														placeholder="Add a tag"
														value={tagDraft}
														onBlur={() => addTag()}
														onChange={(event) =>
															setTagDraft(
																event.target
																	.value,
															)
														}
														onKeyDown={(event) => {
															if (
																event.key ===
																	"Enter" ||
																event.key ===
																	","
															) {
																event.preventDefault();
																addTag();
															}
														}}
													/>
													<div
														className="blog-admin-page__tag-list"
														aria-label="Post tags"
													>
														{formTags.length ? (
															formTags.map(
																(tag) => (
																	<button
																		key={
																			tag
																		}
																		type="button"
																		onClick={() =>
																			removeTag(
																				tag,
																			)
																		}
																		title={`Remove ${tag}`}
																	>
																		{tag}
																		<span aria-hidden="true">
																			x
																		</span>
																	</button>
																),
															)
														) : (
															<span className="blog-admin-page__tag-empty">
																No tags yet -
																add one above.
															</span>
														)}
													</div>
												</div>
											</label>
										</div>
										<div className="blog-admin-page__status-grid">
											<span>
												{form.published
													? "Published"
													: "Draft"}
											</span>
											<span>
												{bodyHasChapters
													? "Chapters set"
													: "Auto chapters"}
											</span>
											<span>
												{form.images.length} images
											</span>
										</div>
									</section>

									<section className="blog-admin-page__panel-section">
										<h3>Images</h3>
										<label className="blog-admin-page__upload-dropzone">
											<ImagePlus className="w-5 h-5" />
											<span>
												{isUploading
													? "Preparing..."
													: "Add local images"}
											</span>
											<input
												type="file"
												accept="image/*"
												multiple
												disabled={isUploading}
												onChange={handleImageUpload}
											/>
										</label>
										<small className="blog-admin-page__field-note">
											Images stay local while you edit and
											upload to Cloudinary when you save.
											Removed saved images are deleted
											from Cloudinary on save.
										</small>

										{form.images.length ? (
											<div className="blog-admin-page__image-list">
												{form.images.map(
													(image, index) => (
														<div
															className="blog-admin-page__image-item"
															key={`${image.src}-${index}`}
														>
															<img
																src={image.src}
																alt={
																	image.alt ||
																	""
																}
															/>
															<div className="blog-admin-page__image-fields">
																<label>
																	<span>
																		Alt text
																	</span>
																	<input
																		type="text"
																		value={
																			image.alt
																		}
																		onChange={(
																			event,
																		) =>
																			handleImageAltChange(
																				index,
																				event
																					.target
																					.value,
																			)
																		}
																	/>
																</label>
																<small>
																	{index === 0
																		? "Hero"
																		: `Image ${index + 1}`}{" "}
																	{formatImageMeta(
																		image,
																	)}
																</small>
															</div>
															<div className="blog-admin-page__image-actions">
																<Button
																	type="button"
																	variant="outline"
																	onClick={() =>
																		handleSetHeroImage(
																			index,
																		)
																	}
																	disabled={
																		index ===
																		0
																	}
																>
																	{index === 0
																		? "Hero"
																		: "Make hero"}
																</Button>
																<Button
																	type="button"
																	variant="outline"
																	onClick={() =>
																		addImageBlock(
																			index,
																		)
																	}
																>
																	<ImagePlus />
																	Place
																</Button>
																<Button
																	type="button"
																	variant="icon"
																	onClick={() =>
																		handleRemoveImage(
																			index,
																		)
																	}
																	aria-label="Remove image"
																>
																	<Trash2 />
																</Button>
															</div>
														</div>
													),
												)}
											</div>
										) : (
											<div className="blog-admin-page__empty-state">
												<strong>No images yet</strong>
												<span>
													Add screenshots or photos,
													then place them into the
													article.
												</span>
											</div>
										)}
									</section>
								</aside>
							</>
						)}
					</div>
				</div>
			</div>
			<ConfirmDialog
				isOpen={Boolean(deleteTargetPostId)}
				title="Delete this post?"
				description="This removes the post from the blog archive. The action cannot be undone."
				confirmLabel="Delete post"
				onCancel={handleCancelDelete}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
};
