import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ChipaLogo } from "@/components/chipa-logo";
import { AppButton } from "@/components/ui/app-button";
import { PaginationDots } from "@/components/welcome/pagination-dots";
import { WELCOME_OFFERINGS, WelcomeOffering } from "@/components/welcome/types";
import { VisualCard } from "@/components/welcome/visual-card";
import { useAuth } from "@/context/auth-context";

export default function WelcomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/home" as any);
    }
  }, [user]);
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const flatListRef = useRef<FlatList<WelcomeOffering>>(null);
  const autoPlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-advance carousel every 4.5 seconds if user is not actively touching/dragging
  useEffect(() => {
    if (isInteracting) return;

    autoPlayTimerRef.current = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % WELCOME_OFFERINGS.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [activeIndex, isInteracting]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / windowWidth);
      if (
        index >= 0 &&
        index < WELCOME_OFFERINGS.length &&
        index !== activeIndex
      ) {
        setActiveIndex(index);
      }
    },
    [windowWidth, activeIndex],
  );

  const handleDotSelect = useCallback((index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const handleCreateAccount = () => {
    router.push("/(auth)/register" as any);
  };

  const handleLogin = () => {
    router.push("/(auth)/login" as any);
  };

  const renderOfferingItem = ({ item }: { item: WelcomeOffering }) => {
    return (
      <View
        className="flex-1 justify-between px-6"
        style={{ width: windowWidth }}
      >
        <View className="mb-4 h-44">
          <Text className="font-satoshi text-[32px] font-bold mb-2">
            {item.title}
          </Text>
          <Text className="font-sans text-lg font-normal text-gray-600 leading-[22px]">
            {item.subtitle}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center pb-1.5">
          <VisualCard offering={item} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Top Header Logo */}
      <View className="flex-row items-center px-6 pt-2 pb-3">
        <ChipaLogo size={42} />
      </View>

      {/* Offerings Carousel */}
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={WELCOME_OFFERINGS}
          keyExtractor={(item) => item.id}
          renderItem={renderOfferingItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => setIsInteracting(false)}
          onScrollBeginDrag={() => setIsInteracting(true)}
          onScrollEndDrag={() => setIsInteracting(false)}
          getItemLayout={(_, index) => ({
            length: windowWidth,
            offset: windowWidth * index,
            index,
          })}
        />
      </View>

      {/* Pagination Indicator Dots */}
      <PaginationDots
        total={WELCOME_OFFERINGS.length}
        activeIndex={activeIndex}
        onSelect={handleDotSelect}
      />

      {/* Bottom Action Buttons */}
      <View
        className="px-6 gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <AppButton
          title="Create an Account"
          variant="brand"
          onPress={handleCreateAccount}
        />

        <AppButton title="Log in" variant="outline" onPress={handleLogin} />
      </View>
    </SafeAreaView>
  );
}
