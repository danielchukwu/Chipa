import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";

export interface AuthScreenLayoutProps {
  badgeEmoji?: string;
  badgeComponent?: React.ReactNode;
  badgeIcon?: React.ComponentType<any> | React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  buttonTitle?: string;
  onButtonPress?: () => void;
  buttonLoading?: boolean;
  buttonDisabled?: boolean;
  footerContent?: React.ReactNode;
  onBackPress?: () => void;
}

export function AuthScreenLayout({
  badgeEmoji,
  badgeComponent,
  badgeIcon,
  title,
  subtitle,
  children,
  buttonTitle = "Continue",
  onButtonPress,
  buttonLoading = false,
  buttonDisabled = false,
  footerContent,
  onBackPress,
}: AuthScreenLayoutProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Back Navigation Bar */}
        <View className="px-5 pt-2 pb-2">
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            className="w-10 h-10 -ml-2 rounded-full items-center justify-center active:bg-gray-100"
          >
            <BackArrowIcon width={24} height={24} color="#111827" />
          </Pressable>
        </View>
        {/* Scrollable Content Container */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback
            onPress={Keyboard.dismiss}
            accessible={false}
          >
            <View className="flex-1">
              {/* Circular Badge Icon / Emoji */}
              {(badgeIcon || badgeComponent || badgeEmoji) && (
                <View
                  className="w-14 h-14 rounded-full bg-gray-50 items-center justify-center mb-6 mt-2 border border-gray-100"
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  {badgeIcon ? (
                    React.isValidElement(badgeIcon) ? (
                      badgeIcon
                    ) : (
                      React.createElement(
                        badgeIcon as React.ComponentType<any>,
                        {
                          width: 28,
                          height: 28,
                        },
                      )
                    )
                  ) : badgeComponent ? (
                    badgeComponent
                  ) : badgeEmoji ? (
                    <Text className="text-2xl">{badgeEmoji}</Text>
                  ) : null}
                </View>
              )}
              <View className="gap-3 mb-5">
                {/* Screen Title & Subtitle */}
                <Text className="font-satoshi text-[24px] font-bold text-gray-900 leading-[34px]">
                  {title}
                </Text>
                {subtitle && (
                  <View>
                    {typeof subtitle === "string" ? (
                      <Text className="font-inter text-lgq leading-6 text-gray-600">
                        {subtitle}
                      </Text>
                    ) : (
                      subtitle
                    )}
                  </View>
                )}
              </View>
              {/* Step Specific Form Content */}
              <View className="flex-1 mt-2">{children}</View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        {/* Sticky Bottom Actions */}
        <View
          className={`px-6 pt-3 ${isKeyboardVisible ? "min-h-10" : "min-h-40"}`}
          style={{
            paddingBottom: isKeyboardVisible ? 12 : Math.max(insets.bottom, 16),
          }}
        >
          {buttonTitle && (
            <AppButton
              title={buttonTitle}
              variant="primary"
              onPress={onButtonPress}
              loading={buttonLoading}
              disabled={buttonDisabled}
            />
          )}
          {footerContent && <View className="mt-4">{footerContent}</View>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
