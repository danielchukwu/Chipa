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

import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import { TransferChipaCheckoutDrawer } from "@/components/ui/bottom-sheets/transfer-chipa-checkout-drawer";
import { CHPIcon } from "@/components/ui/icons/currencies";
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

interface RecentChipaRecipient {
  id: string;
  name: string;
  tag: string;
}

const RECENT_CHIPA_RECIPIENTS: RecentChipaRecipient[] = [
  {
    id: "chipa_1",
    name: "ANGELA CHIOMA OKORO",
    tag: "@chioma",
  },
  {
    id: "chipa_2",
    name: "SYLVOSKILL CONSULTING",
    tag: "@sylvoskill",
  },
  {
    id: "chipa_3",
    name: "Usman Danphodio",
    tag: "@usman_d",
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

export default function TransferChipaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Step 1 vs Step 2 state
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [chipaTag, setChipaTag] = useState("");
  const [recipientName, setRecipientName] = useState("ANGELA CHIOMA OKORO");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // Modals / Drawers state
  const [isCheckoutDrawerVisible, setIsCheckoutDrawerVisible] = useState(false);
  const [isPinDrawerVisible, setIsPinDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Tabs under Step 1
  const [activeTab, setActiveTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Handle clicking a recent Chipa recipient
  const handleSelectRecent = (item: RecentChipaRecipient) => {
    setChipaTag(item.tag);
    setRecipientName(item.name);
    setStep(2);
  };

  // Continue from Step 1 to Step 2
  const handleStep1Continue = () => {
    const cleanTag = chipaTag.trim();
    if (!cleanTag || cleanTag.length < 2) {
      Alert.alert(
        "Chipa Tag",
        "Please enter a valid Chipa tag (e.g. @chioma).",
      );
      return;
    }
    const formattedTag = cleanTag.startsWith("@") ? cleanTag : `@${cleanTag}`;
    setChipaTag(formattedTag);
    setRecipientName("ANGELA CHIOMA OKORO");
    setStep(2);
  };

  // Tapping recommended amount sets amount and immediately opens checkout
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

  // Auto-submit from PIN drawer -> Loading overlay for 3.5s -> Transaction details
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
          bankName: "Chipa Account",
          accountNumber: chipaTag || "@chioma",
          transferFee: "₦0.00",
          remark: note ? `"${note}"` : '"Chipa Instant Transfer"',
          transactionId: "260912020100964271663837",
          sessionId: "260912020100964271663837",
          date: "Sept 12, 2025 · 9:56 PM",
          statusDate: "Sep 12, 9:56 PM",
        },
      });
    }, 3500);
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
              STEP 1: CHIPA TAG ENTRY
             ══════════════════════════════════════════════════════════════════ */}
          {step === 1 ? (
            <View>
              {/* Form Input Card */}
              <FormCard>
                <View>
                  <InputLabel>Chipa Tag</InputLabel>
                  <View className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 flex-row items-center shadow-[0px_0px_4px_rgba(0,0,0,0.05)]">
                    <Text className="font-satoshi text-base font-bold text-gray-400 mr-1.5">
                      @
                    </Text>
                    <TextInput
                      placeholder="Enter Chipa Tag (e.g. chioma)"
                      placeholderTextColor="#9CA3AF"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={chipaTag.replace(/^@/, "")}
                      onChangeText={(val) => setChipaTag(`@${val.trim()}`)}
                      className="flex-1 font-satoshi text-base font-bold text-gray-900"
                    />
                  </View>
                </View>

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

              {/* Recent Chipa Recipients List */}
              <View className="gap-3 mb-6">
                {RECENT_CHIPA_RECIPIENTS.map((rec) => (
                  <RecipientRow
                    key={rec.id}
                    title={rec.name}
                    subtitle={`${rec.tag} | Chipa Account`}
                    fallbackLogo={<CHPIcon size={40} />}
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
                    "Viewing all recent Chipa tag transfers.",
                  )
                }
              />
            </View>
          ) : (
            /* ══════════════════════════════════════════════════════════════════
               STEP 2: AMOUNT & NOTE
               ══════════════════════════════════════════════════════════════════ */
            <View>
              {/* Selected Chipa Recipient Header Row */}
              <View className="mb-6">
                <RecipientRow
                  title={recipientName}
                  subtitle={`${chipaTag || "@chioma"} | Chipa Account`}
                  fallbackLogo={<CHPIcon size={44} />}
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

      {/* ── Standard Draggable Checkout Drawer ────────────────────────────── */}
      <TransferChipaCheckoutDrawer
        visible={isCheckoutDrawerVisible}
        onClose={() => setIsCheckoutDrawerVisible(false)}
        onPay={() => {
          setIsCheckoutDrawerVisible(false);
          setIsPinDrawerVisible(true);
        }}
        amount={amount || "500"}
        chipaTag={chipaTag || "@chioma"}
        recipientName={recipientName}
      />

      {/* ── Enter PIN Drawer with Chipa Secure Keypad ───────────────────────── */}
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
