import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

export type TvProviderId = 'dstv' | 'gotv' | 'startimes' | 'startimes_on' | 'showmax';

export function DStvLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0089CF] items-center justify-center shadow-xs">
      <Text
        className="font-satoshi font-black text-white italic tracking-tighter"
        style={{ fontSize: size * 0.28 }}>
        DStv
      </Text>
    </View>
  );
}

export function GOtvLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
      <View className="flex-row items-baseline">
        <Text
          className="font-satoshi font-black text-[#E50914] tracking-tight"
          style={{ fontSize: size * 0.32 }}>
          GO
        </Text>
        <Text
          className="font-satoshi font-black text-[#10B981] tracking-tight"
          style={{ fontSize: size * 0.28 }}>
          tv
        </Text>
      </View>
    </View>
  );
}

export function StarTimesLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
      <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
        {/* Colorful 4-quadrant star */}
        <Polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="#0284C7" />
        <Polygon points="12,2 15,9 12,12 9,9" fill="#F59E0B" />
        <Polygon points="22,12 15,15 12,12 15,9" fill="#EF4444" />
        <Polygon points="12,22 9,15 12,12 15,15" fill="#10B981" />
      </Svg>
    </View>
  );
}

export function StarTimesOnLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0284C7] items-center justify-center shadow-xs overflow-hidden">
      <View className="bg-[#F59E0B] rounded-xs px-1 py-0.2 mb-0.5">
        <Text
          className="font-satoshi font-black text-black tracking-tighter"
          style={{ fontSize: size * 0.22 }}>
          ON
        </Text>
      </View>
      <Text
        className="font-sans font-bold text-white text-[8px] tracking-tighter"
        style={{ fontSize: size * 0.18 }}>
        StarTimes
      </Text>
    </View>
  );
}

export function ShowmaxLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0B132B] items-center justify-center shadow-xs">
      <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="11" fill="#0B132B" />
        {/* Pink / Red Showmax Cross */}
        <Path
          d="M6 7l8 10h4L10 7H6z"
          fill="#FF0055"
        />
        <Path
          d="M18 7l-8 10H6l8-10h4z"
          fill="#00E5FF"
        />
      </Svg>
    </View>
  );
}

export function TvProviderLogo({
  provider,
  size = 36,
}: {
  provider: TvProviderId;
  size?: number;
}) {
  switch (provider) {
    case 'dstv':
      return <DStvLogo size={size} />;
    case 'gotv':
      return <GOtvLogo size={size} />;
    case 'startimes':
      return <StarTimesLogo size={size} />;
    case 'startimes_on':
      return <StarTimesOnLogo size={size} />;
    case 'showmax':
      return <ShowmaxLogo size={size} />;
    default:
      return <DStvLogo size={size} />;
  }
}
