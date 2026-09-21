import React from 'react';
import { View } from 'react-native';

import { LogoIcon } from '@/components/ui/icons/logo-icon';

interface ChipaLogoProps {
  size?: number;
}

export function ChipaLogo({ size = 36 }: ChipaLogoProps) {
  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size }}>
      <LogoIcon width={size} height={size} />
    </View>
  );
}
