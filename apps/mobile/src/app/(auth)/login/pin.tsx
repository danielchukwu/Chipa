import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PinInput } from "@/components/ui/input/pin-input";
import { ChipaLogo } from "@/components/chipa-logo";
import { useAuth } from "@/context/auth-context";

export default function LoginPinScreen() {
  const router = useRouter();
  const { loginForm, preAuthData, loginWithPin } = useAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Derive a friendly display name from the verified profile or email
  const displayName =
    preAuthData?.firstName ||
    (loginForm.email ? loginForm.email.split("@")[0] : "there");

  const handleLogin = async () => {
    if (pin.length < 4) {
      setError("Please enter your 4-digit PIN");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await loginWithPin(pin);
      if (res.success) {
        if (router.canDismiss()) {
          router.dismissAll();
        }
        router.replace("/(tabs)/home" as any);
      } else {
        setLoading(false);
        setError(res.error || "Incorrect PIN. Please try again.");
      }
    } catch {
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1">
            {/* Top centered logo */}
            <View className="items-center pt-12 pb-6">
              <View className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 items-center justify-center shadow-sm">
                <ChipaLogo size={42} />
              </View>
            </View>

            {/* Welcome heading */}
            <View className="px-8 mb-10">
              <Text className="font-satoshi text-xl font-bold text-gray-900 tracking-[-0.4px] mb-1 text-center">
                Welcome back, {displayName}
              </Text>
              <Text className="font-sans text-sm text-gray-600 text-center">
                Enter your PIN
              </Text>
            </View>

            {/* PIN boxes — centered */}
            <View className="items-center px-6">
              <PinInput
                value={pin}
                onChangePin={(val) => {
                  setPin(val);
                  if (error) setError("");
                }}
                secureTextEntry
                autoFocus
                error={error}
              />

              {/* Forgot PIN */}
              <Pressable
                onPress={() => {
                  /* TODO: forgot PIN flow */
                }}
                hitSlop={10}
                className="mt-1 mb-8"
              >
                <Text className="font-sans text-sm text-gray-500">
                  Forgot PIN
                </Text>
              </Pressable>

              <View className="mt-6 px-5 w-full">
                <AppButton
                  title="Log in"
                  variant="primary"
                  onPress={handleLogin}
                  disabled={pin.length < 4 || loading}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* Branded loading overlay — matches registration flow */}
      <LoadingOverlay visible={loading} />
    </>
  );
}
