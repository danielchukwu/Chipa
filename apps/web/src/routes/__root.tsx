import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import HeaderWaitlist from "#/components/HeaderWaitlist";
import Footer from "../components/Footer";
import WaitlistModal from "../components/WaitlistModal";
import ConvexClientProvider from "../integrations/convex/provider";
import PostHogProvider from "../integrations/posthog/provider";
import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'light';var root=document.documentElement;root.classList.remove('dark');root.classList.add('light');root.setAttribute('data-theme','light');root.style.colorScheme='light';}catch(e){}})();`;

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Chipa - Get paid globally. Live locally.",
			},
			{
				name: "description",
				content:
					"Receive, hold, convert and move your money across NGN, USD, EUR and GBP, all in one place with Chipa.",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "any",
			},
			{
				rel: "icon",
				type: "image/png",
				href: "/icon.png",
			},
			{
				rel: "apple-touch-icon",
				href: "/icon.png",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
				<HeadContent />
			</head>
			<body className="font-sans antialiased bg-white text-[#111111] selection:bg-[#FF793F]/20 selection:text-[#FF793F]">
				<PostHogProvider>
					<ConvexClientProvider>
						<HeaderWaitlist />
						{children}
						<Footer />
						<WaitlistModal />
						<TanStackDevtools
							config={{
								position: "bottom-right",
							}}
							plugins={[
								{
									name: "Tanstack Router",
									render: <TanStackRouterDevtoolsPanel />,
								},
							]}
						/>
					</ConvexClientProvider>
				</PostHogProvider>
				<Scripts />
			</body>
		</html>
	);
}
