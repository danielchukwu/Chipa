import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { CopyIcon } from "@/components/ui/icons/copy-icon";
import {
  EURoundFlag,
  NigeriaRoundFlag,
  UKRoundFlag,
  USRoundFlag,
} from "@/components/ui/transaction-brand-logos";

type SupportedCurrency = "USD" | "NGN" | "GBP" | "EUR";

function WarningTriangleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2L1 21h22L12 2z" fill="#F59E0B" />
      <Path
        d="M12 9v5M12 17.5v.5"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

interface AccountFieldProps {
  label: string;
  value: string;
  onCopy: () => void;
}

function AccountField({ label, value, onCopy }: AccountFieldProps) {
  return (
    <View className="bg-[#F8F8FB] rounded-2xl px-4 py-3.5 flex-row items-center justify-between">
      <View className="flex-1 mr-2">
        <Text className="font-sans text-xs text-gray-400 font-medium mb-1">
          {label}
        </Text>
        <Text
          numberOfLines={1}
          className="font-satoshi text-base font-bold text-gray-900"
        >
          {value}
        </Text>
      </View>
      <Pressable
        onPress={onCopy}
        hitSlop={8}
        className="w-8 h-8 rounded-full items-center justify-center active:bg-gray-200"
      >
        <CopyIcon width={16} height={16} color="#6B7280" />
      </Pressable>
    </View>
  );
}

