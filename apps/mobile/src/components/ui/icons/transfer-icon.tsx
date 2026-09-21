import Svg, { Path, type SvgProps } from "react-native-svg";

const TransferIcon = (props: SvgProps) => {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16.309 8.63412L10.703 14.2401C10.5086 14.0456 10.2738 13.8915 10.0115 13.7889L4.52788 11.6669C2.77425 10.9881 2.84214 8.48492 4.629 7.90155L19.3191 3.10242C20.8748 2.5933 22.3498 4.06833 21.8407 5.62396L17.0423 20.3134C16.4582 22.101 13.9543 22.1681 13.2762 20.4152L11.1528 14.933C11.0521 14.6736 10.8985 14.4381 10.7016 14.2415"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { TransferIcon };
