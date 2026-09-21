import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { PasswordIcon } from "@/components/ui/icons/onboarding";
import {
  PasswordChecklist,
  isPasswordValid,
} from "@/components/ui/password-checklist";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function CreatePasswordScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!isPasswordValid(data.password)) {
      setError("Please satisfy all password criteria");
      return;
    }
    if (data.password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await chipaApi.signup({
        countryId: data.country?.id || 161,
        email: data.email,
        password: data.password,
        verificationCode: data.emailVerificationToken || data.otp,
      });

      if (res?.accessToken) {
        updateField("accessToken", res.accessToken);
      }

      router.push("/register/phone" as any);
    } catch (err: any) {
      setError(err?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canContinue =
    isPasswordValid(data.password) && confirmPassword.length > 0 && !loading;

  return (
    <AuthScreenLayout
      badgeIcon={PasswordIcon}
      title="Create your password"
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={!canContinue}
      onButtonPress={handleContinue}
    >
      <View className="w-full mt-2">
        {/* Password input */}
        <AppInput
          label="Password"
          placeholder="Enter password"
          isPassword
          value={data.password}
          onChangeText={(text) => {
            updateField("password", text);
            if (error) setError("");
          }}
          autoCapitalize="none"
        />

        {/* Dynamic Criteria Checklist */}
        <PasswordChecklist password={data.password} />

        {/* Confirm password input */}
        <AppInput
          label="Confirm password"
          placeholder="Confirm your password"
          isPassword
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (error) setError("");
          }}
          autoCapitalize="none"
          error={error}
          containerClassName="mt-2"
        />
      </View>
    </AuthScreenLayout>
  );
}
