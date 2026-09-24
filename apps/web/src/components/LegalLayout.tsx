import { Link } from "@tanstack/react-router";
import type * as React from "react";
import { openWaitlist } from "../lib/waitlist";
import { Button } from "@repo/ui/components/button.tsx";

interface LegalLayoutProps {
	title: string;
	subtitle: string;
	lastUpdated: string;
	activeTab: "terms" | "privacy";
	children: React.ReactNode;
}

export default function LegalLayout({
	title,
	subtitle,
	lastUpdated,
	activeTab,
	children,
}: LegalLayoutProps) {
	return (
		<div className="min-h-screen bg-[#FCF9F4] text-[#111111]">
			{/* Top Hero Section */}
			<section className="relative overflow-hidden border-b border-black/[0.06] pt-12 pb-14 sm:pt-16 sm:pb-20">
				{/* Background decorative tint */}
				<div className="absolute inset-0 bg-gradient-to-b from-[#FFFDF9] to-[#FCF9F4] -z-10" />

				<div className="page-container max-w-4xl">
					{/* Breadcrumbs */}
					<nav
						aria-label="Breadcrumb"
						className="mb-6 flex items-center gap-2 text-xs sm:text-sm text-[#777777]"
					>
						<Link to="/" className="hover:text-black transition-colors">
							Home
						</Link>
						<span>/</span>
						<span className="text-[#333333] font-medium">Legal</span>
						<span>/</span>
						<span className="text-[#FF793F] font-semibold">
							{activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
						</span>
					</nav>

					{/* Pre-launch Tag */}
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#009A49]/10 border border-[#009A49]/20 text-[#009A49] text-xs font-semibold mb-4">
						<span className="w-1.5 h-1.5 rounded-full bg-[#009A49] animate-pulse" />
						Pre-Launch & Waitlist Edition
					</div>

					{/* Main Title */}
					<h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-[#111111] tracking-tight leading-tight">
						{title}
					</h1>

					<p className="mt-4 text-base sm:text-lg text-[#555555] leading-relaxed max-w-2xl">
						{subtitle}
					</p>

					<div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#777777]">
						<span>Effective Date: {lastUpdated}</span>
						<span>•</span>
						<span>Version 1.0 (Pre-Launch)</span>
					</div>

					{/* Navigation Tabs */}
					<div className="mt-10 flex items-center gap-2 border-b border-black/[0.08]">
						<Link
							to="/terms"
							className={`pb-3 px-4 text-sm sm:text-base font-semibold transition-all border-b-2 -mb-[2px] ${
								activeTab === "terms"
									? "border-[#111111] text-[#111111]"
									: "border-transparent text-[#777777] hover:text-[#111111]"
							}`}
						>
							Terms & Conditions
						</Link>
						<Link
							to="/privacy"
							className={`pb-3 px-4 text-sm sm:text-base font-semibold transition-all border-b-2 -mb-[2px] ${
								activeTab === "privacy"
									? "border-[#111111] text-[#111111]"
									: "border-transparent text-[#777777] hover:text-[#111111]"
							}`}
						>
							Privacy Policy
						</Link>
					</div>
				</div>
			</section>

			{/* Main Content Area */}
			<section className="py-12 sm:py-16 bg-white">
				<div className="page-container max-w-4xl">
					{/* Important Pre-Launch Notice Box */}
					<div className="mb-12 rounded-2xl bg-[#FFF9ED] border border-[#FDE3B2] p-5 sm:p-6 text-sm text-[#7A4B00] shadow-sm">
						<div className="flex items-start gap-3.5">
							<div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#FDBE4E] flex items-center justify-center text-black font-bold text-xs">
								i
							</div>
							<div className="space-y-1.5">
								<h2 className="font-bold text-sm sm:text-base text-[#523200]">
									Important Pre-Launch Notice
								</h2>
								<p className="leading-relaxed text-[#6B4300]">
									Chipa is a financial technology company currently in
									pre-launch development and is not yet operating live financial
									services. Joining our waitlist or browsing our website
									reserves early access and expresses interest in our
									forthcoming products. All banking, card issuance, cross-border
									remittance, and payment processing services described herein
									will be provided exclusively through licensed and regulated
									financial institutions and payment network partners upon
									commercial launch.
								</p>
							</div>
						</div>
					</div>

					{/* Policy Document Body */}
					<div className="prose prose-neutral max-w-none space-y-10 text-[#333333] leading-relaxed text-sm sm:text-base">
						{children}
					</div>

					{/* Contact / Help Footer Card */}
					<div className="mt-16 rounded-3xl bg-[#FAF7F2] border border-[#F0EBE1] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
						<div>
							<h3 className="font-display font-bold text-xl sm:text-2xl text-[#111111]">
								Questions about our legal policies?
							</h3>
							<p className="mt-2 text-sm sm:text-base text-[#666666]">
								Our compliance and support team is here to answer any inquiries
								regarding our terms, data protection, or waitlist.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-3 shrink-0">
							<a
								href="mailto:hello@usechipa.com"
								className="inline-flex items-center justify-center rounded-full bg-[#111111] text-white px-6 py-3 text-sm font-semibold hover:bg-black/90 transition shadow-sm"
							>
								Contact Support
							</a>
							<Button
								variant="outline"
								onClick={openWaitlist}
								className="rounded-full px-6 py-3 h-auto text-sm font-semibold border-black/20 hover:bg-black hover:text-white"
							>
								Join Waitlist
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
