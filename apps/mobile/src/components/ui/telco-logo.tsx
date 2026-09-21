import React from 'react';
import { Text, View } from 'react-native';

export type TelcoProvider = 'mtn' | 'glo' | 'airtel' | '9mobile';

export function TelcoLogo({
  provider,
  size = 36,
}: {
  provider: TelcoProvider;
  size?: number;
}) {
  if (provider === 'mtn') {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-full bg-[#FFCC00] items-center justify-center shadow-xs">
        <View className="border border-black rounded-full px-1.5 py-0.5">
          <Text className="font-satoshi font-black text-black tracking-tighter" style={{ fontSize: size * 0.28 }}>
            MTN
          </Text>
        </View>
      </View>
    );
  }

  if (provider === 'glo') {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-full bg-[#27AE60] items-center justify-center shadow-xs">
        <Text className="font-sans font-black text-white italic" style={{ fontSize: size * 0.38 }}>
          glo
        </Text>
      </View>
    );
  }

  if (provider === 'airtel') {
    return (
      <View
        style={{ width: size, height: size }}
        className="rounded-full bg-[#E50914] items-center justify-center shadow-xs">
        <Text className="font-sans font-bold text-white tracking-tighter" style={{ fontSize: size * 0.3 }}>
          airtel
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#005D2D] items-center justify-center shadow-xs">
      <Text className="font-sans font-black text-[#A4C639]" style={{ fontSize: size * 0.4 }}>
        9
      </Text>
    </View>
  );
}
