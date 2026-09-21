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

import { DataCheckoutDrawer } from "@/components/ui/bottom-sheets/data-checkout-drawer";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import { ChevronDownIcon } from "@/components/ui/icons/app-icons";
import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  PaymentMethodOption,
  SelectPaymentMethodDrawer,
} from "@/components/ui/select-payment-method-drawer";
import {
  RecentsFavouritesTabs,
  RecipientRow,
  ScreenHeader,
  SeeAllButton,
  TelcoPhoneInputBar,
} from "@/components/ui/screen-components";
import { TelcoLogo, TelcoProvider } from "@/components/ui/telco-logo";
import { TelcoPickerModal } from "@/components/ui/telco-picker-modal";
import { getTelcoLogoUrl } from "@/constants/company-logos";

interface PlanItem {
  id: string;
  name: string;
  dataAmount: string;
  dataUnit: string;
  validity: string;
  price: number;
}

interface RecipientItem {
  id: string;
  phone: string;
  network: TelcoProvider;
  networkLabel: string;
  imageUrl?: string;
}

const CATEGORY_TABS = [
  "Hottest",
  "Daily",
  "Weekly",
  "Monthly",
  "Broadband",
] as const;
type CategoryTab = (typeof CATEGORY_TABS)[number];

const PLANS_BY_CATEGORY: Record<CategoryTab, PlanItem[]> = {
  Hottest: [
    {
      id: "h1",
      name: "1GB 1 Day Plan",
      dataAmount: "1",
      dataUnit: "GB",
      validity: "1 day",
      price: 500,
    },
    {
      id: "h2",
      name: "2.5GB 1 Day Plan",
      dataAmount: "2.5",
      dataUnit: "GB",
      validity: "1 day",
      price: 750,
    },
    {
      id: "h3",
      name: "2.5GB 2 Days Plan",
      dataAmount: "2.5",
      dataUnit: "GB",
      validity: "2 days",
      price: 900,
    },
    {
      id: "h4",
      name: "500MB 7 Days Plan",
      dataAmount: "500",
      dataUnit: "MB",
      validity: "7 days",
      price: 500,
    },
    {
      id: "h5",
      name: "1GB 7 Days Plan",
      dataAmount: "1",
      dataUnit: "GB",
      validity: "7 days",
      price: 800,
    },
    {
      id: "h6",
      name: "3.5GB 7 Days Plan",
      dataAmount: "3.5",
      dataUnit: "GB",
      validity: "7 days",
      price: 1500,
    },
    {
      id: "h7",
      name: "7GB 30 Days Plan",
      dataAmount: "7",
      dataUnit: "GB",
      validity: "30 days",
      price: 3500,
    },
    {
      id: "h8",
      name: "450GB 90 Days Plan",
      dataAmount: "450",
      dataUnit: "GB",
      validity: "90 days",
      price: 75000,
    },
    {
      id: "h9",
      name: "1.5TB 365 Days Plan",
      dataAmount: "1.5",
      dataUnit: "TB",
      validity: "365 days",
      price: 500,
    },
  ],
  Daily: [
    {
      id: "d1",
      name: "100MB 1 Day Plan",
      dataAmount: "100",
      dataUnit: "MB",
      validity: "1 day",
      price: 100,
    },
    {
      id: "d2",
      name: "350MB 1 Day Plan",
      dataAmount: "350",
      dataUnit: "MB",
      validity: "1 day",
      price: 300,
    },
    {
      id: "d3",
      name: "1GB 1 Day Plan",
      dataAmount: "1",
      dataUnit: "GB",
      validity: "1 day",
      price: 500,
    },
    {
      id: "d4",
      name: "2GB 1 Day Plan",
      dataAmount: "2",
      dataUnit: "GB",
      validity: "1 day",
      price: 650,
    },
    {
      id: "d5",
      name: "2.5GB 1 Day Plan",
      dataAmount: "2.5",
      dataUnit: "GB",
      validity: "1 day",
      price: 750,
    },
    {
      id: "d6",
      name: "3GB 1 Day Plan",
      dataAmount: "3",
      dataUnit: "GB",
      validity: "1 day",
      price: 800,
    },
  ],
  Weekly: [
    {
      id: "w1",
      name: "500MB 7 Days Plan",
      dataAmount: "500",
      dataUnit: "MB",
      validity: "7 days",
      price: 500,
    },
    {
      id: "w2",
      name: "1GB 7 Days Plan",
      dataAmount: "1",
      dataUnit: "GB",
      validity: "7 days",
      price: 800,
    },
    {
      id: "w3",
      name: "2GB 7 Days Plan",
      dataAmount: "2",
      dataUnit: "GB",
      validity: "7 days",
      price: 1200,
    },
    {
      id: "w4",
      name: "3.5GB 7 Days Plan",
      dataAmount: "3.5",
      dataUnit: "GB",
      validity: "7 days",
      price: 1500,
    },
    {
      id: "w5",
      name: "5GB 7 Days Plan",
      dataAmount: "5",
      dataUnit: "GB",
      validity: "7 days",
      price: 2000,
    },
    {
      id: "w6",
      name: "6GB 7 Days Plan",
      dataAmount: "6",
      dataUnit: "GB",
      validity: "7 days",
      price: 2500,
    },
  ],
  Monthly: [
    {
      id: "m1",
      name: "3GB 30 Days Plan",
      dataAmount: "3",
      dataUnit: "GB",
      validity: "30 days",
      price: 1800,
    },
    {
      id: "m2",
      name: "5GB 30 Days Plan",
      dataAmount: "5",
      dataUnit: "GB",
      validity: "30 days",
      price: 2500,
    },
    {
      id: "m3",
      name: "7GB 30 Days Plan",
      dataAmount: "7",
      dataUnit: "GB",
      validity: "30 days",
      price: 3500,
    },
    {
      id: "m4",
      name: "12GB 30 Days Plan",
      dataAmount: "12",
      dataUnit: "GB",
      validity: "30 days",
      price: 5000,
    },
    {
      id: "m5",
      name: "25GB 30 Days Plan",
      dataAmount: "25",
      dataUnit: "GB",
      validity: "30 days",
      price: 9000,
    },
    {
      id: "m6",
      name: "40GB 30 Days Plan",
      dataAmount: "40",
      dataUnit: "GB",
      validity: "30 days",
      price: 15000,
    },
  ],
  Broadband: [
    {
      id: "b1",
      name: "50GB Broadband Plan",
      dataAmount: "50",
      dataUnit: "GB",
      validity: "30 days",
      price: 12000,
    },
    {
      id: "b2",
      name: "100GB Broadband Plan",
      dataAmount: "100",
      dataUnit: "GB",
      validity: "30 days",
      price: 20000,
    },
    {
      id: "b3",
      name: "160GB Broadband Plan",
      dataAmount: "160",
      dataUnit: "GB",
      validity: "60 days",
      price: 35000,
    },
    {
      id: "b4",
      name: "450GB Broadband Plan",
      dataAmount: "450",
      dataUnit: "GB",
      validity: "90 days",
      price: 75000,
    },
    {
      id: "b5",
      name: "1TB Broadband Plan",
      dataAmount: "1",
      dataUnit: "TB",
      validity: "120 days",
      price: 120000,
    },
    {
      id: "b6",
      name: "1.5TB Broadband Plan",
      dataAmount: "1.5",
      dataUnit: "TB",
      validity: "365 days",
      price: 180000,
    },
  ],
};

