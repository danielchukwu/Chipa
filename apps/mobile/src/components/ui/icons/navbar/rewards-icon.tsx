import Svg, { Path, type SvgProps } from "react-native-svg";

const RewardsIcon = (props: SvgProps) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5.83333 4H19.1667L22.5 9.55556L13.0556 20.1111C12.9831 20.185 12.8967 20.2437 12.8013 20.2838C12.7059 20.3239 12.6035 20.3446 12.5 20.3446C12.3965 20.3446 12.2941 20.3239 12.1987 20.2838C12.1033 20.2437 12.0169 20.185 11.9444 20.1111L2.5 9.55556L5.83333 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10.2778 11.7778L8.05554 9.3334L8.72221 8.22229"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { RewardsIcon };
