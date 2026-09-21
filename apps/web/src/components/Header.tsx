import LogoIcon from "@repo/ui/icons/logo-icon";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { openWaitlist } from "../lib/waitlist";

export default function Header() {
	const [activeTab, setActiveTab] = useState<"personal" | "buisness">(
		"personal",
	);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 bg-[#FCFAF7]/90 backdrop-blur-md border-b border-black/[0.04]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
						<div className="hidden sm:inline-flex items-center bg-[#EFECE8] rounded-full p-1 text-xs font-semibold">
							<button
								type="button"
								onClick={() => setActiveTab("personal")}
								className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
									activeTab === "personal"
										? "bg-[#18181B] text-white shadow-sm"
										: "text-[#666666] hover:text-black"
								}`}
							>
								Personal
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("buisness")}
								className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
									activeTab === "buisness"
										? "bg-[#18181B] text-white shadow-sm"
										: "text-[#666666] hover:text-black"
								}`}
							>
								Buisness
							</button>
						</div>
					</div>

					{/* Center: Navigation Links */}
					<nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#444444]">
						<a href="#products" className="hover:text-black transition-colors">
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

					{/* Right: CTA & Mobile Toggle */}
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={openWaitlist}
							className="bg-[#18181B] hover:bg-black text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-full transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-sm cursor-pointer"
						>
							Join the waitlist
						</button>

						{/* Mobile Menu Button */}
						<button
							type="button"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 rounded-xl text-gray-700 hover:bg-black/5 transition"
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
					<div className="md:hidden py-4 border-t border-black/5 animate-in slide-in-from-top-2 duration-150">
						<div className="flex items-center justify-center mb-4 bg-[#EFECE8] rounded-full p-1 text-xs font-semibold max-w-xs mx-auto">
							<button
								type="button"
								onClick={() => setActiveTab("personal")}
								className={`flex-1 py-1.5 rounded-full transition-all ${
									activeTab === "personal"
										? "bg-[#18181B] text-white shadow-sm"
										: "text-[#666666]"
								}`}
							>
								Personal
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("buisness")}
								className={`flex-1 py-1.5 rounded-full transition-all ${
									activeTab === "buisness"
										? "bg-[#18181B] text-white shadow-sm"
										: "text-[#666666]"
								}`}
							>
								Buisness
							</button>
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
					</div>
				)}
			</div>
		</header>
	);
}
