import Svg, { Circle, Path, Rect, type SvgProps } from 'react-native-svg';

export function SnowflakeIcon(props: SvgProps) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2v20M17 5l-5 5-5-5M17 19l-5-5-5 5M2 12h20M5 7l5 5-5 5M19 7l-5 5 5 5"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowUpSimpleIcon(props: SvgProps) {
  return (
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ConcentricEyeIcon(props: SvgProps) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M2 12C3.8 7.5 7.5 4.5 12 4.5s8.2 3 10 7.5c-1.8 4.5-5.5 7.5-10 7.5S3.8 16.5 2 12z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <Path
        d="M12 13.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"
        fill="currentColor"
      />
    </Svg>
  );
}

export function HistoryClockIcon(props: SvgProps) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3.5 12a8.5 8.5 0 1 0 8.5-8.5 8.38 8.38 0 0 0-6 2.5L3.5 8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3.5 3.5v4.5H8"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 7.5v4.5l3 2"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CancelCardBadgeIcon(props: SvgProps) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2.2l1.6 1.7 2.3-.3.9 2.1 2.2.8-.2 2.3 1.7 1.6-1.1 2 .8 2.2-2 1.1-.8 2.2-2.3-.2-1.6 1.7-1.6-1.7-2.3.2-.8-2.2-2-1.1.8-2.2-1.1-2 1.7-1.6-.2-2.3 2.2-.8.9-2.1 2.3.3L12 2.2z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CloseIcon(props: SvgProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ShieldCheckIcon(props: SvgProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill="#111827"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function KeypadBackspaceIcon(props: SvgProps) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2z"
        fill="#111827"
      />
      <Path
        d="M16 9l-4 4m0 0l-4 4m4-4l4 4m-4-4l-4-4"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AccountInfoCircleIcon(props: SvgProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={9} stroke="currentColor" strokeWidth={1.8} />
      <Path
        d="M7.5 15c1-2 2.5-3 4.5-3s3.5 1 4.5 3"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function BadgeVerificationIcon(props: SvgProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Rect
        x={3.5}
        y={4.5}
        width={17}
        height={15}
        rx={2.5}
        stroke="currentColor"
        strokeWidth={1.8}
      />
      <Rect
        x={6.5}
        y={7.5}
        width={4}
        height={4}
        rx={1}
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <Path
        d="M13.5 9h4M13.5 12h4M6.5 15h11"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TierBadgeIcon(props: SvgProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 2l1.5 1.8 2.3-.3.8 2.2 2.3.8-.3 2.3 1.8 1.5-1.2 2 .8 2.2-2 .8-.8 2.2-2.3-.3L12 22l-1.5-1.8-2.3.3-.8-2.2-2.3-.8.3-2.3-1.8-1.5 1.2-2-.8-2.2 2-.8.8-2.2 2.3.3L12 2z"
        fill="#C27803"
      />
      <Path
        d="M11 10h1.5v6M10.5 12l2-2"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RedLogoutIcon(props: SvgProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h11"
        stroke="#EF4444"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


