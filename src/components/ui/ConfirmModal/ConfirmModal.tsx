"use client";

import React from "react";
import styles from "./ConfirmModal.module.scss";

interface ConfirmModalProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "primary" | "success";
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
	open,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "danger",
	loading = false,
	onConfirm,
	onCancel,
}) => {
	if (!open) return null;

	return (
		<div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				<h2 id="confirm-title" className={styles.title}>{title}</h2>
				<p className={styles.message}>{message}</p>
				<div className={styles.actions}>
					<button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>{cancelLabel}</button>
					<button className={`${styles.confirmBtn} ${styles[variant]}`} onClick={onConfirm} disabled={loading}>
						{loading ? "Processing..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmModal;
