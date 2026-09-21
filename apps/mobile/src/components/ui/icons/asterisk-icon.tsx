import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  width?: number;
  height?: number;
  color?: string;
  size?: number;
}

export function AsteriskIcon({
  width = 24,
  height = 24,
  color = '#EF4444',
  size,
}: IconProps) {
  const finalWidth = size ?? width;
  const finalHeight = size ?? height;

  return (
    <Svg width={finalWidth} height={finalHeight} viewBox="0 0 24 24" fill="none">
      {/* 8 rounded spokes radiating at 0, 45, 90, 135 deg */}
      <Rect
        x="10.25"
        y="2"
        width="3.5"
        height="20"
        rx="1.75"
        fill={color}
      />
      <Rect
        x="2"
        y="10.25"
        width="20"
        height="3.5"
        rx="1.75"
        fill={color}
      />
      <Rect
        x="10.25"
        y="2"
        width="3.5"
        height="20"
        rx="1.75"
        fill={color}
        transform="rotate(45 12 12)"
      />
      <Rect
        x="10.25"
        y="2"
        width="3.5"
        height="20"
        rx="1.75"
        fill={color}
        transform="rotate(-45 12 12)"
      />
    </Svg>
  );
}
