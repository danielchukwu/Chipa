import React, { useEffect, useState } from "react";
import { Animated, Modal, View } from "react-native";

import { LogoIcon } from "@/components/ui/icons/logo-icon";

export interface LoadingOverlayProps {
  visible: boolean;
}

/**
 * App-standard full-screen loading state: a semi-dark overlay with the Chipa
 * logo pulsing 10 → 100 → 10 → 100 opacity for a premium feel.
 *
 * Usage: mount this alongside a screen and toggle `visible`. When integrating
 * a real backend, keep `visible={true}` until the API response resolves.
 */
export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  const [opacity] = useState(() => new Animated.Value(0.1));

  useEffect(() => {
    if (!visible) {
      opacity.setValue(0.1);
      return;
    }

    // Infinite pulsation loop: 0.15 → 1.0 → 0.15
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.15,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [visible, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/60 items-center justify-center">
        <Animated.View style={{ opacity }}>
          <LogoIcon width={40} height={40} />
        </Animated.View>
      </View>
    </Modal>
  );
}
