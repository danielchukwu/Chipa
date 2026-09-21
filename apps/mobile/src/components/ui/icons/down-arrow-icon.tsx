import Svg, { Path, type SvgProps } from "react-native-svg";

interface DownArrowIconProps extends SvgProps {
  size?: number;
  color?: string;
}

const DownArrowIcon = ({
  size = 24,
  width,
  height,
  color,
  ...props
}: DownArrowIconProps) => {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <Svg
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      color={color}
      {...props}
    >
      <Path
        d="M2.60161 7.00259C2.4852 7.11871 2.39284 7.25665 2.32983 7.40851C2.26681 7.56037 2.23437 7.72318 2.23438 7.8876C2.23437 8.05201 2.26681 8.21482 2.32983 8.36668C2.39284 8.51854 2.4852 8.65648 2.60161 8.7726L10.9116 17.0826C11.0041 17.1753 11.114 17.2488 11.235 17.299C11.356 17.3492 11.4856 17.375 11.6166 17.375C11.7476 17.375 11.8773 17.3492 11.9982 17.299C12.1192 17.2488 12.2291 17.1753 12.3216 17.0826L20.6316 8.7726C21.1216 8.2826 21.1216 7.49259 20.6316 7.00259C20.1416 6.51259 19.3516 6.51259 18.8616 7.00259L11.6116 14.2426L4.36161 6.9926C3.88161 6.5126 3.08161 6.51259 2.60161 7.00259Z"
        fill={color ?? "currentColor"}
      />
    </Svg>
  );
};

export { DownArrowIcon };
export type { DownArrowIconProps };
