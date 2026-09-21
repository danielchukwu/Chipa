import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { ConvertCheckoutDrawer } from "@/components/ui/bottom-sheets/convert-checkout-drawer";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ScreenHeader } from "@/components/ui/screen-components";
import {
  CHPIcon,
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";
import { useRecentConversions } from "@/context/recent-conversions-context";

const CURRENCY_RATES: Record<string, number> = {
  NGN: 1,
  USD: 1369,
  GBP: 1820,
  EUR: 1510,
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

const CURRENCY_BALANCES: Record<string, string> = {
  NGN: "₦202,800.00",
  USD: "$2,800.98",
  GBP: "£1,450.00",
  EUR: "€1,200.00",
};

function renderCurrencyFlag(currency: string, size = 28) {
  switch (currency) {
    case "NGN":
      return <NGNIcon size={size} />;
    case "USD":
      return <USDIcon size={size} />;
    case "GBP":
      return <GBPIcon size={size} />;
    case "EUR":
      return <EURIcon size={size} />;
    case "CHP":
      return <CHPIcon size={size} />;
    default:
      return <NGNIcon size={size} />;
  }
}

function calculateConverted(amount: number, from: string, to: string) {
  const fromRate = CURRENCY_RATES[from] || 1;
  const toRate = CURRENCY_RATES[to] || 1;
  const inNGN = amount * fromRate;
  return inNGN / toRate;
}

function getExchangeRateString(from: string, to: string) {
  const fromRate = CURRENCY_RATES[from] || 1;
  const toRate = CURRENCY_RATES[to] || 1;
  const rate = fromRate / toRate;
  const fromSym = CURRENCY_SYMBOLS[from] || from;
  const toSym = CURRENCY_SYMBOLS[to] || to;
  const formatted =
    rate < 1
      ? rate.toFixed(4)
      : rate.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  return `${fromSym}1 = ${toSym}${formatted}`;
}

function ChevronDownIcon({ color = "#111827" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SyncRateIcon({ color = "#9CA3AF" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4v5h5M20 20v-5h-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20.49 9A9 9 0 005.64 5.64L4 9m16 6l-1.64 3.36A9 9 0 013.51 15"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FeeRingIcon({ color = "#9CA3AF" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={7.5} stroke={color} strokeWidth={2} />
      <Path
        d="M12 8.5v7M8.5 12h7"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function WalletMiniIcon({ color = "#9CA3AF" }: { color?: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Path
        d="M16 3H4a2 2 0 00-2 2v2h18V5a2 2 0 00-2-2z"
        stroke={color}
        strokeWidth={1.8}
      />
      <Circle cx={16.5} cy={13.5} r={1.2} fill={color} />
    </Svg>
  );
}

export default function ConvertScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ from?: string; to?: string }>();
  const { addRecentConversion } = useRecentConversions();

  // Currencies state (defaults to USD -> NGN or passed params)
  const initialFrom = params.from?.toUpperCase() || "USD";
  const initialTo =
    params.to?.toUpperCase() || (initialFrom === "USD" ? "NGN" : "USD");
  const [fromCurrency, setFromCurrency] = useState<string>(initialFrom);
  const [toCurrency, setToCurrency] = useState<string>(initialTo);

  // Input amounts
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  // Modals & Drawers state
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [isPinDrawerVisible, setIsPinDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if params change dynamically
  const [prevFromParam, setPrevFromParam] = useState(params.from);
  const [prevToParam, setPrevToParam] = useState(params.to);

  if (params.from !== prevFromParam) {
    setPrevFromParam(params.from);
    setFromCurrency(params.from?.toUpperCase() || "USD");
  }
  if (params.to !== prevToParam) {
    setPrevToParam(params.to);
    setToCurrency(params.to?.toUpperCase() || "NGN");
  }

  // Auto calculate 'To' when 'From' changes
  const handleFromChange = (text: string) => {
    setFromAmount(text);
    const num = parseFloat(text.replace(/[^0-9.]/g, ""));
    if (isNaN(num) || num <= 0) {
      setToAmount("");
      return;
    }

    const converted = calculateConverted(num, fromCurrency, toCurrency);
    setToAmount(
      converted.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    const prevFrom = fromCurrency;
    const prevTo = toCurrency;
    setFromCurrency(prevTo);
    setToCurrency(prevFrom);

    // Recalculate based on current fromAmount
    const num = parseFloat(fromAmount.replace(/[^0-9.]/g, ""));
    if (!isNaN(num) && num > 0) {
      const converted = calculateConverted(num, prevTo, prevFrom);
      setToAmount(
        converted.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );
    }
  };

  const handleOpenCheckout = () => {
    const num = parseFloat(fromAmount.replace(/[^0-9.]/g, ""));
    if (!num || num <= 0) {
      Alert.alert("Enter Amount", "Please enter an amount to convert.");
      return;
    }
    setIsCheckoutVisible(true);
  };

  const handleConfirmCheckout = () => {
    setIsCheckoutVisible(false);
    setIsPinDrawerVisible(true);
  };

  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      addRecentConversion(fromCurrency, toCurrency);

      const toSym = CURRENCY_SYMBOLS[toCurrency] || toCurrency;
      const fromSym = CURRENCY_SYMBOLS[fromCurrency] || fromCurrency;
      const displayTo = toAmount || "13,690.00";
      const displayFrom = fromAmount || "10.00";

      const heroAmount = `${toSym}${displayTo}`;
      const fromDisplay = `${fromSym}${displayFrom}`;
      const toDisplay = `${toSym}${displayTo}`;

      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          variant: "conversion",
          type: "conversion",
          heroAmount: heroAmount,
          fromAmount: fromDisplay,
          toAmount: toDisplay,
          exchangeRate: getExchangeRateString(fromCurrency, toCurrency),
          transactionId: "260912020100964271663837",
          date: "Sept 12, 2025 · 9:56 PM",
          statusDate: "Sep 12, 9:56 PM",
        },
      });
    }, 3500);
  };

  const availableBalance = CURRENCY_BALANCES[fromCurrency] || "₦202,800.00";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Title ──────────────────────────────────── */}
      <ScreenHeader
        title="Convert"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-between"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* ══════════════════════════════════════════════════════════════════
              CONVERSION CARD (Matching Screenshot)
             ══════════════════════════════════════════════════════════════════ */}
          <View className="bg-[#F9FAFB] rounded-[28px] p-5 border border-gray-100/70">
            {/* 1. FROM SECTION */}
            <Text className="font-satoshi text-base font-bold text-gray-900 mb-3">
              From
            </Text>
            <View className="flex-row items-center justify-between">
              {/* Currency Selector Pill */}
              <Pressable
                onPress={handleSwapCurrencies}
                hitSlop={6}
                className="flex-row items-center py-2 px-1 active:opacity-75"
              >
                {renderCurrencyFlag(fromCurrency, 28)}
                <Text className="font-satoshi text-base font-bold text-gray-900 mx-2">
                  {fromCurrency}
                </Text>
                <ChevronDownIcon />
              </Pressable>

              {/* Amount Input */}
              <View className="flex-1 ml-4 bg-white rounded-2xl px-4 py-3.5 border border-gray-100">
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="decimal-pad"
                  value={fromAmount}
                  onChangeText={handleFromChange}
                  className="font-satoshi text-base font-bold text-gray-900"
                />
              </View>
            </View>

            {/* 2. MIDDLE INFO SECTION (Rate, Fee, Available Balance) */}
            <View className="my-5 gap-3.5">
              {/* Rate */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <SyncRateIcon />
                  <Text className="font-sans text-sm text-gray-500 font-medium">
                    Rate
                  </Text>
                </View>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  {getExchangeRateString(fromCurrency, toCurrency)}
                </Text>
              </View>

              {/* Fee */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <FeeRingIcon />
                  <Text className="font-sans text-sm text-gray-500 font-medium">
                    Fee
                  </Text>
                </View>
                <Text className="font-sans text-sm font-semibold text-gray-400">
                  $0.00
                </Text>
              </View>

              {/* Available Balance */}
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <WalletMiniIcon />
                  <Text className="font-sans text-sm text-gray-500 font-medium">
                    Available Balance
                  </Text>
                </View>
                <Text className="font-satoshi text-sm font-bold text-gray-900">
                  {availableBalance}
                </Text>
              </View>
            </View>

            {/* 3. TO SECTION */}
            <Text className="font-satoshi text-base font-bold text-gray-900 mb-3">
              To
            </Text>
            <View className="flex-row items-center justify-between">
              {/* Currency Selector Pill */}
              <Pressable
                onPress={handleSwapCurrencies}
                hitSlop={6}
                className="flex-row items-center py-2 px-1 active:opacity-75"
              >
                {renderCurrencyFlag(toCurrency, 28)}
                <Text className="font-satoshi text-base font-bold text-gray-900 mx-2">
                  {toCurrency}
                </Text>
                <ChevronDownIcon />
              </Pressable>

              {/* Converted Amount Box */}
              <View className="flex-1 ml-4 bg-white rounded-2xl px-4 py-3.5 border border-gray-100">
                <Text
                  className={`font-satoshi text-base font-bold ${
                    toAmount ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {toAmount || "0.00"}
                </Text>
              </View>
            </View>
          </View>

          {/* Subtext: Ultra fast conversion */}
          <Text className="text-center font-sans text-xs italic text-gray-700 font-medium mt-4">
            ⚡ Ultra fast conversion
          </Text>
        </ScrollView>

        {/* Bottom Convert Action Button */}
        <View
          className="px-5 pb-6"
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Pressable
            onPress={handleOpenCheckout}
            className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs"
          >
            <Text className="font-satoshi text-base font-bold text-[#FDE5C5]">
              Convert
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* ── Drawer 1: Convert Checkout Confirmation Drawer ────────────────── */}
      <ConvertCheckoutDrawer
        visible={isCheckoutVisible}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        fromAmount={fromAmount || "10.00"}
        toAmount={toAmount || "13,690.00"}
        rate={getExchangeRateString(fromCurrency, toCurrency)}
        availableBalance={availableBalance}
        onClose={() => setIsCheckoutVisible(false)}
        onConfirm={handleConfirmCheckout}
      />

      {/* ── Drawer 2: Enter PIN Drawer with Chipa Secure Keypad ───────────── */}
      <EnterPinDrawer
        visible={isPinDrawerVisible}
        onClose={() => setIsPinDrawerVisible(false)}
        onPinComplete={handlePinComplete}
      />

      {/* ── Pulsating Chipa Loading Overlay (for 3.5s) ──────────────────────── */}
      <LoadingOverlay visible={isLoading} />
    </SafeAreaView>
  );
}
