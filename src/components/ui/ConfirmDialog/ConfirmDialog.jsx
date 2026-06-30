import PropTypes from "prop-types";
import { Button } from "../Button/Button";
import "./ConfirmDialog.css";

export const ConfirmDialog = ({
	cancelLabel = "Cancel",
	confirmLabel = "Delete",
	description,
	isOpen,
	onCancel,
	onConfirm,
	title,
}) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="confirm-dialog" role="presentation">
			<button
				type="button"
				className="confirm-dialog__backdrop"
				onClick={onCancel}
				aria-label="Close dialog"
			/>
			<section
				className="confirm-dialog__panel"
				role="dialog"
				aria-modal="true"
				aria-labelledby="confirm-dialog-title"
			>
				<div>
					<h2 id="confirm-dialog-title">{title}</h2>
					<p>{description}</p>
				</div>
				<div className="confirm-dialog__actions">
					<Button type="button" variant="outline" onClick={onCancel}>
						{cancelLabel}
					</Button>
					<Button
						type="button"
						variant="outline"
						className="confirm-dialog__danger"
						state="negative"
						onClick={onConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</section>
		</div>
	);
};

ConfirmDialog.propTypes = {
	cancelLabel: PropTypes.string,
	confirmLabel: PropTypes.string,
	description: PropTypes.string.isRequired,
	isOpen: PropTypes.bool.isRequired,
	onCancel: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
};
