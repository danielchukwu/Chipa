import { useRouter } from "expo-router";
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
import Svg, { Path } from "react-native-svg";

import { BankPickerModal } from "@/components/ui/bottom-sheets/bank-picker-modal";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import { TransferCheckoutDrawer } from "@/components/ui/bottom-sheets/transfer-checkout-drawer";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  AppButton,
  FormCard,
  QuickAmountsGrid,
  RecentsFavouritesTabs,
  RecipientRow,
  ScreenHeader,
  SeeAllButton,
} from "@/components/ui/screen-components";
import { AppInput } from "@/components/ui/input/app-input";
import { InputLabel } from "@/components/ui/input-label";
import { SelectInput } from "@/components/ui/select-input";
import {
  AccessBankLogo,
  MoniepointLogo,
  OPayLogo,
} from "@/components/ui/transaction-brand-logos";
import { getBankLogoUrl } from "@/constants/company-logos";

interface RecentRecipient {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bankType: "opay" | "access" | "moniepoint";
  imageUrl?: string;
}

const RECENT_RECIPIENTS: RecentRecipient[] = [
  {
    id: "rec_1",
    name: "ANGELA CHIOMA OKORO",
    accountNumber: "9031420494",
    bankName: "OPAY",
    bankType: "opay",
    imageUrl: getBankLogoUrl("opay"),
  },
  {
    id: "rec_2",
    name: "SYLVOSKILL CONSULTING LIMITED - Sylvoskill Consulting ltd",
    accountNumber: "9031420494",
    bankName: "Access Bank",
    bankType: "access",
    imageUrl: getBankLogoUrl("access"),
  },
  {
    id: "rec_3",
    name: "Usman Danphodio",
    accountNumber: "9031420494",
    bankName: "MONIE POINT",
    bankType: "moniepoint",
    imageUrl: getBankLogoUrl("moniepoint"),
  },
];

const FAVOURITE_RECIPIENTS: RecentRecipient[] = [
  {
    id: "fav_1",
    name: "ADEWALE AYOMIDE BABATUNDE",
    accountNumber: "0123456789",
    bankName: "GTBank",
    bankType: "access",
    imageUrl: getBankLogoUrl("gtbank"),
  },
  {
    id: "fav_2",
    name: "CHINEDU EMMANUEL OKAFOR",
    accountNumber: "2049182390",
    bankName: "Zenith Bank",
    bankType: "moniepoint",
    imageUrl: getBankLogoUrl("zenith"),
  },
  {
    id: "fav_3",
    name: "FATIMA BELLO ABUBAKAR",
    accountNumber: "9031420494",
    bankName: "OPAY",
    bankType: "opay",
    imageUrl: getBankLogoUrl("opay"),
  },
];

const RECOMMENDED_AMOUNTS = [
  "500",
  "1,000",
  "2,000",
  "5,000",
  "9,999",
  "10,000",
];

