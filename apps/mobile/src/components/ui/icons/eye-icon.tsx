import Svg, {
  ClipPath,
  Defs,
  G,
  Path,
  Rect,
  type SvgProps,
} from "react-native-svg";

const EyeIcon = (props: SvgProps) => {
  return (
    <Svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      strokeWidth="1.5"
      {...props}
    >
      <G clipPath="url(#clip0_462_2849)">
        <Path
          d="M0.816665 7.84613C0.768957 7.67418 0.768957 7.49249 0.816665 7.32054C1.56916 4.61271 4.05241 2.625 7 2.625C9.94758 2.625 12.4308 4.61242 13.1833 7.32054C13.2309 7.49263 13.2309 7.67404 13.1833 7.84613C12.4308 10.554 9.94758 12.5417 7 12.5417C4.05241 12.5417 1.56916 10.5543 0.816665 7.84613Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M7.00001 2.625V0.583328M4.22917 3.23225L3.20834 1.46416M9.77084 3.23225L10.7917 1.46416M2.03555 4.95337L0.591797 3.50962M11.9645 4.95279L13.4082 3.50904M9.91667 7.58333C9.91667 9.1942 8.61088 10.5 7.00001 10.5C5.38913 10.5 4.08334 9.1942 4.08334 7.58333C4.08334 5.97245 5.38913 4.66666 7.00001 4.66666C8.61088 4.66666 9.91667 5.97245 9.91667 7.58333Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_462_2849">
          <Rect width="14" height="14" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export { EyeIcon };
