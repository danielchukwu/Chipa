import { Button } from "@repo/ui/components/button.tsx";
import TwinkleIcon from "@repo/ui/icons/landing-page/twinkle-icon.tsx";
import VerifiedIcon from "@repo/ui/icons/landing-page/verified-icon.tsx";
import NailIcon from "@repo/ui/icons/landing-page/nail-icon.tsx";
import { createFileRoute, Link } from "@tanstack/react-router";
import { openWaitlist } from "../lib/waitlist";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{
				title: "About Us | Chipa - Borderless Money for Global Earners",
			},
			{
				name: "description",
				content:
					"Discover why we are building Chipa: the unified financial operating system connecting global earners and businesses across Africa to the world economy.",
			},
		],
	}),
	component: AboutPage,
});

function AboutPage() {
	return (
		<main className="min-h-screen bg-white text-[#111111] overflow-x-hidden">
			{/* Top subtle tint */}
			<div className="bg-[#FCF9F4] h-24 w-full absolute top-0 left-0" />

			{/* ========================================================================= */}
			{/* 1. HERO SECTION                                                          */}
			{/* ========================================================================= */}
			<section className="bg-[#FCF9F4] pt-8 sm:pt-12 lg:pt-16 pb-16 sm:pb-24 border-b border-black/[0.04]">
				<div className="page-container">
					{/* Breadcrumbs */}
					<nav
						aria-label="Breadcrumb"
						className="mb-8 flex items-center gap-2 text-xs sm:text-sm text-[#777777]"
					>
						<Link to="/" className="hover:text-black transition-colors">
							Home
						</Link>
						<span>/</span>
						<span className="text-[#FF793F] font-semibold">About Us</span>
					</nav>

					{/* Tag / Pre-Launch Badge */}
					<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009A49]/10 border border-[#009A49]/20 text-[#009A49] text-xs sm:text-sm font-semibold mb-6">
						<span className="w-2 h-2 rounded-full bg-[#009A49] animate-pulse" />
						Our Mission • Pre-Launch Vision
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
						{/* Left Column: Headlines & Story */}
						<div className="lg:col-span-7 space-y-6">
							<h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] text-[#111111] leading-[1.08] tracking-tight">
								Built for global earners.
								<br />
								<span className="text-[#FF793F]">Rooted</span> in local reality.
							</h1>

							<p className="text-base sm:text-lg lg:text-xl text-[#525252] leading-relaxed max-w-2xl">
								Chipa is building the unified financial operating system for the
								borderless workforce. We empower African freelancers, creators,
								tech professionals, and companies to receive, convert, hold, and
								spend money across NGN, USD, EUR, and GBP—without friction,
								delays, or predatory exchange rates.
							</p>

							<div className="pt-2 flex flex-wrap items-center gap-4">
								<Button
									variant="black"
									onClick={openWaitlist}
									className="rounded-full text-base font-semibold px-8 py-4 h-auto transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] shadow-sm"
								>
									Join the waitlist
								</Button>
								<Link
									to="/terms"
									className="inline-flex items-center text-sm font-semibold text-gray-700 hover:text-black px-5 py-3 transition"
								>
									Pre-Launch Terms →
								</Link>
							</div>
						</div>

						{/* Right Column: Visual Feature Highlight Card */}
						<div className="lg:col-span-5">
							<div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#161618] to-[#252528] p-8 sm:p-10 text-white shadow-2xl border border-white/10 overflow-hidden">
								<div className="absolute top-0 right-0 w-44 h-44 bg-[#FF793F]/20 rounded-full blur-3xl pointer-events-none" />

								<p className="text-xs uppercase tracking-widest font-mono text-[#FDBE4E] font-semibold mb-3">
									Chipa at a Glance
								</p>

								<h2 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight leading-snug">
									One unified wallet. Zero borders.
								</h2>

								<div className="mt-8 space-y-4">
									<div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
										<span className="text-2xl">🌍</span>
										<div>
											<p className="font-semibold text-sm text-white">
												4 Global Currencies
											</p>
											<p className="text-xs text-gray-400">
												NGN, USD, EUR & GBP with dedicated account details
											</p>
										</div>
									</div>

									<div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
										<span className="text-2xl">💳</span>
										<div>
											<p className="font-semibold text-sm text-white">
												Universal Cards
											</p>
											<p className="text-xs text-gray-400">
												Virtual & physical cards for worldwide online and POS
												spend
											</p>
										</div>
									</div>

									<div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
										<span className="text-2xl">⚡</span>
										<div>
											<p className="font-semibold text-sm text-white">
												Instant Everyday Utility
											</p>
											<p className="text-xs text-gray-400">
												Free domestic transfers, discounted airtime, data &
												bills
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* 2. THE ORIGIN STORY: WHY WE BUILT CHIPA                                  */}
			{/* ========================================================================= */}
			<section className="page-container py-16 sm:py-24 lg:py-32">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
					{/* Left Sticky Column */}
					<div className="lg:col-span-5 lg:sticky lg:top-28">
						<div className="flex items-center gap-2 mb-4 text-[#009A49]">
							<VerifiedIcon className="w-5 h-5 text-[#009A49]" />
							<span className="text-xs font-bold uppercase tracking-wider">
								The Origin Story
							</span>
						</div>

						<h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#111111] tracking-tight leading-tight">
							The world went global.
							<br />
							Banking stayed in <span className="text-[#009A49]">borders.</span>
						</h2>

						<p className="mt-6 text-base sm:text-lg text-[#555555] leading-relaxed">
							Talent has no geographical limitations. Why should your
							hard-earned income be trapped behind legacy banking friction?
						</p>
					</div>

					{/* Right Content Column */}
					<div className="lg:col-span-7 space-y-8 text-base sm:text-lg text-[#444444] leading-relaxed">
						<p>
							Every single day, tens of thousands of software developers,
							creative designers, digital marketers, writers, and remote
							contractors across Nigeria and emerging markets deliver
							world-class value to clients in San Francisco, London, Berlin, and
							Toronto.
						</p>

						<p>Yet, getting paid has remained an exhausting obstacle course:</p>

						{/* Pain Points Comparison Box */}
						<div className="p-6 sm:p-8 rounded-3xl bg-[#FAF7F2] border border-[#F0EBE1] space-y-5">
							<div className="flex items-start gap-4">
								<span className="shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
									✕
								</span>
								<div>
									<p className="font-bold text-[#111111] text-base">
										Unfair conversion margins
									</p>
									<p className="text-sm text-[#666666] mt-0.5">
										Traditional banks and middlemen skim 5% to 8% off every
										transaction through wide spreads and covert conversion fees.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<span className="shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
									✕
								</span>
								<div>
									<p className="font-bold text-[#111111] text-base">
										Declined virtual cards
									</p>
									<p className="text-sm text-[#666666] mt-0.5">
										Local cards fail on essential global tools like AWS, GitHub,
										OpenAI, and Google Cloud, stalling productivity and business
										growth.
									</p>
								</div>
							</div>

							<div className="flex items-start gap-4">
								<span className="shrink-0 w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
									✕
								</span>
								<div>
									<p className="font-bold text-[#111111] text-base">
										Fragmented app fatigue
									</p>
									<p className="text-sm text-[#666666] mt-0.5">
										You receive funds in one app, exchange on a second, send to
										a third bank, and use a fourth just to pay your monthly
										electricity bill.
									</p>
								</div>
							</div>
						</div>

						<p className="font-medium text-[#111111]">
							We founded <strong>Chipa</strong> to replace this chaos with
							clarity. A single, elegant platform where international client
							payouts land automatically, convert at transparent mid-market
							rates, power global virtual cards, and effortlessly settle your
							everyday local bills.
						</p>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* 3. OUR FOUR CORE VALUES (PILLARS)                                        */}
			{/* ========================================================================= */}
			<section className="bg-[#FAF7F2] py-16 sm:py-24 lg:py-28 border-y border-[#F0EBE1]">
				<div className="page-container">
					<div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
						<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#111111]/5 text-[#111111] text-xs font-bold uppercase tracking-wider mb-4">
							<TwinkleIcon className="w-3.5 h-3.5" />
							Our Core Principles
						</div>
						<h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#111111] tracking-tight">
							What guides every decision we make.
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
						{/* Pillar 1: Radical Transparency */}
						<div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0EBE1] shadow-sm hover:shadow-md transition-all">
							<div className="w-12 h-12 rounded-2xl bg-[#EEF8EE] flex items-center justify-center text-[#009A49] text-xl font-bold mb-6">
								01
							</div>
							<h3 className="font-display font-bold text-2xl text-[#111111] mb-3">
								Radical Transparency
							</h3>
							<p className="text-sm sm:text-base text-[#555555] leading-relaxed">
								No surprise monthly maintenance fees, no hidden spreads. Before
								you confirm any transfer or exchange, we display the live rate,
								the fee (if any), and the exact amount your recipient receives
								down to the last kobo or cent.
							</p>
						</div>

						{/* Pillar 2: Built for Global Earners */}
						<div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0EBE1] shadow-sm hover:shadow-md transition-all">
							<div className="w-12 h-12 rounded-2xl bg-[#EDF5FE] flex items-center justify-center text-[#46A1F8] text-xl font-bold mb-6">
								02
							</div>
							<h3 className="font-display font-bold text-2xl text-[#111111] mb-3">
								Tailored for the Global Workforce
							</h3>
							<p className="text-sm sm:text-base text-[#555555] leading-relaxed">
								Our foreign virtual account details work natively with global
								freelance and payroll platforms—including Upwork, Deel, Fiverr,
								Remote, Stripe, and direct international wire rails—so you never
								get locked out of your earnings.
							</p>
						</div>

						{/* Pillar 3: Institutional Security */}
						<div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0EBE1] shadow-sm hover:shadow-md transition-all">
							<div className="w-12 h-12 rounded-2xl bg-[#F3EDFC] flex items-center justify-center text-[#7C3AED] text-xl font-bold mb-6">
								03
							</div>
							<h3 className="font-display font-bold text-2xl text-[#111111] mb-3">
								Institutional Security First
							</h3>
							<p className="text-sm sm:text-base text-[#555555] leading-relaxed">
								We design with defense in depth: 256-bit encryption in transit
								and at rest, biometric authorization, stringent fraud
								mitigation, and partnerships with licensed financial
								institutions subject to regulatory oversight.
							</p>
						</div>

						{/* Pillar 4: Local Depth, Global Reach */}
						<div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#F0EBE1] shadow-sm hover:shadow-md transition-all">
							<div className="w-12 h-12 rounded-2xl bg-[#FDF1EC] flex items-center justify-center text-[#FF793F] text-xl font-bold mb-6">
								04
							</div>
							<h3 className="font-display font-bold text-2xl text-[#111111] mb-3">
								Global Power, Everyday Utility
							</h3>
							<p className="text-sm sm:text-base text-[#555555] leading-relaxed">
								A financial app shouldn&apos;t just be for payday. Chipa bridges
								high-finance global transfers directly with free domestic bank
								transfers, discounted airtime, internet data bundles, and
								electricity payments in seconds.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* 4. BEHIND THE SCENES: OUR MODEL & REGULATORY STRUCTURE                    */}
			{/* ========================================================================= */}
			<section className="page-container py-16 sm:py-24 lg:py-28">
				<div className="max-w-4xl mx-auto rounded-[2.5rem] bg-[#161618] p-8 sm:p-12 lg:p-16 text-white border border-white/10 relative overflow-hidden shadow-2xl">
					<div className="relative z-10 space-y-6">
						<span className="text-xs uppercase tracking-widest font-mono text-[#009A49] font-bold">
							Trust & Infrastructure
						</span>

						<h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
							How Chipa operates: Technology backed by regulated institutions.
						</h2>

						<p className="text-gray-300 text-sm sm:text-base leading-relaxed">
							Chipa is a financial technology company, not a bank. We design the
							software, high-speed routing engines, and intuitive user
							experience. All regulated banking, custody, foreign exchange
							conversion, and card issuance services are delivered through
							licensed partner banks and payment processors:
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
							<div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
								<p className="font-bold text-white text-sm">Domestic Rail</p>
								<p className="text-xs text-gray-400 mt-1">
									Licensed deposit money banks and payment solution service
									providers in Nigeria.
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
								<p className="font-bold text-white text-sm">
									Global Foreign Accounts
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Regulated banking partners across the United States, United
									Kingdom, and the European Union.
								</p>
							</div>

							<div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.08]">
								<p className="font-bold text-white text-sm">
									Card Infrastructure
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Authorized card issuing partners licensed on the Visa and
									Mastercard payment networks.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* 5. PRE-LAUNCH ROADMAP: WHERE WE ARE HEADED                               */}
			{/* ========================================================================= */}
			<section className="page-container py-12 sm:py-20 lg:py-24">
				<div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
					<div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#009A49]/10 text-[#009A49] text-xs font-bold uppercase tracking-wider mb-4">
						Roadmap to Launch
					</div>
					<h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-[#111111] tracking-tight">
						Our path to public release.
					</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
					{/* Stage 1 */}
					<div className="rounded-3xl p-6 sm:p-7 bg-[#FAF7F2] border-2 border-[#009A49] relative">
						<span className="inline-block px-2.5 py-0.5 rounded-full bg-[#009A49] text-white text-[11px] font-bold uppercase tracking-wider mb-4">
							Active Now
						</span>
						<h3 className="font-display font-bold text-xl text-[#111111] mb-2">
							Phase 1: Private Beta
						</h3>
						<p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
							Waitlist collection, closed testing of transaction processing, and
							community feedback with our earliest cohorts.
						</p>
					</div>

					{/* Stage 2 */}
					<div className="rounded-3xl p-6 sm:p-7 bg-white border border-[#E5E0D8]">
						<span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider mb-4">
							Upcoming
						</span>
						<h3 className="font-display font-bold text-xl text-[#111111] mb-2">
							Phase 2: Multi-Currency
						</h3>
						<p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
							Rollout of foreign virtual account numbers (USD, EUR, GBP, NGN)
							and real-time currency exchange engine.
						</p>
					</div>

					{/* Stage 3 */}
					<div className="rounded-3xl p-6 sm:p-7 bg-white border border-[#E5E0D8]">
						<span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider mb-4">
							Upcoming
						</span>
						<h3 className="font-display font-bold text-xl text-[#111111] mb-2">
							Phase 3: Global Cards
						</h3>
						<p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
							Virtual card issuance for online global subscriptions, contactless
							debit cards, and local bill payments.
						</p>
					</div>

					{/* Stage 4 */}
					<div className="rounded-3xl p-6 sm:p-7 bg-white border border-[#E5E0D8]">
						<span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wider mb-4">
							Future
						</span>
						<h3 className="font-display font-bold text-xl text-[#111111] mb-2">
							Phase 4: Public Expansion
						</h3>
						<p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
							Public store rollout, corporate payroll integrations, and broader
							pan-African multi-currency corridors.
						</p>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* 6. FLOATING GOLDEN WAITLIST CALL TO ACTION                                */}
			{/* ========================================================================= */}
			<section className="page-container pb-20 sm:pb-28">
				<div className="bg-[#FDBE4E] rounded-[2.5rem] sm:rounded-[3.25rem] p-8 sm:p-14 md:p-16 relative overflow-hidden shadow-2xl border border-[#FDB837]">
					{/* Screws / Nails in opposite corners */}
					<div className="absolute top-5 left-5 sm:top-6 sm:left-6 pointer-events-none select-none">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 pointer-events-none select-none">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>

					<div className="text-center max-w-2xl mx-auto space-y-6">
						<h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] text-[#111111] tracking-tight leading-[1.08]">
							Be part of the borderless revolution.
						</h2>

						<p className="text-sm sm:text-base text-[#111111]/80 max-w-lg mx-auto leading-relaxed">
							Join thousands of creators, developers, and remote workers waiting
							to experience financial freedom without borders.
						</p>

						<div className="pt-2">
							<Button
								variant="black"
								onClick={openWaitlist}
								className="rounded-full text-base font-semibold px-8 sm:px-10 py-4 h-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
							>
								Claim Early Access
							</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}
