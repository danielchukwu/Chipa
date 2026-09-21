import NailIcon from "@repo/ui/icons/landing-page/nail-icon";
import ThreeSkewedCircles from "@repo/ui/icons/landing-page/three-skewed-circles";
import LogoIcon from "@repo/ui/icons/logo-icon";
import InstagramIcon from "@repo/ui/icons/socials/instagram-icon";
import TiktokIcon from "@repo/ui/icons/socials/tiktok-icon";
import TwitterIcon from "@repo/ui/icons/socials/twitter-icon";
import YoutubeIcon from "@repo/ui/icons/socials/youtube-icon";
import { AppleStoreBadge, GooglePlayBadge } from "./StoreBadges";

export default function Footer() {
	return (
		<footer className="relative bg-[#FCFAF7] pt-12">
			{/* ========================================================================= */}
			{/* 1. FLOATING GOLDEN YELLOW DOWNLOAD BANNER                                */}
			{/* ========================================================================= */}
			<div className="relative -mb-28 sm:-mb-36 z-20 max-w-5xl mx-auto px-4 sm:px-6">
				<div className="bg-[#FDBE4E] rounded-[2.5rem] sm:rounded-[3.25rem] p-8 sm:p-14 md:p-16 relative overflow-hidden shadow-2xl border border-[#FDB837]">
					{/* Screws / Nails in opposite corners */}
					<div className="absolute top-5 left-5 sm:top-6 sm:left-6 pointer-events-none select-none opacity-70">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 pointer-events-none select-none opacity-70">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>

					<div className="text-center max-w-2xl mx-auto">
						<h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] text-[#111111] tracking-tight leading-[1.08]">
							Download Chipa and get started today
						</h2>

						<div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
							<AppleStoreBadge />
							<GooglePlayBadge />
						</div>
					</div>
				</div>
			</div>

			{/* ========================================================================= */}
			{/* 2. MAIN DARK FOOTER                                                      */}
			{/* ========================================================================= */}
			<div className="bg-[#0A0A0A] text-white pt-44 sm:pt-56 pb-12 overflow-hidden relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16">
						{/* Left: Brand, email & Social Links */}
						<div className="md:col-span-5 lg:col-span-5 flex flex-col justify-between">
							<div>
								<LogoIcon textColor="white" className="h-8 sm:h-9 w-auto" />
								<a
									href="mailto:hello@usechipa.com"
									className="mt-4 inline-block text-sm text-gray-400 hover:text-white transition-colors"
								>
									hello@usechipa.com
								</a>
							</div>

							{/* Social Icons */}
							<div className="mt-8 flex items-center gap-4 text-white/70">
								<a
									href="https://instagram.com"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="Instagram"
								>
									<InstagramIcon className="w-5 h-5" />
								</a>
								<a
									href="https://x.com"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="X (Twitter)"
								>
									<TwitterIcon className="w-5 h-5" />
								</a>
								<a
									href="https://tiktok.com"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="TikTok"
								>
									<TiktokIcon className="w-5 h-5" />
								</a>
								<a
									href="https://youtube.com"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="YouTube"
								>
									<YoutubeIcon className="w-5 h-5" />
								</a>
							</div>
						</div>

						{/* Right: Navigation columns */}
						<div className="md:col-span-7 lg:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
							{/* Products */}
							<div>
								<h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
									Products
								</h4>
								<ul className="space-y-3 text-xs sm:text-sm text-gray-400">
									<li>
										<a
											href="#foreign-accounts"
											className="hover:text-white transition-colors"
										>
											Foreign accounts
										</a>
									</li>
									<li>
										<a
											href="#money-transfer"
											className="hover:text-white transition-colors"
										>
											Money transfer
										</a>
									</li>
									<li>
										<a
											href="#virtual-cards"
											className="hover:text-white transition-colors"
										>
											Virtual cards
										</a>
									</li>
									<li>
										<a
											href="#currency-exchange"
											className="hover:text-white transition-colors"
										>
											Currency exchange
										</a>
									</li>
								</ul>
							</div>

							{/* Company */}
							<div>
								<h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
									Company
								</h4>
								<ul className="space-y-3 text-xs sm:text-sm text-gray-400">
									<li>
										<a
											href="#about"
											className="hover:text-white transition-colors"
										>
											About us
										</a>
									</li>
									<li>
										<a
											href="#blog"
											className="hover:text-white transition-colors"
										>
											Blog
										</a>
									</li>
									<li>
										<a
											href="#careers"
											className="hover:text-white transition-colors"
										>
											Careers
										</a>
									</li>
								</ul>
							</div>

							{/* Connect */}
							<div>
								<h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
									Connect
								</h4>
								<ul className="space-y-3 text-xs sm:text-sm text-gray-400">
									<li>
										<a
											href="#contact"
											className="hover:text-white transition-colors"
										>
											Contact us
										</a>
									</li>
									<li>
										<a
											href="https://instagram.com"
											target="_blank"
											rel="noreferrer"
											className="hover:text-white transition-colors"
										>
											Instagram
										</a>
									</li>
									<li>
										<a
											href="https://x.com"
											target="_blank"
											rel="noreferrer"
											className="hover:text-white transition-colors"
										>
											X (Twitter)
										</a>
									</li>
									<li>
										<a
											href="https://youtube.com"
											target="_blank"
											rel="noreferrer"
											className="hover:text-white transition-colors"
										>
											YouTube
										</a>
									</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Bottom Bar Divider */}
					<div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
						<p className="m-0">&copy; Copyright 2026. All Right Reserved</p>
						<div className="flex items-center gap-6">
							<a href="#terms" className="hover:text-white transition-colors">
								Terms & Conditions
							</a>
							<a href="#privacy" className="hover:text-white transition-colors">
								Privacy Policy
							</a>
						</div>
					</div>

					{/* Regulatory Disclaimer */}
					<p className="text-[11px] sm:text-xs text-gray-500 text-center max-w-4xl mx-auto mt-8 leading-relaxed">
						Chipa is a financial technology company, not a bank and it is
						currently in development. Availability of financial services may
						depend on applicable licensing and regulated partners.
					</p>
				</div>

				{/* Ambient Glow from ThreeSkewedCircles */}
				<div className="absolute -bottom-28 left-1/2 -translate-x-1/2 w-full max-w-4xl pointer-events-none opacity-30 blur-3xl z-0">
					<ThreeSkewedCircles className="w-full h-auto" />
				</div>

				{/* Giant Watermark Typography */}
				<div className="relative z-10 text-center mt-12 sm:mt-16 overflow-hidden select-none pointer-events-none">
					<p className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[9rem] tracking-tight text-white/[0.08] whitespace-nowrap leading-none">
						Your money, without border
					</p>
				</div>
			</div>
		</footer>
	);
}
