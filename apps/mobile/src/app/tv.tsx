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

import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import {
  PaymentMethodOption,
  SelectPaymentMethodDrawer,
} from "@/components/ui/bottom-sheets/select-payment-method-drawer";
import { TvCheckoutDrawer } from "@/components/ui/bottom-sheets/tv-checkout-drawer";
import {
  TV_PROVIDERS,
  TvProviderDrawer,
  TvProviderOption,
} from "@/components/ui/bottom-sheets/tv-provider-drawer";
import { ChevronDownIcon } from "@/components/ui/icons/app-icons";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import {
  FormCard,
  ProviderSelectTrigger,
  RecentsFavouritesTabs,
  RecipientRow,
  ScreenHeader,
  SeeAllButton,
} from "@/components/ui/screen-components";
import { AppInput } from "@/components/ui/input/app-input";
import { InputLabel } from "@/components/ui/input-label";
import { TvProviderId, TvProviderLogo } from "@/components/ui/tv-brand-logos";
import { getTvLogoUrl } from "@/constants/company-logos";

interface TvPlanItem {
  id: string;
  name: string;
  price: number;
  duration: string;
}

interface TvRecipientItem {
  id: string;
  smartcardNumber: string;
  providerId: TvProviderId;
  providerName: string;
  imageUrl?: string;
}

const TV_PLANS: Record<
  TvProviderId,
  { "Hot offers": TvPlanItem[]; Premium: TvPlanItem[] }
> = {
  dstv: {
    "Hot offers": [
      { id: "dstv_1", name: "DStv Renewal", price: 4400, duration: "1 Month" },
      { id: "dstv_2", name: "DStv Padi", price: 4400, duration: "1 Month" },
      { id: "dstv_3", name: "DStv Yanga", price: 4400, duration: "1 Month" },
      { id: "dstv_4", name: "DStv Confam", price: 4400, duration: "1 Month" },
      { id: "dstv_5", name: "DStv Compact", price: 4400, duration: "1 Month" },
      {
        id: "dstv_6",
        name: "DStv Compact +",
        price: 4400,
        duration: "1 Month",
      },
      {
        id: "dstv_7",
        name: "DStv Stream Premium",
        price: 4400,
        duration: "1 Month",
      },
    ],
    Premium: [
      {
        id: "dstv_p1",
        name: "DStv Premium",
        price: 37000,
        duration: "1 Month",
      },
      {
        id: "dstv_p2",
        name: "DStv Compact Plus",
        price: 25000,
        duration: "1 Month",
      },
      {
        id: "dstv_p3",
        name: "DStv Stream Premium",
        price: 37000,
        duration: "1 Month",
      },
      {
        id: "dstv_p4",
        name: "DStv French Plus",
        price: 20500,
        duration: "1 Month",
      },
    ],
  },
  gotv: {
    "Hot offers": [
      { id: "gotv_1", name: "GOtv Smallie", price: 1575, duration: "1 Month" },
      { id: "gotv_2", name: "GOtv Jinja", price: 3300, duration: "1 Month" },
      { id: "gotv_3", name: "GOtv Jolli", price: 4850, duration: "1 Month" },
      { id: "gotv_4", name: "GOtv Max", price: 7200, duration: "1 Month" },
    ],
    Premium: [
      { id: "gotv_p1", name: "GOtv Supa", price: 9600, duration: "1 Month" },
      {
        id: "gotv_p2",
        name: "GOtv Supa Plus",
        price: 15700,
        duration: "1 Month",
      },
    ],
  },
  startimes: {
    "Hot offers": [
      { id: "st_1", name: "StarTimes Nova", price: 1700, duration: "1 Month" },
      { id: "st_2", name: "StarTimes Basic", price: 3300, duration: "1 Month" },
      { id: "st_3", name: "StarTimes Smart", price: 4200, duration: "1 Month" },
      {
        id: "st_4",
        name: "StarTimes Classic",
        price: 5000,
        duration: "1 Month",
      },
    ],
    Premium: [
      {
        id: "st_p1",
        name: "StarTimes Super",
        price: 8200,
        duration: "1 Month",
      },
      {
        id: "st_p2",
        name: "StarTimes Chinese",
        price: 13000,
        duration: "1 Month",
      },
    ],
  },
  startimes_on: {
    "Hot offers": [
      { id: "ston_1", name: "VIP Monthly", price: 1500, duration: "1 Month" },
      {
        id: "ston_2",
        name: "VIP Quarterly",
        price: 4000,
        duration: "3 Months",
      },
    ],
    Premium: [
      {
        id: "ston_p1",
        name: "VIP Annual Pass",
        price: 14000,
        duration: "1 Year",
      },
    ],
  },
  showmax: {
    "Hot offers": [
      {
        id: "shm_1",
        name: "Entertainment Mobile",
        price: 1200,
        duration: "1 Month",
      },
      {
        id: "shm_2",
        name: "Entertainment All Devices",
        price: 2500,
        duration: "1 Month",
      },
      {
        id: "shm_3",
        name: "Premier League Mobile",
        price: 2900,
        duration: "1 Month",
      },
    ],
    Premium: [
      {
        id: "shm_p1",
        name: "Showmax Pro Max",
        price: 5400,
        duration: "1 Month",
      },
    ],
  },
};

