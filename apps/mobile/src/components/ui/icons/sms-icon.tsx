import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  size?: number;
}

export function SMSIcon({
  width = 28,
  height = 28,
  size,
}: IconProps) {
  const finalWidth = size ?? width;
  const finalHeight = size ?? height;

  return (
    <Svg width={finalWidth} height={finalHeight} viewBox="0 0 32 32" fill="none">
      {/* Antenna */}
      <Rect x="10" y="2" width="2" height="6" rx="1" fill="#64748B" />
      {/* Phone body */}
      <Rect x="8" y="6" width="16" height="24" rx="4" fill="#64748B" />
      {/* Screen */}
      <Rect x="10.5" y="8.5" width="11" height="8" rx="1.5" fill="#E2E8F0" />
      {/* Keypad dots / buttons */}
      {/* Row 1 */}
      <Rect x="11" y="18.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="14.75" y="18.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="18.5" y="18.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      {/* Row 2 */}
      <Rect x="11" y="21.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="14.75" y="21.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="18.5" y="21.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      {/* Row 3 */}
      <Rect x="11" y="24.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="14.75" y="24.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
      <Rect x="18.5" y="24.5" width="2.5" height="1.8" rx="0.5" fill="#CBD5E1" />
    </Svg>
  );
}
