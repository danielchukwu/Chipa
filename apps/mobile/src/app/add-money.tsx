import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Share, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { useWallets } from "@/api/hooks/use-wallets";
import { useAuth } from "@/context/auth-context";
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
    <Pressable
      onPress={onCopy}
      hitSlop={8}
      // className="w-8 h-8 rounded-full items-center justify-center active:bg-gray-200"
    >
      <View className="bg-[#F8F8FB] rounded-2xl px-4 py-3.5 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
          <Text className="font-sans text-xs text-gray-400 font-medium mb-1">
            {label}
          </Text>
          <Text
            numberOfLines={1}
            className="font-satoshi text-base font-bold text-gray-900"
          >
            {value || "—"}
          </Text>
        </View>
        <CopyIcon width={16} height={16} color="#6B7280" />
      </View>
    </Pressable>
  );
}

export default function AddMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data: wallets } = useWallets();
  const params = useLocalSearchParams<{ currency?: string }>();

  // Initialize with passed currency or fallback to NGN
  const initialCurrency =
    (params.currency?.toUpperCase() as SupportedCurrency) || "NGN";
  const [activeCurrency, setActiveCurrency] = useState<SupportedCurrency>(
    ["USD", "NGN", "GBP", "EUR"].includes(initialCurrency)
      ? initialCurrency
      : "NGN",
  );

  const ngnWallet = wallets?.find((w) => w.currency === "NGN");
  const usdWallet = wallets?.find((w) => w.currency === "USD");
  const gbpWallet = wallets?.find((w) => w.currency === "GBP");
  const eurWallet = wallets?.find((w) => w.currency === "EUR");

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "Chipa User";

  // NGN Details
  const ngnAccountName =
    ngnWallet?.accountName || ngnWallet?.account_name || userName;
  const ngnBankName =
    ngnWallet?.bankName || ngnWallet?.bank_name || "Wema Bank (Flutterwave)";
  const ngnAccountNumber =
    ngnWallet?.accountNumber ||
    ngnWallet?.account_number ||
    user?.accountNumber ||
    "Generating...";
  const ngnBalanceFormatted =
    ngnWallet?.balance !== undefined
      ? `₦${Number(ngnWallet.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "₦0.00";

  // USD Details
  const usdAccountName =
    usdWallet?.accountName || usdWallet?.account_name || userName;
  const usdBankName =
    usdWallet?.bankName || usdWallet?.bank_name || "Lead Bank (Bridge.xyz)";
  const usdAccountNumber =
    usdWallet?.accountNumber || usdWallet?.account_number || "Generating...";
  const usdRoutingNumber =
    usdWallet?.routingNumber || usdWallet?.routing_number || "101019283";
  const usdBalanceFormatted =
    usdWallet?.balance !== undefined
      ? `$${Number(usdWallet.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "$0.00";

  // GBP Details
  const gbpAccountName =
    gbpWallet?.accountName || gbpWallet?.account_name || userName;
  const gbpBankName =
    gbpWallet?.bankName || gbpWallet?.bank_name || "ClearBank UK (Bridge.xyz)";
  const gbpAccountNumber =
    gbpWallet?.accountNumber || gbpWallet?.account_number || "83920184";
  const gbpSortCode = gbpWallet?.sortCode || gbpWallet?.sort_code || "04-00-04";
  const gbpBalanceFormatted =
    gbpWallet?.balance !== undefined
      ? `£${Number(gbpWallet.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "£0.00";

  // EUR Details
  const eurAccountName =
    eurWallet?.accountName || eurWallet?.account_name || userName;
  const eurBankName =
    eurWallet?.bankName ||
    eurWallet?.bank_name ||
    "Banking Circle (Bridge.xyz)";
  const eurIBAN = eurWallet?.iban || "LU89370400440532013000";
  const eurBIC = eurWallet?.bic || "BCCL2L22XXX";
  const eurBalanceFormatted =
    eurWallet?.balance !== undefined
      ? `€${Number(eurWallet.balance).toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}`
      : "€0.00";

  const handleCopy = (label: string, text: string) => {
    Alert.alert("Copied!", `${label} copied to clipboard: ${text}`);
  };

  const handleCopyAll = () => {
    let allText = "";
    if (activeCurrency === "USD") {
      allText = `${usdAccountName}\n${usdBankName}\nAccount: ${usdAccountNumber}\nRouting: ${usdRoutingNumber}\nType: Personal Checking`;
    } else if (activeCurrency === "GBP") {
      allText = `${gbpAccountName}\n${gbpBankName}\nAccount: ${gbpAccountNumber}\nSort Code: ${gbpSortCode}`;
    } else if (activeCurrency === "EUR") {
      allText = `${eurAccountName}\n${eurBankName}\nIBAN: ${eurIBAN}\nBIC/SWIFT: ${eurBIC}`;
    } else {
      allText = `${ngnAccountName}\n${ngnBankName}\nAccount: ${ngnAccountNumber}`;
    }
    Alert.alert(
      "Copied!",
      `All ${activeCurrency} bank details copied to clipboard:\n\n${allText}`,
    );
  };

  const handleShare = async () => {
    try {
      let message = "";
      if (activeCurrency === "USD") {
        message = `Chipa USD Account Details:\nName: ${usdAccountName}\nBank: ${usdBankName}\nAccount Number: ${usdAccountNumber}\nRouting Number: ${usdRoutingNumber}\nType: Personal Checking`;
      } else if (activeCurrency === "GBP") {
        message = `Chipa GBP Account Details:\nName: ${gbpAccountName}\nBank: ${gbpBankName}\nAccount Number: ${gbpAccountNumber}\nSort Code: ${gbpSortCode}`;
      } else if (activeCurrency === "EUR") {
        message = `Chipa EUR Account Details:\nName: ${eurAccountName}\nBank: ${eurBankName}\nIBAN: ${eurIBAN}\nBIC/SWIFT: ${eurBIC}`;
      } else {
        message = `Chipa NGN Account Details:\nName: ${ngnAccountName}\nBank: ${ngnBankName}\nAccount Number: ${ngnAccountNumber}`;
      }
      await Share.share({ message });
    } catch {
      Alert.alert("Share", "Unable to share account details.");
    }
  };

  const getActiveBalanceFormatted = () => {
    switch (activeCurrency) {
      case "USD":
        return usdBalanceFormatted;
      case "GBP":
        return gbpBalanceFormatted;
      case "EUR":
        return eurBalanceFormatted;
      case "NGN":
      default:
        return ngnBalanceFormatted;
    }
  };

  const currenciesOrder: SupportedCurrency[] = ["NGN", "USD", "GBP", "EUR"];

  const handleNextCurrency = () => {
    const currentIndex = currenciesOrder.indexOf(activeCurrency);
    const nextIndex = (currentIndex + 1) % currenciesOrder.length;
    setActiveCurrency(currenciesOrder[nextIndex]);
  };

  const handlePrevCurrency = () => {
    const currentIndex = currenciesOrder.indexOf(activeCurrency);
    const prevIndex =
      (currentIndex - 1 + currenciesOrder.length) % currenciesOrder.length;
    setActiveCurrency(currenciesOrder[prevIndex]);
  };

  const getFlagComponent = (curr: SupportedCurrency, size: number) => {
    switch (curr) {
      case "USD":
        return <USRoundFlag size={size} />;
      case "GBP":
        return <UKRoundFlag size={size} />;
      case "EUR":
        return <EURoundFlag size={size} />;
      case "NGN":
      default:
        return <NigeriaRoundFlag size={size} />;
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
              onPress={handlePrevCurrency}
              className="opacity-35 active:opacity-60"
            >
              {getFlagComponent(
                currenciesOrder[
                  (currenciesOrder.indexOf(activeCurrency) -
                    1 +
                    currenciesOrder.length) %
                    currenciesOrder.length
                ],
                32,
              )}
            </Pressable>

            {/* Center Main Active Flag */}
            <View className="items-center">
              {getFlagComponent(activeCurrency, 48)}
            </View>

            {/* Right Peek Flag */}
            <Pressable
              onPress={handleNextCurrency}
              className="opacity-35 active:opacity-60"
            >
              {getFlagComponent(
                currenciesOrder[
                  (currenciesOrder.indexOf(activeCurrency) + 1) %
                    currenciesOrder.length
                ],
                32,
              )}
            </Pressable>
          </View>

          {/* Hero Balance */}
          <Text className="font-satoshi text-[32px] font-extrabold text-gray-900 tracking-tight my-1">
            {getActiveBalanceFormatted()}
          </Text>

          {/* 4 Carousel Dots */}
          <View className="flex-row items-center gap-1.5 mt-2">
            {currenciesOrder.map((curr) => (
              <View
                key={curr}
                className={`w-2 h-2 rounded-full ${
                  activeCurrency === curr ? "bg-[#F05D09]" : "bg-[#FDEBD2]"
                }`}
              />
            ))}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            CURRENCY-SPECIFIC VIEW
           ══════════════════════════════════════════════════════════════════ */}
        {activeCurrency === "USD" ? (
          /* ── USD VIEW ──────────────────────────────── */
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
                value={usdAccountName}
                onCopy={() => handleCopy("Account name", usdAccountName)}
              />
              <AccountField
                label="Bank"
                value={usdBankName}
                onCopy={() => handleCopy("Bank", usdBankName)}
              />
              <AccountField
                label="Account number"
                value={usdAccountNumber}
                onCopy={() => handleCopy("Account number", usdAccountNumber)}
              />
              <AccountField
                label="Routing number"
                value={usdRoutingNumber}
                onCopy={() => handleCopy("Routing number", usdRoutingNumber)}
              />
              <AccountField
                label="Account type"
                value="Personal Checking"
                onCopy={() => handleCopy("Account type", "Personal Checking")}
              />
            </View>
          </View>
        ) : activeCurrency === "GBP" ? (
          /* ── GBP VIEW ──────────────────────────────── */
          <View>
            <View className="bg-[#F0F7FF] rounded-[24px] p-5 mb-5 border border-blue-100/60">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  Supported rails:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  FPS, BACS
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-satoshi text-sm font-bold text-[#10B981]">
                  Settlement:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  Instant - 1 day
                </Text>
              </View>
            </View>

            <View className="gap-3 mb-6">
              <AccountField
                label="Account name"
                value={gbpAccountName}
                onCopy={() => handleCopy("Account name", gbpAccountName)}
              />
              <AccountField
                label="Bank"
                value={gbpBankName}
                onCopy={() => handleCopy("Bank", gbpBankName)}
              />
              <AccountField
                label="Account number"
                value={gbpAccountNumber}
                onCopy={() => handleCopy("Account number", gbpAccountNumber)}
              />
              <AccountField
                label="Sort code"
                value={gbpSortCode}
                onCopy={() => handleCopy("Sort code", gbpSortCode)}
              />
            </View>
          </View>
        ) : activeCurrency === "EUR" ? (
          /* ── EUR VIEW ──────────────────────────────── */
          <View>
            <View className="bg-[#F0F7FF] rounded-[24px] p-5 mb-5 border border-blue-100/60">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  Supported rails:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  SEPA Instant
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="font-satoshi text-sm font-bold text-[#10B981]">
                  Settlement:
                </Text>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  Instant
                </Text>
              </View>
            </View>

            <View className="gap-3 mb-6">
              <AccountField
                label="Account name"
                value={eurAccountName}
                onCopy={() => handleCopy("Account name", eurAccountName)}
              />
              <AccountField
                label="Bank"
                value={eurBankName}
                onCopy={() => handleCopy("Bank", eurBankName)}
              />
              <AccountField
                label="IBAN"
                value={eurIBAN}
                onCopy={() => handleCopy("IBAN", eurIBAN)}
              />
              <AccountField
                label="BIC / SWIFT"
                value={eurBIC}
                onCopy={() => handleCopy("BIC / SWIFT", eurBIC)}
              />
            </View>
          </View>
        ) : (
          /* ── NGN VIEW ─────────────────────────────── */
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
                value={ngnAccountName}
                onCopy={() => handleCopy("Account name", ngnAccountName)}
              />
              <AccountField
                label="Bank"
                value={ngnBankName}
                onCopy={() => handleCopy("Bank", ngnBankName)}
              />
              <AccountField
                label="Account number"
                value={ngnAccountNumber}
                onCopy={() => handleCopy("Account number", ngnAccountNumber)}
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
