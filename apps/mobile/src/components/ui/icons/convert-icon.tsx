import Svg, { Path, type SvgProps } from "react-native-svg";

const ConvertIcon = (props: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16.977 19.5C18.7341 18.3364 20.0272 16.593 20.6308 14.5737C21.2344 12.5545 21.1102 10.3875 20.2799 8.45041C19.4496 6.51334 17.9658 4.92909 16.0872 3.97381C14.2086 3.01854 12.0544 2.75283 9.99997 3.223M20.5 19.5H16.977V16M6.99997 4.516C5.24888 5.6839 3.96251 7.42862 3.36457 9.44674C2.76663 11.4649 2.89494 13.6287 3.72719 15.562C4.55944 17.4953 6.04298 19.0758 7.91982 20.0286C9.79667 20.9814 11.9481 21.2462 14 20.777M3.49997 4.516H6.99997V8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { ConvertIcon };
