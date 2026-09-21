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

import { AirtimeCheckoutDrawer } from "@/components/ui/bottom-sheets/airtime-checkout-drawer";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import {
  PaymentMethodOption,
  SelectPaymentMethodDrawer,
} from "@/components/ui/bottom-sheets/select-payment-method-drawer";
import { TelcoPickerModal } from "@/components/ui/bottom-sheets/telco-picker-modal";
import { ChevronDownIcon } from "@/components/ui/icons/app-icons";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  AmountPayInput,
  FormCard,
  QuickAmountsGrid,
  RecentsFavouritesTabs,
  RecipientRow,
  ScreenHeader,
  SeeAllButton,
  TelcoPhoneInputBar,
} from "@/components/ui/screen-components";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";
import { getTelcoLogoUrl } from "@/constants/company-logos";

interface RecentItem {
  id: string;
  phone: string;
  network: TelcoProvider;
  networkLabel: string;
  imageUrl?: string;
}

const RECOMMENDED_AMOUNTS = [200, 500, 1000, 2000, 5000, 10000];

const RECENTS_DATA: RecentItem[] = [
  {
    id: "1",
    phone: "9031420494",
    network: "glo",
    networkLabel: "GLO",
    imageUrl: getTelcoLogoUrl("glo"),
  },
  {
    id: "2",
    phone: "9031420494",
    network: "mtn",
    networkLabel: "MTN",
    imageUrl: getTelcoLogoUrl("mtn"),
  },
  {
    id: "3",
    phone: "9031420494",
    network: "airtel",
    networkLabel: "Airtel",
    imageUrl: getTelcoLogoUrl("airtel"),
  },
];

const FAVOURITES_DATA: RecentItem[] = [
  {
    id: "f1",
    phone: "9031420494",
    network: "mtn",
    networkLabel: "MTN",
    imageUrl: getTelcoLogoUrl("mtn"),
  },
  {
    id: "f2",
    phone: "8023456789",
    network: "airtel",
    networkLabel: "Airtel",
    imageUrl: getTelcoLogoUrl("airtel"),
  },
  {
    id: "f3",
    phone: "8156789012",
    network: "glo",
    networkLabel: "GLO",
    imageUrl: getTelcoLogoUrl("glo"),
  },
];

export default function AirtimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form states
  const [phoneNumber, setPhoneNumber] = useState("9031420494");
  const [selectedNetwork, setSelectedNetwork] = useState<TelcoProvider>("mtn");
  const [customAmount, setCustomAmount] = useState("5000");
  const [activeTab, setActiveTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Modals & Drawers
  const [isTelcoModalVisible, setIsTelcoModalVisible] = useState(false);
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

  // Trigger checkout from recommended amount button
  const handleSelectRecommended = (amountVal: number) => {
    setCustomAmount(amountVal.toString());
    setIsCheckoutDrawerVisible(true);
  };

  // Trigger checkout from "Pay" button
  const handlePayPress = () => {
    const num = parseFloat(customAmount);
    if (isNaN(num) || num < 50) {
      Alert.alert("Invalid Amount", "Minimum airtime purchase is ₦50.");
      return;
    }
    setIsCheckoutDrawerVisible(true);
  };

  // Recent item clicked
  const handleSelectRecent = (recent: RecentItem) => {
    setPhoneNumber(recent.phone);
    setSelectedNetwork(recent.network);
  };

  // Auto-submit from PIN drawer -> loading overlay for 3.5s -> Transaction Details page
  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          amount: currentAmountNum.toString(),
          phoneNumber,
          network: selectedNetwork,
          type: "Airtime",
          transactionId: "260912020100964271663837",
        },
      });
    }, 3500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Centered Title ─────────────────────────── */}
      <ScreenHeader title="Airtime" onBack={() => router.back()} borderBottom />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      >
        {/* ── Top Input Row: Telco Selector + Phone Input + Contact Icon ──── */}
        <TelcoPhoneInputBar
          network={selectedNetwork}
          onPressNetwork={() => setIsTelcoModalVisible(true)}
          phoneNumber={phoneNumber}
          onChangePhoneNumber={setPhoneNumber}
          onPressContacts={() =>
            Alert.alert("Contacts", "Select contact feature ready.")
          }
          className="mb-6"
        />

        {/* ── Soft Card: Recommended Amounts Grid + Custom Amount ─────────── */}
        <FormCard>
          {/* 6 Quick Amounts in 3x2 Grid */}
          <QuickAmountsGrid
            amounts={RECOMMENDED_AMOUNTS}
            onSelectAmount={handleSelectRecommended}
            disabled={!phoneNumber.trim()}
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
            payDisabled={!phoneNumber.trim()}
          />
        </FormCard>

        {/* ── Tabs: Recents | Favourites ──────────────────────────────────── */}
        <RecentsFavouritesTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* ── Recents / Favourites List matching Screenshot ──────────────── */}
        <View className="gap-3 mb-4">
          {(activeTab === "Recents" ? RECENTS_DATA : FAVOURITES_DATA).map(
            (item) => (
              <RecipientRow
                key={item.id}
                title={item.phone}
                subtitle={`${item.phone} | ${item.networkLabel}`}
                imageUrl={item.imageUrl || getTelcoLogoUrl(item.network)}
                fallbackLogo={<TelcoLogo provider={item.network} size={42} />}
                onPress={() => handleSelectRecent(item)}
              />
            ),
          )}
        </View>

        {/* ── "See all" Bottom Pill Button ────────────────────────────────── */}
        <SeeAllButton
          label="See all"
          onPress={() => Alert.alert("Recents", "Viewing all recent top-ups.")}
        />
      </ScrollView>

      {/* ── Telco Picker Modal ────────────────────────────────────────────── */}
      <TelcoPickerModal
        visible={isTelcoModalVisible}
        selected={selectedNetwork}
        onSelect={setSelectedNetwork}
        onClose={() => setIsTelcoModalVisible(false)}
      />

      {/* ── Drawer 1: Airtime Checkout Drawer ─────────────────────────────── */}
      <AirtimeCheckoutDrawer
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
        phoneNumber={phoneNumber}
        network={selectedNetwork}
        selectedCurrency={selectedPaymentMethod.code}
        selectedBalance={selectedPaymentMethod.balance}
      />

      {/* ── Drawer 2: Select Payment Method ───────────────────────────────── */}
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

      {/* ── Drawer 3: Enter PIN with Chipa Secure Keypad ──────────────────── */}
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
