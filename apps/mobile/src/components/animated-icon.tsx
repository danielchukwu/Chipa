import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { LogoIcon } from '@/components/ui/icons/logo-icon';

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const insets = useSafeAreaInsets();

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(12);
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    // 1. "Chipa" text smoothly appears from opacity 0 to 1 with a gentle upward float
    textOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    textTranslateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // 2. Hold momentarily so the brand is visible, then smoothly fade out the entire overlay
    overlayOpacity.value = withDelay(
      1400,
      withTiming(
        0,
        {
          duration: 500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        },
        (finished) => {
          'worklet';
          if (finished) {
            scheduleOnRN(setVisible, false);
          }
        }
      )
    );
  }, [textOpacity, textTranslateY, overlayOpacity]);

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 bg-white items-center justify-center z-[1000]"
      style={overlayAnimatedStyle}>
      {/* Center Chipa Vector Logo (matches 76px native splash icon) */}
      <View className="items-center justify-center">
        <LogoIcon width={76} height={76} />
      </View>

      {/* Bottom Brand Wordmark with Smooth 0 -> 100 Opacity Fade-in */}
      <Animated.View
        className="absolute items-center justify-center"
        style={[
          { bottom: Math.max(insets.bottom + 20, 48) },
          textAnimatedStyle,
        ]}>
        <Text className="font-satoshi text-[26px] font-extrabold text-gray-900 tracking-[-0.5px]">
          Chipa
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return (
    <View className="items-center justify-center w-16 h-16">
      <LogoIcon width={64} height={64} />
    </View>
  );
}
