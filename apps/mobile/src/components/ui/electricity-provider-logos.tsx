import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';

export type ElectricityProviderId =
  | 'aedc'
  | 'ibedc'
  | 'jed'
  | 'phed'
  | 'kaedco'
  | 'ikedc'
  | 'ekedc'
  | 'eedc'
  | 'kedco'
  | 'bedc'
  | 'startimes_energy'
  | 'yedc';

export function ElectricityProviderLogo({
  provider,
  size = 36,
}: {
  provider: ElectricityProviderId;
  size?: number;
}) {
  switch (provider) {
    case 'aedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
          <Text
            className="font-satoshi font-black text-[#0284C7] tracking-tighter"
            style={{ fontSize: size * 0.26 }}>
            AEDC
          </Text>
        </View>
      );
    case 'ibedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-[#0F172A] items-center justify-center shadow-xs">
          <Text
            className="font-satoshi font-black text-[#FACC15] tracking-tighter"
            style={{ fontSize: size * 0.24 }}>
            IBEDC
          </Text>
        </View>
      );
    case 'jed':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2" fill="none" />
            <Path d="M6 14c3-5 9-5 12 0" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
            <Path d="M8 9c2-2 6-2 8 0" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
      );
    case 'phed':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
          <Svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" fill="none" />
            <Path d="M12 3v18M3 12h18" stroke="#10B981" strokeWidth="1.5" />
          </Svg>
        </View>
      );
    case 'kaedco':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-[#15803D] items-center justify-center shadow-xs">
          <Text
            className="font-satoshi font-black text-white italic"
            style={{ fontSize: size * 0.32 }}>
            ke
          </Text>
        </View>
      );
    case 'ikedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
          <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24">
            <Circle cx="12" cy="12" r="10" stroke="#EA580C" strokeWidth="1.5" fill="none" />
            <Path d="M12 6c-2 3-3 5-1 8 1 2 4 2 5 0 2-4-2-6-4-8z" fill="#EA580C" />
          </Svg>
        </View>
      );
    case 'ekedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
          <Text
            className="font-satoshi font-black text-[#1E3A8A] tracking-tighter"
            style={{ fontSize: size * 0.24 }}>
            EKEDC
          </Text>
        </View>
      );
    case 'eedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
          <Text
            className="font-satoshi font-black text-[#DC2626] tracking-tighter"
            style={{ fontSize: size * 0.24 }}>
            EEDC
          </Text>
        </View>
      );
    case 'kedco':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-[#1E3A8A] items-center justify-center shadow-xs">
          <Text
            className="font-satoshi font-black text-white"
            style={{ fontSize: size * 0.36 }}>
            K
          </Text>
        </View>
      );
    case 'bedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
          <Text
            className="font-satoshi font-black text-[#15803D] tracking-tighter"
            style={{ fontSize: size * 0.24 }}>
            BEDC
          </Text>
        </View>
      );
    case 'startimes_energy':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-white border border-gray-100 items-center justify-center p-1 shadow-2xs">
          <Svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24">
            <Polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" fill="#0284C7" />
            <Polygon points="12,2 15,9 12,12 9,9" fill="#F59E0B" />
            <Polygon points="22,12 15,15 12,12 15,9" fill="#EF4444" />
            <Polygon points="12,22 9,15 12,12 15,15" fill="#10B981" />
          </Svg>
        </View>
      );
    case 'yedc':
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-[#991B1B] items-center justify-center shadow-xs">
          <Text
            className="font-satoshi font-black text-white tracking-tighter"
            style={{ fontSize: size * 0.26 }}>
            YEDC
          </Text>
        </View>
      );
    default:
      return (
        <View
          style={{ width: size, height: size }}
          className="rounded-full bg-gray-900 items-center justify-center shadow-xs">
          <Text className="text-white text-xs font-bold">⚡</Text>
        </View>
      );
  }
}
