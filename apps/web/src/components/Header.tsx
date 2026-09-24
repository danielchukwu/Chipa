import { Button } from "@repo/ui/components/button.tsx";
import LogoIcon from "@repo/ui/icons/logo-icon.tsx";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils";
import { openWaitlist } from "../lib/waitlist";

interface TabButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive: boolean;
}

function TabButton({
	isActive,
	children,
	className,
	...props
}: TabButtonProps) {
	return (
		<button
			type="button"
			className={cn(
				"px-3.5 h-full flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer",
				isActive
					? "bg-[#18181B] text-white shadow-sm"
					: "text-[#666666] hover:text-black",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export default function Header() {
	const [activeTab, setActiveTab] = useState<"personal" | "buisness">(
		"personal",
	);
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

						{/* Persona Switcher */}
						<div className="hidden h-11 sm:inline-flex items-center bg-black/5 rounded-full p-1 text-sm font-semibold">
							<TabButton
								isActive={activeTab === "personal"}
								onClick={() => setActiveTab("personal")}
							>
								Personal
							</TabButton>
							<TabButton
								isActive={activeTab === "buisness"}
								onClick={() => setActiveTab("buisness")}
							>
								Buisness
							</TabButton>
						</div>
					</div>

					{/* Center: Navigation Links */}
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
						<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#444444]">
							<a
								href="#products"
								className="hover:text-black transition-colors"
							>
								Products
							</a>
							<a href="#company" className="hover:text-black transition-colors">
								Company
							</a>
							<a href="#blog" className="hover:text-black transition-colors">
								Blog
							</a>
							<a href="#support" className="hover:text-black transition-colors">
								Support
							</a>
						</nav>
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
						<div className="flex items-center justify-center mb-4 bg-[#EFECE8] rounded-full p-1 text-xs font-semibold max-w-xs mx-auto">
							<TabButton
								isActive={activeTab === "personal"}
								onClick={() => setActiveTab("personal")}
								className="flex-1 py-1.5 h-auto text-xs"
							>
								Personal
							</TabButton>
							<TabButton
								isActive={activeTab === "buisness"}
								onClick={() => setActiveTab("buisness")}
								className="flex-1 py-1.5 h-auto text-xs"
							>
								Buisness
							</TabButton>
						</div>

						<div className="flex flex-col space-y-3 px-2 text-center text-sm font-medium text-gray-700">
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="py-2 hover:text-black cursor-pointer"
							>
								Products
							</button>
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="py-2 hover:text-black cursor-pointer"
							>
								Company
							</button>
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="py-2 hover:text-black cursor-pointer"
							>
								Blog
							</button>
							<button
								type="button"
								onClick={() => setMobileMenuOpen(false)}
								className="py-2 hover:text-black cursor-pointer"
							>
								Support
							</button>
						</div>

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
