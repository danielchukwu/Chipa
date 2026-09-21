import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function ReferralCodeScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasCode = data.referralCode.trim().length > 0;
  const buttonLabel = hasCode ? "Continue" : "Skip";

  const handleAdvance = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Save complete personal details, address & referral code
      await chipaApi.saveOnboardingProfile({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        dob: data.dob,
        countryCode: data.countryOfResidence?.code || data.country?.code || "NG",
        currentCountry: data.countryOfResidence?.id || data.country?.id || 161,
        state: data.state,
        city: data.city,
        streetAddress: data.streetAddress,
        postalCode: data.postCode,
        referralSource: data.referralSource,
        referralCode: hasCode ? data.referralCode.trim() : undefined,
      });

      // 2. Navigate to Set PIN screen to finalize onboarding
      router.push("/register/pin" as any);
    } catch (err: any) {
      setError(err?.message || "Failed to save onboarding details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      badgeEmoji="📌"
      title="Enter referral code or skip"
      subtitle="Enter a referral code if you have one, else tap skip to continue."
      buttonTitle={buttonLabel}
      buttonLoading={loading}
      buttonDisabled={loading}
      onButtonPress={handleAdvance}
    >
      <View className="w-full">
        <AppInput
          label="Referral code (Optional)"
          placeholder="Enter referral code"
          value={data.referralCode}
          onChangeText={(val) => {
            updateField("referralCode", val);
            if (error) setError("");
          }}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error ? (
          <Text className="font-sans text-xs text-red-500 mt-3 text-center">
            {error}
          </Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}