const RECENTS_DATA: RecipientItem[] = [
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

const FAVOURITES_DATA: RecipientItem[] = [
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

export default function DataScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State - start empty to enforce phone entry gating
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState<TelcoProvider>("mtn");
  const [selectedTab, setSelectedTab] = useState<CategoryTab>("Hottest");
  const [activeListTab, setActiveListTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Selected Plan for Checkout
  const [selectedPlan, setSelectedPlan] = useState<PlanItem>(
    PLANS_BY_CATEGORY.Hottest[4],
  );

  // Modals & Drawers
  const [isTelcoModalVisible, setIsTelcoModalVisible] = useState(false);
  const [isCheckoutDrawerVisible, setIsCheckoutDrawerVisible] = useState(false);
  const [isSelectPaymentDrawerVisible, setIsSelectPaymentDrawerVisible] =
    useState(false);
  const [isPinDrawerVisible, setIsPinDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Payment Method
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodOption>({
      code: "NGN",
      flag: "🇳🇬",
      balance: "₦2,800.00",
    });

  // Validation: plan is only selectable once phone number has at least 10 digits
  const isPhoneProvided = phoneNumber.trim().length >= 10;

  const handlePlanPress = (plan: PlanItem) => {
    if (!isPhoneProvided) {
      Alert.alert(
        "Phone Number Required",
        "Please enter a phone number or select a recipient from below before picking a plan.",
      );
      return;
    }
    setSelectedPlan(plan);
    setIsCheckoutDrawerVisible(true);
  };

  const handleSelectRecipient = (item: RecipientItem) => {
    setPhoneNumber(item.phone);
    setSelectedNetwork(item.network);
  };

  // Auto-submit from PIN drawer -> loading overlay for 3.5s -> Transaction Details
  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const networkUpper = selectedNetwork.toUpperCase();
      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          variant: "data",
          type: "data",
          heroAmount: `₦${selectedPlan.price.toLocaleString("en-US")}.00`,
          amountPaid: `₦${selectedPlan.price.toLocaleString("en-US")}.00`,
          transactionType: `Data (${networkUpper}) - ${selectedPlan.name}`,
          network: selectedNetwork,
          phoneNumber,
          transactionId: "260912020100964271663837",
          date: "Sept 16, 2026 · 9:42 PM",
          statusDate: "Sep 16, 9:42 PM",
        },
      });
    }, 3500);
  };

  const displayedRecipients =
    activeListTab === "Recents" ? RECENTS_DATA : FAVOURITES_DATA;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <ScreenHeader title="Data" onBack={() => router.back()} borderBottom />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 0,
        }}
      >
        {/* ── Top Row: Telco Selector + Phone Input + Contact Icon ─────────── */}
        <TelcoPhoneInputBar
          network={selectedNetwork}
          onPressNetwork={() => setIsTelcoModalVisible(true)}
          phoneNumber={phoneNumber}
          onChangePhoneNumber={setPhoneNumber}
          onPressContacts={() =>
            Alert.alert("Contacts", "Select contact feature ready.")
          }
        />

        {/* ── Section Header: Pick a plan ──────────────────────────────────── */}
        <Text className="font-satoshi text-xl font-extrabold text-gray-900 mb-3">
          Pick a plan
        </Text>

        {/* ── Category Filter Tabs (Hottest, Daily, Weekly, Monthly, Broadband) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 -mx-5 px-5"
        >
          <View className="flex-row items-center gap-6">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  className="pb-2 items-center"
                >
                  <Text
                    className={`font-satoshi text-base ${
                      isActive
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-400"
                    }`}
                  >
                    {tab}
                  </Text>
                  {isActive && (
                    <View className="h-0.5 w-full bg-gray-900 rounded-full mt-1.5" />
                  )}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* ── 3-Column Plan Cards Grid matching Screenshot 1 ──────────────── */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {PLANS_BY_CATEGORY[selectedTab].map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => handlePlanPress(plan)}
              style={{ width: "31%" }}
              className={`bg-[#F9FAFB] rounded-2xl py-4 px-1.5 items-center justify-center border border-gray-100/80 shadow-2xs active:bg-gray-100 ${
                !isPhoneProvided ? "opacity-85" : ""
              }`}
            >
              {/* Bold Orange Data Quantity */}
              <View className="flex-row items-baseline mb-1">
                <Text className="font-satoshi text-lg font-extrabold text-[#EA580C]">
                  {plan.dataAmount}
                </Text>
                <Text className="font-satoshi text-xs font-bold text-[#EA580C] ml-0.5">
                  {plan.dataUnit}
                </Text>
              </View>

              {/* Validity */}
              <Text className="font-sans text-xs text-gray-400 mb-1.5 font-medium">
                {plan.validity}
              </Text>

              {/* Price */}
              <Text className="font-satoshi text-xs font-bold text-gray-900">
                ₦{plan.price.toLocaleString("en-US")}
              </Text>
            </Pressable>
          ))}
        </View>

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
              title={item.phone}
              subtitle={`${item.phone} | ${item.networkLabel}`}
              imageUrl={item.imageUrl || getTelcoLogoUrl(item.network)}
              fallbackLogo={<TelcoLogo provider={item.network} size={42} />}
              onPress={() => handleSelectRecipient(item)}
            />
          ))}
        </View>

        {/* ── "See all" Bottom Pill Button ────────────────────────────────── */}
        <SeeAllButton
          label="See all"
          onPress={() =>
            Alert.alert("Recents", "Viewing all data top-up recents.")
          }
        />
      </ScrollView>

      {/* ── Telco Picker Modal ────────────────────────────────────────────── */}
      <TelcoPickerModal
        visible={isTelcoModalVisible}
        selected={selectedNetwork}
        onSelect={setSelectedNetwork}
        onClose={() => setIsTelcoModalVisible(false)}
      />

      {/* ── Drawer 1: Data Checkout Drawer ─────────────────────────────────── */}
      <DataCheckoutDrawer
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
        amount={selectedPlan.price}
        phoneNumber={phoneNumber}
        network={selectedNetwork}
        bundleName={selectedPlan.name}
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
