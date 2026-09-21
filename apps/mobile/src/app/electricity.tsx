import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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

import { ElectricityCheckoutDrawer } from "@/components/ui/bottom-sheets/electricity-checkout-drawer";
import {
  ELECTRICITY_PROVIDERS,
  ElectricityProviderDrawer,
  ElectricityProviderOption,
} from "@/components/ui/bottom-sheets/electricity-provider-drawer";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import {
  PaymentMethodOption,
  SelectPaymentMethodDrawer,
} from "@/components/ui/bottom-sheets/select-payment-method-drawer";
import {
  ElectricityProviderId,
  ElectricityProviderLogo,
} from "@/components/ui/electricity-provider-logos";
import { ChevronDownIcon } from "@/components/ui/icons/app-icons";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  AppButton,
  FormCard,
  ProviderSelectTrigger,
  QuickAmountsGrid,
  RadioIndicator,
  RecentsFavouritesTabs,
  RecipientRow,
  ScreenHeader,
  SeeAllButton,
} from "@/components/ui/screen-components";
import { InputLabel } from "@/components/ui/input-label";
import { AmountPayInput } from "@/components/ui/input/amount-pay-input";
import { AppInput } from "@/components/ui/input/app-input";
import { getElectricityLogoUrl } from "@/constants/company-logos";

interface ElectricityRecipientItem {
  id: string;
  meterNumber: string;
  providerId: ElectricityProviderId;
  providerName: string;
  meterType: "Prepaid" | "Postpaid";
  imageUrl?: string;
}

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000, 10000];

const ELECTRICITY_RECENTS: ElectricityRecipientItem[] = [
  {
    id: "rec_1",
    meterNumber: "4481739942",
    providerId: "aedc",
    providerName: "AEDC",
    meterType: "Prepaid",
    imageUrl: getElectricityLogoUrl("aedc"),
  },
  {
    id: "rec_2",
    meterNumber: "01928471928",
    providerId: "ibedc",
    providerName: "IBEDC",
    meterType: "Prepaid",
    imageUrl: getElectricityLogoUrl("ibedc"),
  },
  {
    id: "rec_3",
    meterNumber: "92817401928",
    providerId: "ekedc",
    providerName: "EKEDC",
    meterType: "Postpaid",
    imageUrl: getElectricityLogoUrl("ekedc"),
  },
];

const ELECTRICITY_FAVOURITES: ElectricityRecipientItem[] = [
  {
    id: "fav_1",
    meterNumber: "4481739942",
    providerId: "aedc",
    providerName: "AEDC",
    meterType: "Prepaid",
    imageUrl: getElectricityLogoUrl("aedc"),
  },
  {
    id: "fav_2",
    meterNumber: "10293847561",
    providerId: "ikedc",
    providerName: "IKEDC",
    meterType: "Prepaid",
    imageUrl: getElectricityLogoUrl("ikedc"),
  },
];

interface MeterTypeButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

