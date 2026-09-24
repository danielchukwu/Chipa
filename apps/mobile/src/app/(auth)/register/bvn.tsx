import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { useRegister } from "@/context/register-context";
import { chipaApi } from "@/lib/api";

export default function BVNVerificationScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();

  const [bvn, setBvn] = useState(data.bvn || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBvnValid = bvn.trim().length === 11 && /^\d+$/.test(bvn.trim());

  const handleVerify = async () => {
    if (!isBvnValid) {
      setError("BVN must be exactly 11 digits");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // 1. Submit Tier 1 KYC with BVN to Paystack validation
      await chipaApi.submitTier1({
        country_code: data.country?.code || "NG",
        bvn: bvn.trim(),
      });

      // 2. Persist in register context
      updateField("bvn", bvn.trim());

      // 3. Navigate to Set PIN screen
      router.push("/register/pin" as any);
    } catch (err: any) {
      setError(
        err?.message || "Failed to verify BVN. Please double check and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/register/pin" as any);
  };

  const handleDialUSSD = () => {
    Linking.openURL("tel:*565*0#").catch(() => {
      Alert.alert("Dial BVN Code", "Please dial *565*0# from your phone dialer.");
    });
  };

  return (
    <AuthScreenLayout
      badgeEmoji="🛡️"
      title="Verify your identity"
      subtitle="Central Bank of Nigeria (CBN) regulations require your 11-digit BVN to issue your dedicated bank account."
      buttonTitle="Verify & Continue"
      buttonLoading={loading}
      buttonDisabled={!isBvnValid || loading}
      onButtonPress={handleVerify}
    >
      <View className="w-full">
        <AppInput
          label="Bank Verification Number (BVN)"
          placeholder="Enter 11-digit BVN"
          value={bvn}
          onChangeText={(val) => {
            const digits = val.replace(/\D/g, "").slice(0, 11);
            setBvn(digits);
            if (error) setError("");
          }}
          keyboardType="number-pad"
          maxLength={11}
          autoFocus
        />

        {/* Quick Dial Helper */}
        <Pressable
          onPress={handleDialUSSD}
          className="flex-row items-center justify-between bg-[#F8F8FB] border border-gray-100 rounded-xl px-4 py-3 mt-3 active:bg-gray-100"
        >
          <View className="flex-1 mr-2">
            <Text className="font-sans text-xs text-gray-500 font-medium">
              Forgot your BVN?
            </Text>
            <Text className="font-satoshi text-xs font-bold text-brand mt-0.5">
              Dial *565*0# on your registered SIM
            </Text>
          </View>
          <Text className="text-base">📞</Text>
        </Pressable>

        {/* Security & Privacy Reassurance Box */}
        <View className="bg-[#FFF9EB] border border-amber-200/70 rounded-2xl p-4 mt-5">
          <View className="flex-row items-start mb-2">
            <Text className="text-base mr-2">🔒</Text>
            <Text className="flex-1 font-sans text-xs text-gray-800 leading-4 font-medium">
              Your BVN does not give Chipa access to your other bank accounts or balances.
            </Text>
          </View>
          <View className="flex-row items-start">
            <Text className="text-base mr-2">🛡️</Text>
            <Text className="flex-1 font-sans text-xs text-gray-700 leading-4">
              It is only used to verify your legal identity and protect against fraud, encrypted with 256-bit AES banking encryption.
            </Text>
          </View>
        </View>

        {/* Skip option */}
        <Pressable
          onPress={handleSkip}
          hitSlop={12}
          className="mt-6 py-2 items-center justify-center active:opacity-60"
        >
          <Text className="font-sans text-sm font-semibold text-gray-500">
            Skip for now & verify later in app
          </Text>
        </Pressable>

        {error ? (
          <Text className="font-sans text-xs text-red-500 mt-4 text-center">
            {error}
          </Text>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}
