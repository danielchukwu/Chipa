import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/input/app-input";
import { ChipaLogo } from "@/components/chipa-logo";
import { useAuth } from "@/context/auth-context";

// ─── Email validation ────────────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function LoginEmailScreen() {
  const router = useRouter();
  const { loginForm, updateLoginForm, validateCredentials } = useAuth();

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    let valid = true;

    if (!loginForm.email.trim()) {
      setEmailError("Please enter your email address");
      valid = false;
    } else if (!isValidEmail(loginForm.email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!loginForm.password) {
      setPasswordError("Please enter your password");
      valid = false;
    } else if (loginForm.password.length < 5) {
      setPasswordError("Password must be at least 5 characters");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setLoading(true);
    const res = await validateCredentials(loginForm.email, loginForm.password);
    setLoading(false);

    if (res.success) {
      router.push("/(auth)/login/pin" as any);
    } else {
      setPasswordError(res.error || "Invalid email or password");
    }
  };

  const canContinue =
    loginForm.email.trim().length > 0 &&
    loginForm.password.length > 0 &&
    !loading;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top logo — top-left corner, matching screenshot */}
        <View className="px-6 pt-3 pb-2">
          <View className="w-11 h-11 rounded-full bg-gray-50 border border-gray-100 items-center justify-center shadow-sm">
            <ChipaLogo size={30} />
          </View>
        </View>

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
              {/* Title */}
              <Text className="font-satoshi text-[34px] font-extrabold text-gray-900 leading-[40px] tracking-[-0.8px] mt-4 mb-8">
                Log in
              </Text>

              {/* Form */}
              <View className="gap-5">
                <AppInput
                  label="Email address"
                  placeholder="Enter email address"
                  value={loginForm.email}
                  onChangeText={(t) => {
                    updateLoginForm("email", t);
                    if (emailError) setEmailError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  error={emailError}
                />

                <AppInput
                  label="Password"
                  placeholder="Enter Password"
                  value={loginForm.password}
                  onChangeText={(t) => {
                    updateLoginForm("password", t);
                    if (passwordError) setPasswordError("");
                  }}
                  isPassword
                  error={passwordError}
                />

                <View className="mt-6 px-5">
                  <AppButton
                    title="Continue"
                    variant="primary"
                    onPress={handleContinue}
                    loading={loading}
                    disabled={!canContinue}
                  />

                  <View className="flex-row items-center justify-center mt-5">
                    <Text className="font-sans text-sm text-gray-500">
                      Don&apos;t have an account?{" "}
                    </Text>
                    <Pressable
                      onPress={() => router.replace("/(auth)/register" as any)}
                      hitSlop={8}
                    >
                      <Text className="font-sans text-sm font-bold text-gray-900">
                        Sign up
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>

        {/* Sticky bottom section */}
        {/* <View
          className="px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
          <AppButton
            title="Continue"
            variant="primary"
            onPress={handleContinue}
            disabled={!canContinue}
          />

          <View className="flex-row items-center justify-center mt-5">
            <Text className="font-sans text-sm text-gray-500">
              Don&apos;t have an account?{' '}
            </Text>
            <Pressable
              onPress={() => router.replace('/(auth)/register' as any)}
              hitSlop={8}>
              <Text className="font-sans text-sm font-bold text-gray-900">
                Sign up
              </Text>
            </Pressable>
          </View>
        </View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
