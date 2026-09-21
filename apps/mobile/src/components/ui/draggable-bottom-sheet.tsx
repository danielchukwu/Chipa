import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { cn } from "@/lib/utils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface DraggableBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  containerClassName?: string;
}

export function DraggableBottomSheet({
  visible,
  onClose,
  children,
  showHandle = true,
  containerClassName,
}: DraggableBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(360);

  // Animated translation along Y axis
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const closeSheet = (onComplete?: () => void) => {
    Animated.timing(panY, {
      toValue: sheetHeight || 360,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
      onComplete?.();
    });
  };

  const openSheet = () => {
    setModalVisible(true);
    panY.setValue(sheetHeight || 360);
    Animated.spring(panY, {
      toValue: 0,
      damping: 24,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (visible) {
      openSheet();
    } else if (modalVisible) {
      closeSheet();
    }
  }, [visible]);

  // PanResponder for smooth dragging gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Intercept downward drag gestures
        return gestureState.dy > 6 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          // Dragging downwards follows finger 1:1
          panY.setValue(gestureState.dy);
        } else {
          // Dragging upwards adds slight elastic resistance
          panY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Dismiss if dragged down beyond 90px or flicked with downward velocity
        if (gestureState.dy > 90 || gestureState.vy > 0.6) {
          closeSheet();
        } else {
          // Snap back smoothly to open position
          Animated.spring(panY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // Handle-specific PanResponder with immediate touch capture
  const handlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        } else {
          panY.setValue(gestureState.dy * 0.15);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.6) {
          closeSheet();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            damping: 22,
            stiffness: 240,
            mass: 0.8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  // Interpolated backdrop opacity based on sheet position
  const backdropOpacity = panY.interpolate({
    inputRange: [0, sheetHeight || 360],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => closeSheet()}
    >
      <View className="flex-1 justify-end">
        {/* Animated Dimmed Backdrop */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              opacity: backdropOpacity,
            },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => closeSheet()}
            accessibilityLabel="Dismiss bottom sheet"
          />
        </Animated.View>

        {/* Animated Draggable Sheet */}
        <Animated.View
          onLayout={(e: LayoutChangeEvent) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 10) {
              setSheetHeight(h);
            }
          }}
          style={{
            transform: [{ translateY: panY }],
            paddingBottom: Math.max(insets.bottom, 28),
          }}
          className={cn(
            "bg-white rounded-t-[36px] px-6 pt-3 shadow-2xl",
            containerClassName,
          )}
          {...panResponder.panHandlers}
        >
          {/* Top Pill Handle (with direct instant gesture response) */}
          {showHandle && (
            <View
              {...handlePanResponder.panHandlers}
              className="w-full py-2.5 items-center mb-4"
            >
              <View className="w-12 h-1 bg-[#8E8E93] rounded-full" />
            </View>
          )}

          {/* Sheet Body */}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
