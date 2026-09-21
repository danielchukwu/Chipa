import type { SVGProps } from "react";

const ThreeSkewedCircles = ({ ...props }: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width="985"
			height="361"
			viewBox="0 0 985 361"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<ellipse
				cx="790.394"
				cy="141.4"
				rx="85.7076"
				ry="175.545"
				transform="rotate(69.6518 790.394 141.4)"
				fill="#0088FF"
			/>
			<ellipse
				cx="509.232"
				cy="151.446"
				rx="85.7076"
				ry="204.17"
				transform="rotate(69.6518 509.232 151.446)"
				fill="#FF793F"
			/>
			<ellipse
				cx="221.232"
				cy="209.354"
				rx="85.7076"
				ry="204.17"
				transform="rotate(69.6518 221.232 209.354)"
				fill="#FDBE4E"
			/>
		</svg>
	);
};

export default ThreeSkewedCircles;
