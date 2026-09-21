import type { SVGProps } from "react";

const ArrowDownIcon = ({ ...props }: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width="29"
			height="29"
			viewBox="0 0 29 29"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				d="M21.5625 10.7812L14.375 17.9687L7.1875 10.7812"
				stroke="white"
				strokeWidth="2.875"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

export default ArrowDownIcon;
