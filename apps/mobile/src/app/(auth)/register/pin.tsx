import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { PinIcon } from "@/components/ui/icons/onboarding";
import { PinInput } from "@/components/ui/input/pin-input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useAuth } from "@/context/auth-context";
import { useRegister } from "@/context/register-context";

import { chipaApi } from "@/lib/api";

export default function SetPinScreen() {
  const router = useRouter();
  const { data, updateField, reset } = useRegister();
  const { register } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleContinue = async () => {
    if (data.pin.length < 4) {
      setError("PIN must be 4 digits");
      return;
    }
    if (data.confirmPin.length < 4) {
      setError("Please confirm your 4-digit PIN");
      return;
    }
    if (data.pin !== data.confirmPin) {
      setError("PINs do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Set the user's transaction PIN on the backend
      await chipaApi.setTransactionPIN(data.pin);
    } catch (err: any) {
      setError(err?.message || "Failed to set transaction PIN. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Activate authenticated user session and route directly into the main app
    setOverlayVisible(true);
    try {
      await register({
        firstName: data.firstName || "Daniel",
        lastName: data.lastName || "Chukwu",
        email: data.email || "daniel@chipa.com",
      });
      setOverlayVisible(false);
      reset();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(tabs)/home" as any);
    } catch {
      setOverlayVisible(false);
      reset();
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace("/(tabs)/home" as any);
    }
  };

  const canContinue =
    data.pin.length === 4 && data.confirmPin.length === 4 && !loading;

  return (
    <>
      <AuthScreenLayout
        badgeIcon={PinIcon}
        title="Set your PIN"
        subtitle="Enter a secure pin for login and transactions."
        buttonTitle="Continue"
        buttonLoading={loading}
        buttonDisabled={!canContinue}
        onButtonPress={handleContinue}
      >
        <View className="w-full">
          {/* PIN input */}
          <PinInput
            label="PIN"
            value={data.pin}
            onChangePin={(val) => {
              updateField("pin", val);
              if (error) setError("");
            }}
            secureTextEntry
            autoFocus
          />

          {/* Confirm PIN input */}
          <PinInput
            label="Confirm PIN"
            value={data.confirmPin}
            onChangePin={(val) => {
              updateField("confirmPin", val);
              if (error) setError("");
            }}
            secureTextEntry
            error={error}
          />
        </View>
      </AuthScreenLayout>

      {/* Branded loading overlay while finalizing activation */}
      <LoadingOverlay visible={overlayVisible} />
    </>
  );
}
