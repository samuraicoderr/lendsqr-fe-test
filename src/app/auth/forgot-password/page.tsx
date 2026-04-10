"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import styles from "../Auth.module.scss";
import FrontendLinks from "@/lib/FrontendLinks";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const validateEmail = (value: string) => {
		if (!value.trim()) {
			return "Email is required";
		}

		if (!/\S+@\S+\.\S+/.test(value)) {
			return "Please enter a valid email";
		}

		return "";
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const validationError = validateEmail(email);
		setError(validationError);

		if (validationError) {
			return;
		}

		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 1200));
		setIsLoading(false);
		setIsSubmitted(true);
	};

	if (isSubmitted) {
		return (
			<>
				<h1 className={styles.title}>Check your inbox</h1>
				<p className={styles.subtitle}>
					If an account exists for <strong>{email}</strong>, you will receive reset instructions shortly.
				</p>

				<Link href={FrontendLinks.login} className={styles.submitButton}>
					BACK TO LOGIN
				</Link>
			</>
		);
	}

	return (
		<>
			<h1 className={styles.title}>Forgot Password?</h1>
			<p className={styles.subtitle}>Enter the email linked to your account to reset your password.</p>

			<form onSubmit={handleSubmit} className={styles.form} noValidate>
				<div className={styles.inputGroup}>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(event) => {
							setEmail(event.target.value);
							if (error) {
								setError("");
							}
						}}
						className={`${styles.input} ${error ? styles.inputError : ""}`}
						placeholder="Email"
						aria-label="Email address"
						aria-invalid={Boolean(error)}
						aria-describedby={error ? "email-error" : undefined}
						autoComplete="email"
					/>
					{error && (
						<span id="email-error" className={styles.errorMessage} role="alert">
							{error}
						</span>
					)}
				</div>

				<button type="submit" className={styles.submitButton} disabled={isLoading} aria-busy={isLoading}>
					{isLoading ? (
						<span className={styles.spinner}>
							<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
								<path d="M12 2C6.48 2 2 6.48 2 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
							</svg>
						</span>
					) : (
						"SEND RESET LINK"
					)}
				</button>

				<Link href={FrontendLinks.login} className={styles.forgotLink}>
					BACK TO LOGIN
				</Link>
			</form>
		</>
	);
}
