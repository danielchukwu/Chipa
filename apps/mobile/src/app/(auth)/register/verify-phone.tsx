import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { OTPIcon } from "@/components/ui/icons/onboarding";
import { OtpInput } from "@/components/ui/input/otp-input";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function VerifyPhoneScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();
  const [phoneOtp, setPhoneOtp] = useState(data.phoneOtp);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Format masked phone number matching screenshot: 090 **** 3142
  const formatMaskedPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length >= 7) {
      const prefix = digits.slice(0, 3);
      const suffix = digits.slice(-4);
      return `${prefix} **** ${suffix}`;
    }
    return "090 **** 3142";
  };

  const maskedPhone = formatMaskedPhone(data.phoneNumber);
  const channelText =
    data.verificationChannel === "whatsapp" ? "whatsapp line" : "sms line";

  const handleContinue = async () => {
    if (phoneOtp.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await chipaApi.verifyPhoneOTP({
        phoneNumber: data.phoneNumber,
        otp: phoneOtp,
        iso2: data.country?.code || "NG",
      });
      updateField("phoneOtp", phoneOtp);
      updateField("phoneVerified", true);
      router.push("/register/personal-info" as any);
    } catch (err: any) {
      setError(err?.message || "Invalid or expired verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await chipaApi.sendPhoneOTP({
        phoneNumber: data.phoneNumber,
        channel: data.verificationChannel,
        iso2: data.country?.code || "NG",
      });
      Alert.alert(
        "Code Resent",
        `A new verification code was sent to your ${channelText} ${maskedPhone}.`,
      );
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to resend code");
    }
  };

  const subtitle = (
    <Text className="font-sans text-sm text-gray-600 leading-5">
      Enter the verification code we sent to your {channelText}{" "}
      <Text className="font-bold text-gray-900">{maskedPhone}</Text>.
    </Text>
  );

  return (
    <AuthScreenLayout
      badgeIcon={OTPIcon}
      title="Verify your phone number"
      subtitle={subtitle}
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={phoneOtp.length < 6 || loading}
      onButtonPress={handleContinue}
      footerContent={
        <Pressable
          onPress={() => router.push("/register/personal-info" as any)}
          className="py-2 items-center justify-center active:opacity-70"
        >
          <Text className="font-satoshi font-semibold text-base text-gray-500">
            Skip for now
          </Text>
        </Pressable>
      }
    >
      <View className="w-full">
        <OtpInput
          length={6}
          value={phoneOtp}
          onChangeOtp={(code) => {
            setPhoneOtp(code);
            if (code.length === 6) {
              updateField("phoneOtp", code);
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
