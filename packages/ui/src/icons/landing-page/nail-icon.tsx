import type { SVGProps } from "react";

const NailIcon = ({ ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="12" fill="#D9D9D9" />
      <path
        opacity="0.3"
        d="M8.40039 15.6004L12.0004 12.0004L15.6004 15.6004M15.6004 8.40039L11.9997 12.0004L8.40039 8.40039"
        stroke="black"
        stroke-width="1.8"
        stroke-linecap="square"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default NailIcon;
