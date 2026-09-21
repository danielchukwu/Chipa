import type { SVGProps } from "react";

const CloudIcon = ({ ...props }: SVGProps<SVGSVGElement>) => {
	return (
		<svg
			width="100"
			height="100"
			viewBox="0 0 100 100"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M72.0844 28.2125C67.4969 18.9157 57.9469 12.5 46.875 12.5C32.0344 12.5 19.9063 24.0062 18.8532 38.578C7.94381 41.6874 0 51.2188 0 62.5C0 75.8125 11.0625 86.7344 25 87.5H71.875C87.3938 87.5 100 74.2094 100 57.8125C100 42.0125 87.6532 29.1344 72.0844 28.2125Z"
				fill="#C0D2DD"
			/>
		</svg>
	);
};

export default CloudIcon;
