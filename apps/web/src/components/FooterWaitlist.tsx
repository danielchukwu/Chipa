import { cn } from "#/lib/utils";
import { Link } from "@tanstack/react-router";
import NailIcon from "@repo/ui/icons/landing-page/nail-icon.tsx";
import ThreeSkewedCircles from "@repo/ui/icons/landing-page/three-skewed-circles.tsx";
import LogoIcon from "@repo/ui/icons/logo-icon.tsx";
import InstagramIcon from "@repo/ui/icons/socials/instagram-icon.tsx";
import TwitterIcon from "@repo/ui/icons/socials/twitter-icon.tsx";

interface FooterLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string;
	children: React.ReactNode;
}

export function FooterLink({
	href,
	children,
	className,
	...props
}: FooterLinkProps) {
	const isExternal = href.startsWith("http://") || href.startsWith("https://");
	const isInternal = href.startsWith("/");

	if (isInternal) {
		return (
			<li>
				<Link
					to={href}
					className={cn("hover:text-white transition-colors", className)}
				>
					{children}
				</Link>
			</li>
		);
	}

	return (
		<li>
			<a
				href={href}
				className={cn("hover:text-white transition-colors", className)}
				{...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}
				{...props}
			>
				{children}
			</a>
		</li>
	);
}

interface FooterColumnProps {
	title: string;
	children: React.ReactNode;
}

export function FooterColumn({ title, children }: FooterColumnProps) {
	return (
		<div>
			<h4 className="font-semibold text-sm text-white mb-4 tracking-wide">
				{title}
			</h4>
			<ul className="space-y-7 text-xs sm:text-sm text-gray-400">{children}</ul>
		</div>
	);
}

export default function FooterWaitlist() {
	return (
		<footer className="relative bg-white pt-12">
			{/* ========================================================================= */}
			{/* 1. FLOATING GOLDEN YELLOW DOWNLOAD BANNER                                */}
			{/* ========================================================================= */}
			<div className="relative -mb-28 sm:-mb-36 z-20 max-w-5xl mx-auto px-4 sm:px-6">
				<div className="bg-[#FDBE4E] rounded-[2.5rem] sm:rounded-[3.25rem] p-8 sm:p-14 md:p-16 relative overflow-hidden shadow-2xl border border-[#FDB837]">
					{/* Screws / Nails in opposite corners */}
					<div className="absolute top-5 left-5 sm:top-6 sm:left-6 pointer-events-none select-none">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>
					<div className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 pointer-events-none select-none">
						<NailIcon className="w-5 h-5 sm:w-6 sm:h-6" />
					</div>

					<div className="text-center max-w-2xl mx-auto">
						<h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-[3.4rem] text-[#111111] tracking-tight leading-[1.08]">
							Join the waitlist to be the first to know when it drops.
						</h2>
					</div>
				</div>
			</div>

			{/* ========================================================================= */}
			{/* 2. MAIN DARK FOOTER                                                      */}
			{/* ========================================================================= */}
			<div className="bg-[#0A0A0A] text-white pt-44 sm:pt-56 pb-6 overflow-hidden relative">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-16">
						{/* Left: Brand, email & Social Links */}
						<div className="md:col-span-5 lg:col-span-5 space-y-3">
							<LogoIcon textColor="white" className="h-8 sm:h-9 w-auto" />
							<a
								href="mailto:hello@usechipa.com"
								className="inline-block text-sm text-gray-400 hover:text-white transition-colors"
							>
								hello@usechipa.com
							</a>
							{/* Social Icons */}
							<div className="flex items-center gap-4 text-white/70">
								<a
									href="https://x.com/usechipa"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="Instagram"
								>
									<InstagramIcon className="w-5 h-5" />
								</a>
								<a
									href="https://www.instagram.com/usechipa/"
									target="_blank"
									rel="noreferrer"
									className="p-2 rounded-full hover:text-white hover:bg-white/10 transition"
									aria-label="X (Twitter)"
								>
									<TwitterIcon className="w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					{/* Bottom Bar Divider */}
					<div className="border-b border-white/[0.08] pb-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
						<p className="m-0">&copy; Copyright 2026. All Right Reserved</p>
						<div className="flex items-center gap-6">
							<Link to="/terms" className="hover:text-white transition-colors">
								Terms & Conditions
							</Link>
							<Link
								to="/privacy"
								className="hover:text-white transition-colors"
							>
								Privacy Policy
							</Link>
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
				<div className="absolute -bottom-48 w-full max-w-4xl pointer-events-none blur-3xl z-0">
					<ThreeSkewedCircles className="w-full h-auto" />
				</div>

				{/* Giant Watermark Typography */}
				<div className="relative top-11 text-center mt-12 sm:mt-16 overflow-hidden select-none pointer-events-none">
					<p className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-[7.5rem] xl:text-[8rem] tracking-tight text-white/20 whitespace-nowrap leading-none">
						Your money, without border
					</p>
				</div>
			</div>
		</footer>
	);
}

export function MoreInfo() {
	return (
		<>
			{/* Right: Navigation columns */}
			<div className="md:col-span-7 lg:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
				{/* Products */}
				<FooterColumn title="Products">
					<FooterLink href="#foreign-accounts">Foreign accounts</FooterLink>
					<FooterLink href="#money-transfer">Money transfer</FooterLink>
					<FooterLink href="#virtual-cards">Virtual cards</FooterLink>
					<FooterLink href="#currency-exchange">Currency exchange</FooterLink>
				</FooterColumn>

				{/* Company */}
				<FooterColumn title="Company">
					<FooterLink href="/about">About us</FooterLink>
					<FooterLink href="#blog">Blog</FooterLink>
					<FooterLink href="#careers">Careers</FooterLink>
				</FooterColumn>

				{/* Connect */}
				<FooterColumn title="Connect">
					{/* <FooterLink href="#contact">Contact us</FooterLink> */}
					<FooterLink href="https://www.instagram.com/usechipa/">
						Instagram
					</FooterLink>
					<FooterLink href="https://x.com/usechipa">X (Twitter)</FooterLink>
					{/* <FooterLink href="https://youtube.com">YouTube</FooterLink> */}
				</FooterColumn>
			</div>
		</>
	);
}
