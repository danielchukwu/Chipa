import { ConvexProvider, ConvexReactClient } from "convex/react";
import { type ReactNode, useMemo } from "react";

const convexUrl =
	import.meta.env.VITE_CONVEX_URL ||
	process.env.VITE_CONVEX_URL ||
	"https://fastidious-jackal-851.eu-west-1.convex.cloud";

export default function ConvexClientProvider({
	children,
}: {
	children: ReactNode;
}) {
	const convex = useMemo(() => {
		return new ConvexReactClient(convexUrl);
	}, []);

	return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
