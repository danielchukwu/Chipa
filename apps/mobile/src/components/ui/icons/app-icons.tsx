/**
 * In-app utility icons used on Home, Rewards, and related screens.
 */
import Svg, { Circle, Path, Rect, type SvgProps } from "react-native-svg";

type IconProps = SvgProps;

// ---------------------------------------------------------------------------
// Eye / EyeOff — for toggling balance visibility
// ---------------------------------------------------------------------------
export function EyeIcon(props: IconProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M1 12C1 12 5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
    </Svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M1 1l22 22"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Bell / Notification
// ---------------------------------------------------------------------------
export function BellIcon(props: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Bank / Building — for account number pill
// ---------------------------------------------------------------------------
export { FancyBankIcon as BankIcon } from "@/components/ui/icons/fancy-bank-icon";

// ---------------------------------------------------------------------------
// Arrows — for transaction items and quick actions
// ---------------------------------------------------------------------------
export function ArrowDownCircleIcon(props: IconProps) {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
      <Circle cx={18} cy={18} r={17} fill="#F0FDF4" />
      <Path
        d="M18 12V24M18 24L13 19M18 24L23 19"
        stroke="#16A34A"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowUpCircleIcon(props: IconProps) {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none" {...props}>
      <Circle cx={18} cy={18} r={17} fill="#FFF7ED" />
      <Path
        d="M18 24V12M18 12L13 17M18 12L23 17"
        stroke="#F05D09"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Quick action icons
// ---------------------------------------------------------------------------
export function AddMoneyIcon(props: IconProps) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TransferIcon(props: IconProps) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M5 9L2 12L5 15M9 12H2M19 9L22 12L19 15M15 12H22"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ConvertIcon(props: IconProps) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M17 2L21 6L17 10M7 20H3V14M7 4H3V10M21 18V14L17 18"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 6H21M3 18H21"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function MoreDotsIcon(props: IconProps) {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={5} cy={12} r={1.5} fill="currentColor" />
      <Circle cx={12} cy={12} r={1.5} fill="currentColor" />
      <Circle cx={19} cy={12} r={1.5} fill="currentColor" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Diamond — used in Rewards condition cards
// ---------------------------------------------------------------------------
export function DiamondIcon(props: IconProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 3H18L22 9L12 21L2 9L6 3Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <Path d="M2 9H22" stroke="currentColor" strokeWidth={1.6} />
      <Path
        d="M6 3L9 9L12 21L15 9L18 3"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Chevron right — for small navigation cues
// ---------------------------------------------------------------------------
export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// ChevronDown — for small dropdown cues
// ---------------------------------------------------------------------------
export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Share icon
// ---------------------------------------------------------------------------
export function ShareIcon(props: IconProps) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Settings / Gear icon
// ---------------------------------------------------------------------------
export function SettingsIcon(props: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.8} />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Shield — for security settings
// ---------------------------------------------------------------------------
export function ShieldIcon(props: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Logout icon
// ---------------------------------------------------------------------------
export function LogoutIcon(props: IconProps) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
