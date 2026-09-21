import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { MailIcon } from "@/components/ui/icons/onboarding";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function EnterEmailScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleContinue = async () => {
    if (!data.email.trim()) {
      setError("Please enter your email address");
      return;
    }
    if (!validateEmail(data.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await chipaApi.sendSignupEmailOTP(data.email);
      if (res?.emailVerificationToken) {
        updateField("emailVerificationToken", res.emailVerificationToken);
      }
      router.push("/register/verify-email" as any);
    } catch (err: any) {
      setError(err?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginPress = () => {
    try {
      router.push("/login" as any);
    } catch {
      Alert.alert("Log in", "Redirecting to login...");
    }
  };

  const footer = (
    <View className="items-center">
      {/* Already have an account row */}
      <View className="flex-row items-center justify-center my-3">
        <Text className="font-sans text-sm text-gray-500">
          Already have an account?{" "}
        </Text>
        <Pressable onPress={handleLoginPress} hitSlop={8}>
          <Text className="font-sans text-sm font-bold text-gray-900">
            Log in
          </Text>
        </Pressable>
      </View>

      {/* Legal Disclaimers with Orange Links matching Screenshot 2 */}
      <View className="mt-4 px-2">
        <Text className="font-sans text-xs text-center text-gray-500 leading-5">
          By continuing, you accept our{" "}
          <Text
            className="text-brand underline font-medium"
            onPress={() =>
              Alert.alert("ESIGN Policy", "Opening ESIGN policy...")
            }
          >
            ESIGN policy
          </Text>{" "}
          and agree to our{" "}
          <Text
            className="text-brand underline font-medium"
            onPress={() =>
              Alert.alert("Terms and Conditions", "Opening Terms...")
            }
          >
            Terms and Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="text-brand underline font-medium"
            onPress={() =>
              Alert.alert("Privacy Policy", "Opening Privacy Policy...")
            }
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );

  return (
    <AuthScreenLayout
      badgeIcon={MailIcon}
      title="Enter your email address"
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={loading}
      onButtonPress={handleContinue}
      footerContent={footer}
    >
      <View className="w-full mt-2">
        <AppInput
          label="Email address"
          placeholder="Enter email address"
          value={data.email}
          onChangeText={(text) => {
            updateField("email", text);
            if (error) setError("");
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          error={error}
        />
      </View>
    </AuthScreenLayout>
  );
}
