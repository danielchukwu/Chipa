import Svg, { G, Path, type SvgProps } from "react-native-svg";

const BackArrowIcon = (props: SvgProps) => {
  return (
    <Svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      strokeWidth="2"
      fill="none"
      {...props}
    >
      <Path
        d="M11.4375 18.75L4.6875 12L11.4375 5.25M5.625 12H19.3125"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { BackArrowIcon };