function MeterTypeButton({ label, isSelected, onPress }: MeterTypeButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-14 flex-1 flex-row items-center justify-center rounded-xl ${
        isSelected
          ? "bg-brand/20"
          : "bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
      }`}
    >
      {/* Radio Indicator */}
      <RadioIndicator selected={isSelected} className="mr-2" />
      <Text
        className={`text-lg font-medium ${
          isSelected ? "text-black/80" : "text-black/50"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function ElectricityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form states
  const [selectedProvider, setSelectedProvider] =
    useState<ElectricityProviderOption>(ELECTRICITY_PROVIDERS[0]);
  const [meterType, setMeterType] = useState<"Prepaid" | "Postpaid">("Prepaid");
  const [meterNumber, setMeterNumber] = useState("");
  const [customAmount, setCustomAmount] = useState("5000");
  const [activeListTab, setActiveListTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Modals & Drawers
  const [isProviderDrawerVisible, setIsProviderDrawerVisible] = useState(false);
  const [isCheckoutDrawerVisible, setIsCheckoutDrawerVisible] = useState(false);
  const [isSelectPaymentDrawerVisible, setIsSelectPaymentDrawerVisible] =
    useState(false);
  const [isPinDrawerVisible, setIsPinDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Selected payment method for checkout
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodOption>({
      code: "NGN",
      flag: "🇳🇬",
      balance: "₦2,800.00",
    });

  const currentAmountNum = parseFloat(customAmount) || 5000;

  // Validation: meter number must be at least 8 digits
  const isMeterProvided = meterNumber.trim().length >= 8;

  // Quick Amount Button clicked -> validate meter number -> open checkout
  const handleSelectQuickAmount = (amountVal: number) => {
    if (!isMeterProvided) {
      Alert.alert(
        "Meter Number Required",
        "Please enter a valid meter number or select a recent meter before choosing an amount.",
      );
      return;
    }
    setCustomAmount(amountVal.toString());
    setIsCheckoutDrawerVisible(true);
  };

  // Pay button clicked
  const handlePayPress = () => {
    if (!isMeterProvided) {
      Alert.alert(
        "Meter Number Required",
        "Please enter a valid meter number or select a recent meter before proceeding.",
      );
      return;
    }
    const num = parseFloat(customAmount);
    if (isNaN(num) || num < 100) {
      Alert.alert("Invalid Amount", "Minimum electricity payment is ₦100.");
      return;
    }
    setIsCheckoutDrawerVisible(true);
  };

  // Recent/Favourite item selected
  const handleSelectRecipient = (item: ElectricityRecipientItem) => {
    setMeterNumber(item.meterNumber);
    setMeterType(item.meterType);
    const matched = ELECTRICITY_PROVIDERS.find((p) => p.id === item.providerId);
    if (matched) {
      setSelectedProvider(matched);
    }
  };

  // PIN complete -> LoadingOverlay (3.5s) -> Transaction Details
  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          variant: "electricity",
          type: "electricity",
          heroAmount: `₦${currentAmountNum.toLocaleString("en-US")}.00`,
          amountPaid: `₦${currentAmountNum.toLocaleString("en-US")}.00`,
          transactionType: `Electricity: ${selectedProvider.name} (${meterType})`,
          transactionId: "260912020100964271663837",
          date: "Sept 16, 2026 · 9:52 PM",
          statusDate: "Sep 16, 9:52 PM",
        },
      });
    }, 3500);
  };

  const displayedRecipients =
    activeListTab === "Recents" ? ELECTRICITY_RECENTS : ELECTRICITY_FAVOURITES;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Centered Title ─────────────────────────── */}
      <ScreenHeader
        title="Electricity"
        onBack={() => router.back()}
        borderBottom
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* ── Provider Selector Row matching Screenshot 1 ─────────────────── */}
        <ProviderSelectTrigger
          name={selectedProvider.name}
          imageUrl={selectedProvider.imageUrl || getElectricityLogoUrl(selectedProvider.id)}
          fallbackLogo={<ElectricityProviderLogo provider={selectedProvider.id} size={34} />}
          onPress={() => setIsProviderDrawerVisible(true)}
        />

        {/* ── Main Form Card matching Screenshot 1 ─────────────────────────── */}
        <FormCard className="mt-3">
          {/* Prepaid vs Postpaid Toggle Pills */}
          <View className="flex-row items-center gap-3">
            <MeterTypeButton
              label="Prepaid"
              isSelected={meterType === "Prepaid"}
              onPress={() => setMeterType("Prepaid")}
            />
            <MeterTypeButton
              label="Postpaid"
              isSelected={meterType === "Postpaid"}
              onPress={() => setMeterType("Postpaid")}
            />
          </View>

          {/* Meter / Account Number Input */}
          <View className="">
            <InputLabel>Meter / Account Number</InputLabel>
            <AppInput
              value={meterNumber}
              onChangeText={setMeterNumber}
              placeholder="Enter meter number"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
            />
          </View>

          {/* 6 Quick Amounts in 3x2 Grid */}
          <QuickAmountsGrid
            amounts={QUICK_AMOUNTS}
            onSelectAmount={handleSelectQuickAmount}
            disabled={!isMeterProvided}
          />

          {/* Custom Amount Section */}
          <AmountPayInput
            label="Amount"
            value={customAmount}
            onChangeText={setCustomAmount}
            placeholder="100 - 5,000,000"
            currencySymbol="₦"
            className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
            onPay={handlePayPress}
            payDisabled={!isMeterProvided}
          />
        </FormCard>

        {/* ── Tabs: Recents | Favourites ──────────────────────────────────── */}
        <RecentsFavouritesTabs
          activeTab={activeListTab}
          onTabChange={setActiveListTab}
        />

        {/* ── Recipient List matching Screenshot 1 ─────────────────────────── */}
        <View className="gap-3 mb-4">
          {displayedRecipients.map((item) => (
            <RecipientRow
              key={item.id}
              title={item.meterNumber}
              subtitle={`${item.meterNumber} | ${item.providerName}`}
              imageUrl={item.imageUrl || getElectricityLogoUrl(item.providerId)}
              fallbackLogo={
                <ElectricityProviderLogo provider={item.providerId} size={42} />
              }
              onPress={() => handleSelectRecipient(item)}
            />
          ))}
        </View>

        {/* ── "See all" Bottom Pill Button ────────────────────────────────── */}
        <SeeAllButton
          label="See all"
          onPress={() =>
            Alert.alert("Recents", "Viewing all electricity bill recents.")
          }
        />
      </ScrollView>

      {/* ── Drawer 1: Select Electricity Provider ─────────────────────────── */}
      <ElectricityProviderDrawer
        visible={isProviderDrawerVisible}
        selectedId={selectedProvider.id}
        onSelect={setSelectedProvider}
        onClose={() => setIsProviderDrawerVisible(false)}
      />

      {/* ── Drawer 2: Electricity Checkout Drawer ─────────────────────────── */}
      <ElectricityCheckoutDrawer
        visible={isCheckoutDrawerVisible}
        onClose={() => setIsCheckoutDrawerVisible(false)}
        onOpenSelectPaymentMethod={() => {
          setIsCheckoutDrawerVisible(false);
          setIsSelectPaymentDrawerVisible(true);
        }}
        onPay={() => {
          setIsCheckoutDrawerVisible(false);
          setIsPinDrawerVisible(true);
        }}
        amount={currentAmountNum}
        providerId={selectedProvider.id}
        providerName={selectedProvider.name}
        meterType={meterType}
        meterNumber={meterNumber}
        selectedCurrency={selectedPaymentMethod.code}
        selectedBalance={selectedPaymentMethod.balance}
      />

      {/* ── Drawer 3: Select Payment Method ───────────────────────────────── */}
      <SelectPaymentMethodDrawer
        visible={isSelectPaymentDrawerVisible}
        onClose={() => {
          setIsSelectPaymentDrawerVisible(false);
          setIsCheckoutDrawerVisible(true);
        }}
        onSelect={(option) => {
          setSelectedPaymentMethod(option);
          setIsSelectPaymentDrawerVisible(false);
          setIsCheckoutDrawerVisible(true);
        }}
      />

      {/* ── Drawer 4: Enter PIN with Chipa Secure Keypad ──────────────────── */}
      <EnterPinDrawer
        visible={isPinDrawerVisible}
        onClose={() => setIsPinDrawerVisible(false)}
        onPinComplete={handlePinComplete}
      />

      {/* ── Pulsating Chipa Loading Overlay ────────────────────────────────── */}
      <LoadingOverlay visible={isLoading} />
    </SafeAreaView>
  );
}