function ChevronDownIcon({ color = "#9CA3AF" }: { color?: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function TransferScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Step 1 vs Step 2 state
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("Select Bank");
  const [recipientName, setRecipientName] = useState("ANGELA CHIOMA OKORO");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Modals / Drawers state
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [isCheckoutDrawerVisible, setIsCheckoutDrawerVisible] = useState(false);
  const [isPinDrawerVisible, setIsPinDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tabs under Step 1
  const [activeTab, setActiveTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Handle clicking a recent or favourite account: auto-populates account number and bank
  const handleSelectRecent = (item: RecentRecipient) => {
    setAccountNumber(item.accountNumber);
    setSelectedBank(item.bankName);
    setRecipientName(item.name);
  };

  // Continue from Step 1 to Step 2
  const handleStep1Continue = () => {
    if (!accountNumber || accountNumber.length < 10) {
      Alert.alert(
        "Account Number",
        "Please enter a valid 10-digit account number.",
      );
      return;
    }
    if (selectedBank === "Select Bank") {
      Alert.alert("Select Bank", "Please choose the destination bank.");
      return;
    }
    setStep(2);
  };

  // Tapping a recommended amount sets it and immediately opens the Checkout Drawer
  const handleSelectRecommendedAmount = (recAmount: string) => {
    setAmount(recAmount);
    setIsCheckoutDrawerVisible(true);
  };

  // Continue from Step 2 to Checkout Drawer
  const handleStep2Continue = () => {
    const rawNum = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    if (!rawNum || rawNum < 100) {
      Alert.alert("Invalid Amount", "Please enter an amount of at least ₦100.");
      return;
    }
    setIsCheckoutDrawerVisible(true);
  };

  // Auto-submit from PIN drawer -> Loading Overlay for 3.5s -> Transaction Details
  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const displayAmount = amount || "500";
      const formattedAmount = displayAmount.startsWith("₦")
        ? displayAmount
        : `₦${displayAmount}`;

      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          variant: "outgoing_transfer",
          type: "outgoing_transfer",
          heroAmount: formattedAmount,
          title: recipientName,
          recipientName: recipientName,
          bankName: selectedBank === "Select Bank" ? "OPAY" : selectedBank,
          accountNumber: accountNumber || "9031420494",
          transferFee: "₦20.00",
          remark: note ? `"${note}"` : '"Use this one flex"',
          transactionId: "260912020100964271663837",
          sessionId: "260912020100964271663837",
          date: "Sept 12, 2025 · 9:56 PM",
          statusDate: "Sep 12, 9:56 PM",
        },
      });
    }, 3500);
  };

  const renderRecentLogo = (type: RecentRecipient["bankType"]) => {
    if (type === "access") return <AccessBankLogo size={36} />;
    if (type === "moniepoint") return <MoniepointLogo size={36} />;
    return <OPayLogo size={36} />;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Title ──────────────────────────────────── */}
      <ScreenHeader
        title="Transfer"
        onBack={() => {
          if (step === 2) {
            setStep(1);
          } else {
            router.back();
          }
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 24,
          }}
        >
          {/* ══════════════════════════════════════════════════════════════════
              STEP 1: ACCOUNT NUMBER & BANK SELECTION (Screenshot 1 Left)
             ══════════════════════════════════════════════════════════════════ */}
          {step === 1 ? (
            <View>
              {/* Form Input Card */}
              <FormCard>
                {/* Account Number */}
                <View>
                  <InputLabel>Account Number</InputLabel>
                  <AppInput
                    placeholder="Enter 10 digits Account Number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    maxLength={10}
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
                  />
                </View>

                {/* Bank */}
                <SelectInput
                  label="Bank"
                  placeholder="Select Bank"
                  value={selectedBank === "Select Bank" ? "" : selectedBank}
                  onPress={() => setIsBankModalVisible(true)}
                />

                {/* Continue Button */}
                <AppButton
                  title="Continue"
                  variant="primary"
                  onPress={handleStep1Continue}
                />
              </FormCard>

              {/* Recents & Favourites Filter Pills */}
              <RecentsFavouritesTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />

              {/* Recipients List (Recents or Favourites) */}
              <View className="gap-3 mb-6">
                {(activeTab === "Recents"
                  ? RECENT_RECIPIENTS
                  : FAVOURITE_RECIPIENTS
                ).map((rec) => (
                  <RecipientRow
                    key={rec.id}
                    title={rec.name}
                    subtitle={`${rec.accountNumber} | ${rec.bankName}`}
                    imageUrl={rec.imageUrl || getBankLogoUrl(rec.bankType)}
                    fallbackLogo={renderRecentLogo(rec.bankType)}
                    onPress={() => handleSelectRecent(rec)}
                  />
                ))}
              </View>

              {/* "See all" Bottom Pill */}
              <SeeAllButton
                label="See all"
                onPress={() =>
                  Alert.alert(
                    "Recents",
                    "Viewing all saved transfer recipients.",
                  )
                }
              />
            </View>
          ) : (
            /* ══════════════════════════════════════════════════════════════════
               STEP 2: AMOUNT & NOTE (Screenshot 1 Right)
               ══════════════════════════════════════════════════════════════════ */
            <View>
              {/* Selected Recipient Header Row */}
              <View className="mb-6">
                <RecipientRow
                  title={recipientName}
                  subtitle={`${accountNumber || "9031420494"} | ${selectedBank === "Select Bank" ? "OPAY" : selectedBank}`}
                  imageUrl={getBankLogoUrl(
                    selectedBank === "Select Bank" ? "opay" : selectedBank,
                  )}
                  fallbackLogo={<OPayLogo size={42} />}
                />
              </View>

              {/* Amount Card */}
              <FormCard className="mb-4">
                <View>
                  <InputLabel>Amount</InputLabel>
                  <View className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 flex-row items-center shadow-[0px_0px_4px_rgba(0,0,0,0.05)]">
                    <Text className="font-satoshi text-lg font-bold text-gray-900 mr-2">
                      ₦
                    </Text>
                    <TextInput
                      placeholder="100 - 5,000,000"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                      className="flex-1 font-satoshi text-base font-bold text-gray-900"
                    />
                  </View>
                </View>

                {/* 2x3 Grid of Recommended Amounts */}
                <QuickAmountsGrid
                  amounts={RECOMMENDED_AMOUNTS}
                  onSelectAmount={handleSelectRecommendedAmount}
                />
              </FormCard>

              {/* Note Card */}
              <FormCard className="mb-6">
                <View>
                  <InputLabel>Note</InputLabel>
                  <AppInput
                    placeholder="What's this for? (Optional)"
                    placeholderTextColor="#9CA3AF"
                    value={note}
                    onChangeText={setNote}
                    className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
                  />
                </View>
              </FormCard>

              {/* Step 2 Continue Button */}
              <AppButton
                title="Continue"
                variant="primary"
                onPress={handleStep2Continue}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Bank Picker Modal ─────────────────────────────────────────────── */}
      <BankPickerModal
        visible={isBankModalVisible}
        selectedBank={selectedBank}
        onSelect={(b) => setSelectedBank(b.name)}
        onClose={() => setIsBankModalVisible(false)}
      />

      {/* ── Drawer 1: Checkout Bottom Sheet (Screenshot 2 Left) ───────────── */}
      <TransferCheckoutDrawer
        visible={isCheckoutDrawerVisible}
        amount={amount || "500"}
        bankName={selectedBank === "Select Bank" ? "OPAY" : selectedBank}
        accountNumber={accountNumber || "9031420494"}
        recipientName={recipientName}
        onClose={() => setIsCheckoutDrawerVisible(false)}
        onPay={() => {
          setIsCheckoutDrawerVisible(false);
          setIsPinDrawerVisible(true);
        }}
      />

      {/* ── Drawer 2: Enter PIN Drawer with Chipa Secure Keypad (Screenshot 2 Right) ── */}
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