export default function AddMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ currency?: string }>();

  // Initialize with passed currency or fallback to NGN
  const initialCurrency =
    (params.currency?.toUpperCase() as SupportedCurrency) || "NGN";
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(
    initialCurrency === "USD" ? "USD" : "NGN",
  );

  const handleCopy = (label: string, text: string) => {
    Alert.alert("Copied!", `${label} copied to clipboard: ${text}`);
  };

  const handleCopyAll = () => {
    if (activeCurrency === "USD") {
      const allText = `Daniel Chinonso Chukwu\nLead Bank\nAccount: 9031420494\nRouting: 9031420494\nType: Personal Checking`;
      Alert.alert(
        "Copied!",
        `All USD bank details copied to clipboard:\n\n${allText}`,
      );
    } else {
      const allText = `Daniel Chinonso Chukwu\nPalmpay\nAccount: 9031420494`;
      Alert.alert(
        "Copied!",
        `All NGN bank details copied to clipboard:\n\n${allText}`,
      );
    }
  };

  const handleShare = async () => {
    try {
      if (activeCurrency === "USD") {
        await Share.share({
          message: `Chipa USD Account Details:\nName: Daniel Chinonso Chukwu\nBank: Lead Bank\nAccount Number: 9031420494\nRouting Number: 9031420494\nType: Personal Checking`,
        });
      } else {
        await Share.share({
          message: `Chipa NGN Account Details:\nName: Daniel Chinonso Chukwu\nBank: Palmpay\nAccount Number: 9031420494`,
        });
      }
    } catch {
      Alert.alert("Share", "Unable to share account details.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Title ──────────────────────────────────── */}
      <View className="relative flex-row items-center justify-center px-5 py-3.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="absolute left-5 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10"
        >
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-base font-bold text-gray-900">
          Add Money ({activeCurrency})
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 24,
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
            CAROUSEL HEADER (Flags Peek + Balance + 4 Dots)
           ══════════════════════════════════════════════════════════════════ */}
        <View className="items-center my-4">
          {/* Flags Row with side peek */}
          <View className="w-full flex-row items-center justify-between px-2 mb-2">
            {/* Left Peek Flag */}
            <Pressable
              onPress={() =>
                setActiveCurrency(activeCurrency === "USD" ? "NGN" : "USD")
              }
              className="opacity-35 active:opacity-60"
            >
              {activeCurrency === "USD" ? (
                <NigeriaRoundFlag size={32} />
              ) : (
                <EURoundFlag size={32} />
              )}
            </Pressable>

            {/* Center Main Active Flag */}
            <View className="items-center">
              {activeCurrency === "USD" ? (
                <USRoundFlag size={48} />
              ) : (
                <NigeriaRoundFlag size={48} />
              )}
            </View>

            {/* Right Peek Flag */}
            <Pressable
              onPress={() =>
                setActiveCurrency(activeCurrency === "USD" ? "NGN" : "USD")
              }
              className="opacity-35 active:opacity-60"
            >
              {activeCurrency === "USD" ? (
                <UKRoundFlag size={32} />
              ) : (
                <USRoundFlag size={32} />
              )}
            </Pressable>
          </View>

          {/* Hero Balance */}
          <Text className="font-satoshi text-[32px] font-extrabold text-gray-900 tracking-tight my-1">
            {activeCurrency === "USD" ? "$0.00" : "₦2,800.00"}
          </Text>

          {/* 4 Carousel Dots */}
          <View className="flex-row items-center gap-1.5 mt-2">
            <View
              className={`w-2 h-2 rounded-full ${
                activeCurrency === "USD" ? "bg-[#FDEBD2]" : "bg-[#F05D09]"
              }`}
            />
            <View
              className={`w-2 h-2 rounded-full ${
                activeCurrency === "USD" ? "bg-[#F05D09]" : "bg-[#FDEBD2]"
              }`}
            />
            <View className="w-2 h-2 rounded-full bg-[#FDEBD2]" />
            <View className="w-2 h-2 rounded-full bg-[#FDEBD2]" />
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            CURRENCY-SPECIFIC VIEW
           ══════════════════════════════════════════════════════════════════ */}
        {activeCurrency === "USD" ? (
          /* ── USD VIEW (Screenshot 1 Left) ──────────────────────────────── */
          <View>
            {/* Deposit Limits Card */}
            <View className="bg-[#F0F7FF] rounded-[24px] p-5 mb-5 border border-blue-100/60">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  Minimum deposit:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  $2.00
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-satoshi text-sm font-bold text-[#10B981]">
                  Maximum deposit:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  $10,000,000.00
                </Text>
              </View>
            </View>

            {/* USD Account Fields */}
            <View className="gap-3 mb-6">
              <AccountField
                label="Account name"
                value="Daniel Chinonso Chukwu"
                onCopy={() =>
                  handleCopy("Account name", "Daniel Chinonso Chukwu")
                }
              />
              <AccountField
                label="Bank"
                value="Lead Bank"
                onCopy={() => handleCopy("Bank", "Lead Bank")}
              />
              <AccountField
                label="Account number"
                value="9031420494"
                onCopy={() => handleCopy("Account number", "9031420494")}
              />
              <AccountField
                label="Routing number"
                value="9031420494"
                onCopy={() => handleCopy("Routing number", "9031420494")}
              />
              <AccountField
                label="Account type"
                value="Personal Checking"
                onCopy={() => handleCopy("Account type", "Personal Checking")}
              />
            </View>
          </View>
        ) : (
          /* ── NGN VIEW (Screenshot 1 Right) ─────────────────────────────── */
          <View>
            {/* Warning Notice Card */}
            <View className="bg-[#FFF9EB] rounded-[24px] p-4 mb-5 border border-amber-200/60 flex-row items-start">
              <View className="mr-3 pt-0.5">
                <WarningTriangleIcon />
              </View>
              <Text className="flex-1 font-sans text-xs text-gray-800 leading-4 font-medium">
                NGN deposits must come from a bank account in your name.
                Transfers from third-party accounts will be automatically
                returned. Return cost will be deducted.
              </Text>
            </View>

            {/* NGN Account Fields */}
            <View className="gap-3 mb-6">
              <AccountField
                label="Account name"
                value="Daniel Chinonso Chukwu"
                onCopy={() =>
                  handleCopy("Account name", "Daniel Chinonso Chukwu")
                }
              />
              <AccountField
                label="Bank"
                value="Palmpay"
                onCopy={() => handleCopy("Bank", "Palmpay")}
              />
              <AccountField
                label="Account number"
                value="9031420494"
                onCopy={() => handleCopy("Account number", "9031420494")}
              />
            </View>

            {/* How to fund this account */}
            <View className="mb-6">
              <Text className="font-satoshi text-base font-bold text-gray-900 mb-4">
                How to fund this account
              </Text>
              <View className="gap-3.5">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-3 shrink-0">
                    <Text className="font-satoshi text-xs font-bold text-orange-600">
                      1
                    </Text>
                  </View>
                  <Text className="font-sans text-sm text-gray-700 flex-1">
                    Copy the bank account number above
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-orange-100 items-center justify-center mr-3 shrink-0">
                    <Text className="font-satoshi text-xs font-bold text-orange-600">
                      2
                    </Text>
                  </View>
                  <Text className="font-sans text-sm text-gray-700 flex-1">
                    Open the bank app you want to transfer from
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Bottom Action Buttons (Sticky) ────────────────────────────────── */}
      <View
        className="px-5 pt-3 bg-white flex-row items-center gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <Pressable
          onPress={handleShare}
          className="flex-1 h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs"
        >
          <Text className="font-satoshi text-base font-bold text-white">
            Share
          </Text>
        </Pressable>

        <Pressable
          onPress={handleCopyAll}
          className="flex-1 h-14 bg-[#FDEBD2] rounded-full items-center justify-center active:opacity-85 shadow-xs"
        >
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Copy All
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
