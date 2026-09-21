import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { OTPIcon } from "@/components/ui/icons/onboarding";
import { OtpInput } from "@/components/ui/input/otp-input";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();
  const [otp, setOtp] = useState(data.otp);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const displayEmail = data.email.trim() || "your email";

  const handleContinue = async () => {
    if (otp.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await chipaApi.verifySignupEmailOTP(data.email, otp);
      if (res?.emailVerificationToken) {
        updateField("emailVerificationToken", res.emailVerificationToken);
      }
      updateField("otp", otp);
      router.push("/register/password" as any);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await chipaApi.sendSignupEmailOTP(data.email);
      Alert.alert(
        "Code Sent",
        `A new verification code was sent to ${displayEmail}.`,
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to resend code");
    }
  };

  const subtitle = (
    <Text className="font-sans text-sm text-gray-600 leading-5">
      Enter the verification code we sent to{" "}
      <Text className="font-bold text-gray-900">{displayEmail}</Text>.
    </Text>
  );

  return (
    <AuthScreenLayout
      badgeIcon={OTPIcon}
      title="Verify your email"
      subtitle={subtitle}
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={otp.length < 6 || loading}
      onButtonPress={handleContinue}
    >
      <View className="w-full">
        <OtpInput
          length={6}
          value={otp}
          onChangeOtp={(code) => {
            setOtp(code);
            if (code.length === 6) {
              updateField("otp", code);
            }
            if (error) setError("");
          }}
          onResend={handleResend}
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
