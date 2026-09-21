import React from 'react';
import { Text, View } from 'react-native';

import {
  CHPIcon,
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from '@/components/ui/icons/currencies';

export { CHPIcon, EURIcon, GBPIcon, NGNIcon, USDIcon };

export function GTBankLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-xl bg-[#E64B00] items-center justify-center p-1 relative shadow-xs">
      <View className="absolute top-1.5 right-1.5 w-2 h-2 rounded-xs bg-white" />
      <Text
        className="font-satoshi font-black text-white tracking-tighter"
        style={{ fontSize: size * 0.22 }}>
        GTBank
      </Text>
    </View>
  );
}

export function NigeriaRoundFlag({ size = 44 }: { size?: number }) {
  return <NGNIcon size={size} />;
}

export function USRoundFlag({ size = 44 }: { size?: number }) {
  return <USDIcon size={size} />;
}

export function UKRoundFlag({ size = 44 }: { size?: number }) {
  return <GBPIcon size={size} />;
}

export function EURoundFlag({ size = 44 }: { size?: number }) {
  return <EURIcon size={size} />;
}

export function ChipaRoundLogo({ size = 44 }: { size?: number }) {
  return <CHPIcon size={size} />;
}

export function DStvLogo({ size = 44 }: { size?: number }) {
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

export function DiscoElectricityLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0A2540] items-center justify-center p-1 shadow-xs">
      <View className="items-center justify-center">
        <Text
          className="font-satoshi font-black text-[#FACC15] tracking-tighter"
          style={{ fontSize: size * 0.26 }}>
          ⚡EEDC
        </Text>
      </View>
    </View>
  );
}

export function OPayLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
      <View
        style={{ width: size * 0.72, height: size * 0.72 }}
        className="rounded-full border-[3.5px] border-[#00B894] items-center justify-center relative">
        <View className="absolute left-[-2px] w-2 h-1 bg-white" />
        <View className="absolute left-[-1px] w-2.5 h-[3px] bg-[#1E293B] rounded-full" />
      </View>
    </View>
  );
}

export function AccessBankLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-white border border-gray-100 items-center justify-center shadow-2xs">
      <View
        style={{ width: size * 0.55, height: size * 0.55 }}
        className="border-[2.5px] border-[#F26522] rotate-45 items-center justify-center relative">
        <View
          style={{ width: size * 0.3, height: size * 0.3 }}
          className="border-[2px] border-[#F26522]"
        />
      </View>
    </View>
  );
}

export function MoniepointLogo({ size = 44 }: { size?: number }) {
  return (
    <View
      style={{ width: size, height: size }}
      className="rounded-full bg-[#0366D6] items-center justify-center shadow-xs">
      <Text
        className="font-satoshi font-black text-white"
        style={{ fontSize: size * 0.44, lineHeight: size * 0.52 }}>
        M
      </Text>
    </View>
  );
}
