import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

export interface BlinkingCursorProps {
  height?: number;
  width?: number;
  color?: string;
}

export function BlinkingCursor({
  height = 24,
  width = 2,
  color = '#111827',
}: BlinkingCursorProps) {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.cursor,
        {
          height,
          width,
          backgroundColor: color,
          borderRadius: width / 2,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  cursor: {
    alignSelf: 'center',
  },
});
