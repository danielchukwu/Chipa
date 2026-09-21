import LogoIcon from "@repo/ui/icons/logo-icon";
import { useEffect, useState } from "react";

interface WaitlistModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function WaitlistModal({
	isOpen: controlledIsOpen,
	onClose: controlledOnClose,
}: Partial<WaitlistModalProps>) {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);

	const isOpen = controlledIsOpen ?? internalIsOpen;
	const onClose = controlledOnClose ?? (() => setInternalIsOpen(false));

	useEffect(() => {
		const handleOpen = () => setInternalIsOpen(true);
		window.addEventListener("chipa:open-waitlist", handleOpen);
		return () => window.removeEventListener("chipa:open-waitlist", handleOpen);
	}, []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		if (isOpen) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleKeyDown);
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return;
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			setSubmitted(true);
		}, 600);
	};

	const handleReset = () => {
		setSubmitted(false);
		setEmail("");
		onClose();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
				onClick={handleReset}
				aria-hidden="true"
			/>

			{/* Modal Dialog */}
			<div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left shadow-2xl transition-all border border-gray-100 z-10 animate-in fade-in zoom-in-95 duration-200">
				{/* Close button */}
				<button
					onClick={handleReset}
					type="button"
					className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
					aria-label="Close"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<div className="mb-6">
					<LogoIcon className="h-8 w-auto text-black" />
				</div>

				{!submitted ? (
					<>
						<h3 className="font-display font-bold text-2xl sm:text-3xl text-[#111111] tracking-tight">
							Join the waitlist
						</h3>
						<p className="mt-2 text-sm sm:text-base text-[#666666] leading-relaxed">
							Get paid globally, live locally. Be among the first to experience
							seamless multi-currency banking with Chipa.
						</p>

						<form onSubmit={handleSubmit} className="mt-6 space-y-4">
							<div>
								<label htmlFor="waitlist-email" className="sr-only">
									Email address
								</label>
								<input
									id="waitlist-email"
									type="email"
									required
									placeholder="Enter your email address"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full rounded-full border border-gray-300 px-5 py-3.5 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:border-[#FF793F] focus:outline-none focus:ring-2 focus:ring-[#FF793F]/20 transition"
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full rounded-full bg-[#18181B] hover:bg-black text-white font-semibold py-3.5 px-6 text-sm sm:text-base transition-all duration-150 hover:shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<svg
											className="animate-spin h-5 w-5 text-white"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											/>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											/>
										</svg>
										<span>Securing your spot...</span>
									</>
								) : (
									<span>Claim Early Access</span>
								)}
							</button>
						</form>
					</>
				) : (
					<div className="py-6 text-center">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#009A49]/10 text-[#009A49] mb-4">
							<svg
								className="w-8 h-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2.5}
									d="M5 13l4 4L19 7"
								/>
							</svg>
						</div>
						<h4 className="font-display font-bold text-2xl text-[#111111]">
							You're on the list!
						</h4>
						<p className="mt-2 text-sm text-[#666666]">
							Thanks for joining. We've reserved your spot and will send early
							access details to{" "}
							<span className="font-semibold text-gray-900">{email}</span> soon.
						</p>
						<button
							onClick={handleReset}
							type="button"
							className="mt-6 inline-flex rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 text-sm font-semibold transition"
						>
							Done
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
