import { Button } from "@repo/ui/components/button.tsx";
import LogoIcon from "@repo/ui/icons/logo-icon.tsx";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils";
import { openWaitlist } from "../lib/waitlist";

export default function HeaderWaitlist() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 0);
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={cn(
				"sticky top-0 z-40 transition-all duration-300 border-b",
				isScrolled || mobileMenuOpen
					? "bg-white/90 backdrop-blur-md border-black/[0.04]"
					: "bg-white/0 backdrop-blur-none border-transparent",
			)}
		>
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-20">
					{/* Left: Brand Logo & Persona Toggle */}
					<div className="flex items-center gap-4 sm:gap-6">
						<Link
							to="/"
							className="flex items-center transition-opacity hover:opacity-90"
						>
							<LogoIcon className="h-8 sm:h-9 w-auto" />
						</Link>
					</div>

					{/* Right: CTA & Mobile Toggle */}
					<div className="flex items-center gap-3">
						<Button
							variant="black"
							onClick={openWaitlist}
							className="hidden lg:inline-flex rounded-full text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 h-auto transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
						>
							Join the waitlist
						</Button>

						{/* Mobile Menu Button */}
						<button
							type="button"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-black/5 transition"
							aria-label="Toggle Navigation"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{mobileMenuOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Dropdown Menu */}
				{mobileMenuOpen && (
					<div className="hidden:hidden py-4 border-t border-black/5 animate-in slide-in-from-top-2 duration-150">
						<div className="pt-3 px-2">
							<Button
								variant="black"
								onClick={() => {
									setMobileMenuOpen(false);
									openWaitlist();
								}}
								className="w-full rounded-full text-sm font-semibold py-2.5 h-auto shadow-sm"
							>
								Join the waitlist
							</Button>
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
