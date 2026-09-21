import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  type SvgProps,
} from "react-native-svg";

interface CurrencyIconProps extends SvgProps {
  size?: number;
}

const NGNIcon = ({ size = 24, width, height, ...props }: CurrencyIconProps) => {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <Svg width={w} height={h} viewBox="0 0 24 24" fill="none" {...props}>
      <G clipPath="url(#clip0_ngn)">
        <G clipPath="url(#clip1_ngn)">
          <Path
            d="M0.75 12C0.75 16.9125 3.9 21.075 8.25 22.6125V1.38751C3.9 2.92501 0.75 7.08751 0.75 12ZM23.25 12C23.25 7.08751 20.1375 2.92501 15.75 1.38751V22.6125C20.1375 21.075 23.25 16.9125 23.25 12Z"
            fill="#009A49"
          />
          <Path
            d="M8.25 22.6125C9.4125 23.025 10.6875 23.25 12 23.25C13.3125 23.25 14.5875 23.025 15.75 22.6125V1.3875C14.5875 0.975 13.3125 0.75 12 0.75C10.6875 0.75 9.4125 0.975 8.25 1.3875V22.6125Z"
            fill="#F9F9F9"
          />
        </G>
      </G>
      <Defs>
        <ClipPath id="clip0_ngn">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
        <ClipPath id="clip1_ngn">
          <Rect width={24} height={24} fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export { NGNIcon };
