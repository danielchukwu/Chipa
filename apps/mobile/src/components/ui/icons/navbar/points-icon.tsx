import Svg, { Path, type SvgProps } from "react-native-svg";

const PointsIcon = (props: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <Path
        d="M2 12.95C8.145 13.56 13.558 8.116 12.95 2M11.05 22.001C10.44 15.856 15.887 10.443 22.001 11.051"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <Path
        d="M17 20C17 12.82 11.18 7 4 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export { PointsIcon };