const TV_RECENTS: TvRecipientItem[] = [
  {
    id: "rec_1",
    smartcardNumber: "88290138456",
    providerId: "dstv",
    providerName: "DStv",
    imageUrl: getTvLogoUrl("dstv"),
  },
  {
    id: "rec_2",
    smartcardNumber: "20491823901",
    providerId: "gotv",
    providerName: "GOtv",
    imageUrl: getTvLogoUrl("gotv"),
  },
  {
    id: "rec_3",
    smartcardNumber: "02194827492",
    providerId: "startimes",
    providerName: "StarTimes",
    imageUrl: getTvLogoUrl("startimes"),
  },
];

const TV_FAVOURITES: TvRecipientItem[] = [
  {
    id: "fav_1",
    smartcardNumber: "88290138456",
    providerId: "dstv",
    providerName: "DStv",
    imageUrl: getTvLogoUrl("dstv"),
  },
  {
    id: "fav_2",
    smartcardNumber: "70392019482",
    providerId: "showmax",
    providerName: "Showmax",
    imageUrl: getTvLogoUrl("showmax"),
  },
];

export default function TvScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Form State
  const [selectedProvider, setSelectedProvider] = useState<TvProviderOption>(
    TV_PROVIDERS[0],
  );
  const [smartcardNumber, setSmartcardNumber] = useState("");
  const [activeTab, setActiveTab] = useState<"Hot offers" | "Premium">(
    "Hot offers",
  );
  const [activeListTab, setActiveListTab] = useState<"Recents" | "Favourites">(
    "Recents",
  );

  // Selected Plan for Checkout
  const currentProviderPlans = TV_PLANS[selectedProvider.id] || TV_PLANS.dstv;
  const currentTabPlans =
    currentProviderPlans[activeTab] || currentProviderPlans["Hot offers"];
  const [selectedPlan, setSelectedPlan] = useState<TvPlanItem>(
    currentTabPlans[0],
  );

  // Modals & Drawers
  const [isProviderDrawerVisible, setIsProviderDrawerVisible] = useState(false);
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

  // Validation gating: smartcard number must be at least 8 digits
  const isSmartcardProvided = smartcardNumber.trim().length >= 8;

  const handlePlanPress = (plan: TvPlanItem) => {
    if (!isSmartcardProvided) {
      Alert.alert(
        `${selectedProvider.smartcardLabel} Required`,
        `Please enter a valid ${selectedProvider.smartcardLabel.toLowerCase()} or pick a recipient from below before selecting a plan.`,
      );
      return;
    }
    setSelectedPlan(plan);
    setIsCheckoutDrawerVisible(true);
  };

  const handleSelectRecipient = (item: TvRecipientItem) => {
    setSmartcardNumber(item.smartcardNumber);
    const matched = TV_PROVIDERS.find((p) => p.id === item.providerId);
    if (matched) {
      setSelectedProvider(matched);
    }
  };

  // Auto-submit from PIN drawer -> loading overlay for 3.5s -> Transaction Details
  const handlePinComplete = (_pin: string) => {
    setIsPinDrawerVisible(false);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const planCost = selectedPlan ? selectedPlan.price : 4400;
      const planName = selectedPlan ? selectedPlan.name : "DStv Yanga";
      router.replace({
        pathname: "/transaction-details" as any,
        params: {
          variant: "tv",
          type: "tv",
          heroAmount: `₦${planCost.toLocaleString("en-US")}.00`,
          amountPaid: `₦${planCost.toLocaleString("en-US")}.00`,
          transactionType: `TV: ${selectedProvider.name} - ${planName}`,
          transactionId: "260912020100964271663837",
          date: "Sept 16, 2026 · 9:46 PM",
          statusDate: "Sep 16, 9:46 PM",
        },
      });
    }, 3500);
  };

  const displayedRecipients =
    activeListTab === "Recents" ? TV_RECENTS : TV_FAVOURITES;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Centered Title ─────────────────────────── */}
      <ScreenHeader title="TV" onBack={() => router.back()} borderBottom />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* ── Provider Selector Row matching Screenshot 1 ─────────────────── */}
        <ProviderSelectTrigger
          name={selectedProvider.name}
          imageUrl={
            selectedProvider.imageUrl || getTvLogoUrl(selectedProvider.id)
          }
          fallbackLogo={
            <TvProviderLogo provider={selectedProvider.id} size={34} />
          }
          onPress={() => setIsProviderDrawerVisible(true)}
          className="mb-2"
        />

        {/* ── Input Card: Smartcard Number ─────────────────────────────────── */}
        <FormCard>
          <View>
            <InputLabel>{selectedProvider.smartcardLabel}</InputLabel>
            <AppInput
              value={smartcardNumber}
              onChangeText={setSmartcardNumber}
              placeholder={selectedProvider.placeholder}
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.05)]"
            />
          </View>
        </FormCard>

        {/* ── Section Header: Pick a plan ──────────────────────────────────── */}
        <Text className="font-satoshi text-xl font-extrabold text-gray-900 mb-3">
          Pick a plan
        </Text>

        {/* ── Category Filter Tabs (Hot offers, Premium) ──────────────────── */}
        <View className="flex-row items-center gap-6 mb-4">
          {(["Hot offers", "Premium"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
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

        {/* ── 2-Column Plan Cards Grid matching Screenshot 1 ──────────────── */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {currentTabPlans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => handlePlanPress(plan)}
              style={{ width: "48%" }}
              className={`bg-[#F9FAFB] rounded-2xl py-4 px-3.5 justify-center border border-gray-100/80 shadow-2xs active:bg-gray-100 ${
                !isSmartcardProvided ? "opacity-85" : ""
              }`}
            >
              <Text
                numberOfLines={1}
                className="font-satoshi text-sm font-bold text-gray-900 mb-1"
              >
                {plan.name}
              </Text>
              <Text className="font-sans text-xs text-gray-500 font-medium">
                ₦{plan.price.toLocaleString("en-US")}{" "}
                <Text className="text-gray-400">({plan.duration})</Text>
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
              title={item.smartcardNumber}
              subtitle={`${item.smartcardNumber} | ${item.providerName}`}
              imageUrl={item.imageUrl || getTvLogoUrl(item.providerId)}
              fallbackLogo={
                <TvProviderLogo provider={item.providerId} size={42} />
              }
              onPress={() => handleSelectRecipient(item)}
            />
          ))}
        </View>

        {/* ── "See all" Bottom Pill Button ────────────────────────────────── */}
        <SeeAllButton
          label="See all"
          onPress={() =>
            Alert.alert("Recents", "Viewing all TV subscription recents.")
          }
        />
      </ScrollView>

      {/* ── Drawer 1: Select TV Provider ──────────────────────────────────── */}
      <TvProviderDrawer
        visible={isProviderDrawerVisible}
        selectedId={selectedProvider.id}
        onSelect={setSelectedProvider}
        onClose={() => setIsProviderDrawerVisible(false)}
      />

      {/* ── Drawer 2: TV Checkout Drawer ──────────────────────────────────── */}
      <TvCheckoutDrawer
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
        amount={selectedPlan ? selectedPlan.price : 4400}
        providerId={selectedProvider.id}
        providerName={selectedProvider.name}
        smartcardNumber={smartcardNumber}
        packageName={
          selectedPlan
            ? `${selectedPlan.name} (${selectedPlan.duration})`
            : "DStv Yanga"
        }
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
