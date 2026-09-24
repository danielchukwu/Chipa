import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { PhoneIcon } from "@/components/ui/icons/onboarding";
import { PhoneInput } from "@/components/ui/input/phone-input";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function EnterPhoneScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSkip = () => {
    router.push("/register/personal-info" as any);
  };

  const handleContinue = async () => {
    const cleaned = data.phoneNumber.replace(/\s+/g, "");
    if (!cleaned) {
      setError("Please enter your phone number");
      return;
    }
    if (cleaned.length < 8) {
      setError("Please enter a valid phone number");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Store phone info in backend (unverified state for future verification)
      await chipaApi.savePhoneNumber({
        phoneNumber: data.phoneNumber.trim(),
        iso2: data.country?.code || "NG",
      });
    } catch (err: any) {
      // Graceful non-blocking fallback so registration progresses smoothly
      console.warn("Could not save phone number immediately to API:", err?.message);
    } finally {
      setLoading(false);
      updateField("phoneVerified", false);
      router.push("/register/personal-info" as any);
    }
  };

  return (
    <AuthScreenLayout
      badgeIcon={PhoneIcon}
      title="Enter your phone number"
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={!data.phoneNumber.trim() || loading}
      onButtonPress={handleContinue}
      footerContent={
        <Pressable
          onPress={handleSkip}
          className="py-2 items-center justify-center active:opacity-70"
        >
          <Text className="font-satoshi font-semibold text-base text-gray-500">
            Skip for now
          </Text>
        </Pressable>
      }
    >
      <View className="w-full mt-2">
        <PhoneInput
          country={data.country}
          onSelectCountry={(country) => updateField("country", country)}
          value={data.phoneNumber}
          onChangeText={(text) => {
            updateField("phoneNumber", text);
            if (error) setError("");
          }}
          error={error}
        />
      </View>
    </AuthScreenLayout>
  );
}
