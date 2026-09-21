import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  ImageBackground,
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

import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { EnterPinDrawer } from "@/components/ui/bottom-sheets/enter-pin-drawer";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { PaySummaryDrawer } from "@/components/ui/bottom-sheets/pay-summary-drawer";
import {
  PaymentMethodOption,
  SelectPaymentMethodDrawer,
} from "@/components/ui/select-payment-method-drawer";
import { RadioIndicator } from "@/components/ui/radio-indicator";
import { CardBrand, useCards, VirtualCard } from "@/context/cards-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.round((CARD_WIDTH * 9) / 16);

const CARD_BACKGROUNDS = {
  mastercard: require("@/assets/images/cards/MASTER.webp"),
  visa: require("@/assets/images/cards/VISA.webp"),
};

interface CardNetworkOptionProps {
  brand: CardBrand;
  isSelected: boolean;
  onPress: () => void;
}

function CardNetworkOption({
  brand,
  isSelected,
  onPress,
}: CardNetworkOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-between border rounded-2xl p-4 bg-white active:bg-gray-50 ${
        isSelected ? "border-gray-900" : "border-gray-200"
      }`}
    >
      <RadioIndicator selected={isSelected} className="mr-3" />
      {brand === "mastercard" ? (
        <View className="flex-row items-center -space-x-1.5">
          <View className="w-6 h-6 rounded-full bg-[#EB001B]" />
          <View className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-95" />
        </View>
      ) : (
        <Text className="font-satoshi text-xl font-black italic tracking-tighter text-[#1434CB]">
          VISA
        </Text>
      )}
    </Pressable>
  );
}

export default function CreateCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addCard } = useCards();

  // Form states
  const cardholderName = "Daniel Chukwu (You)";
  const [nickname, setNickname] = useState("Daniel's Card");
  const [cardNetwork, setCardNetwork] = useState<CardBrand>("visa");

  // Drawer states
  const [isDrawer1Visible, setIsDrawer1Visible] = useState(false);
  const [isDrawer2Visible, setIsDrawer2Visible] = useState(false);
  const [isDrawer3Visible, setIsDrawer3Visible] = useState(false);

  // Selected payment method for Drawer 1 & 2
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethodOption>({
      code: "USD",
      flag: "🇺🇸",
      balance: "₦2,800.00",
    });

  // Flow completion states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCard, setCreatedCard] = useState<VirtualCard | null>(null);

  // Trigger PIN drawer submission -> loading overlay for 4 seconds -> success page
  const handlePinSubmit = (_pin: string) => {
    setIsDrawer3Visible(false);
    setIsLoading(true);

    setTimeout(() => {
      const newCard = addCard({
        name: nickname.trim() || "Daniel's Card",
        brand: cardNetwork,
        currency: "USD",
        theme: cardNetwork === "visa" ? "champagne" : "black",
      });
      setCreatedCard(newCard);
      setIsLoading(false);
      setIsSuccess(true);
    }, 4000);
  };

  const handleCreateAnother = () => {
    setIsSuccess(false);
    setCreatedCard(null);
    setNickname("Daniel's Card");
    setCardNetwork("visa");
  };

  const handleSeeCardDetails = () => {
    if (createdCard) {
      router.replace({
        pathname: "/card-details" as any,
        params: { initialCardId: createdCard.id },
      });
    } else {
      router.back();
    }
  };

  // ─── Screenshot 3: Card Created Successfully View ─────────────────────────
  if (isSuccess) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: insets.bottom + 20,
          }}
        >
          {/* Card Graphic */}
          <View className="items-center">
            <View
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                aspectRatio: 16 / 9,
              }}
              className="rounded-[28px] shadow-xl relative overflow-hidden"
            >
              <ImageBackground
                source={
                  createdCard?.brand === "mastercard"
                    ? CARD_BACKGROUNDS.mastercard
                    : CARD_BACKGROUNDS.visa
                }
                resizeMode="cover"
                style={{ width: "100%", height: "100%" }}
                imageStyle={{ borderRadius: 28 }}
                className="p-5 justify-end relative"
              >
                {/* Card Details on Card Face */}
                <View className="max-w-[70%]">
                  <Text className="font-satoshi text-base font-bold text-white mb-1">
                    Daniel Chukwu
                  </Text>
                  <Text className="font-satoshi text-[16px] font-bold tracking-[2px] text-white mb-1.5">
                    •••• •••• •••• ••••
                  </Text>
                  <View className="flex-row items-center gap-5">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-sans text-xs text-white/70">
                        Exp
                      </Text>
                      <Text className="font-sans text-xs font-bold text-white">
                        ••/••
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-sans text-xs text-white/70">
                        CVC
                      </Text>
                      <Text className="font-sans text-xs font-bold text-white">
                        ••••
                      </Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>

            {/* Success Headline and Message */}
            <Text className="font-satoshi text-3xl font-extrabold text-gray-900 mt-10 mb-3 text-center">
              You&apos;re all set
            </Text>
            <Text className="font-sans text-base text-gray-600 text-center leading-relaxed px-4">
              Your card has been created successfully.{"\n"}Go make Nigeria
              great again.
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-3 mt-12">
            <Pressable
              onPress={handleSeeCardDetails}
              className="flex-1 h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs"
            >
              <Text className="font-satoshi text-base font-bold text-[#FDE5C5]">
                See card details
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCreateAnother}
              className="flex-1 h-14 bg-[#EBEBEB] rounded-full items-center justify-center active:opacity-85"
            >
              <Text className="font-satoshi text-base font-bold text-gray-900">
                Create another
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Screenshot 1: Create a Card Form ──────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View className="flex-row items-center px-5 py-3.5 mb-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 mr-2"
        >
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-2xl font-extrabold text-gray-900">
          Create a Card
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Cardholder Input */}
        <View className="mb-5">
          <Text className="font-sans text-sm font-semibold text-gray-700 mb-2">
            Cardholder
          </Text>
          <View className="border border-gray-100 bg-gray-50/70 rounded-2xl px-4 py-4">
            <Text className="font-sans text-base font-normal text-gray-400">
              {cardholderName}
            </Text>
          </View>
        </View>

        {/* Card Nickname Input */}
        <View className="mb-6">
          <Text className="font-sans text-sm font-semibold text-gray-700 mb-2">
            Card nickname
          </Text>
          <View className="border border-gray-200 bg-white rounded-2xl px-4 py-3.5 focus:border-black">
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="Daniel's Card"
              placeholderTextColor="#9CA3AF"
              className="font-satoshi text-base font-semibold text-gray-900"
            />
          </View>
        </View>

        {/* Divider */}
        <View className="h-px bg-gray-100 mb-6" />

        {/* Card Type Section */}
        <View className="mb-6">
          <Text className="font-sans text-sm font-semibold text-gray-700 mb-2.5">
            Card type
          </Text>
          <View className="flex-row gap-3">
            {/* Virtual Option (Selected) */}
            <View className="flex-1 flex-row items-center border border-gray-200 rounded-2xl p-4 bg-white">
              <RadioIndicator selected={true} className="mr-3" />
              <Text className="font-sans text-base font-semibold text-gray-900">
                Virtual
              </Text>
            </View>

            {/* Physical Option (Disabled) */}
            <View className="flex-1 flex-row items-center justify-center border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
              <Text className="font-sans text-base font-normal text-gray-400">
                Physical
              </Text>
            </View>
          </View>
        </View>

        {/* Card Network Section */}
        <View className="mb-6">
          <Text className="font-sans text-sm font-semibold text-gray-700 mb-2.5">
            Card network
          </Text>
          <View className="flex-row gap-3">
            <CardNetworkOption
              brand="mastercard"
              isSelected={cardNetwork === "mastercard"}
              onPress={() => setCardNetwork("mastercard")}
            />
            <CardNetworkOption
              brand="visa"
              isSelected={cardNetwork === "visa"}
              onPress={() => setCardNetwork("visa")}
            />
          </View>
        </View>

        {/* Terms Notice with Matching Colors */}
        <View className="mb-10">
          <Text className="font-sans text-xs text-gray-400 leading-relaxed">
            By clicking create card, you accept the{" "}
            <Text className="text-[#3B82F6] font-medium">Esign Consent</Text>
            {", "}
            <Text className="text-[#10B981] font-medium">Chipa card terms</Text>
            {", and the "}
            <Text className="text-[#F59E0B] font-medium">Issuer policy</Text>
            {" the Esign Consent"}
          </Text>
        </View>

        {/* Create Card Button */}
        <Pressable
          onPress={() => setIsDrawer1Visible(true)}
          className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs"
        >
          <Text className="font-satoshi text-base font-bold text-[#FDE5C5]">
            Create card
          </Text>
        </Pressable>
      </ScrollView>

      {/* ── Drawer 1: Pay Summary ─────────────────────────────────────────── */}
      <PaySummaryDrawer
        visible={isDrawer1Visible}
        onClose={() => setIsDrawer1Visible(false)}
        onOpenSelectPaymentMethod={() => {
          setIsDrawer1Visible(false);
          setIsDrawer2Visible(true);
        }}
        onPay={() => {
          setIsDrawer1Visible(false);
          setIsDrawer3Visible(true);
        }}
        selectedCurrency={selectedPaymentMethod.code}
        selectedBalance={selectedPaymentMethod.balance}
      />

      {/* ── Drawer 2: Select Payment Method ───────────────────────────────── */}
      <SelectPaymentMethodDrawer
        visible={isDrawer2Visible}
        onClose={() => {
          setIsDrawer2Visible(false);
          setIsDrawer1Visible(true);
        }}
        onSelect={(option) => {
          setSelectedPaymentMethod(option);
          setIsDrawer2Visible(false);
          setIsDrawer1Visible(true);
        }}
      />

      {/* ── Drawer 3: Enter PIN with Custom Chipa Secure Keypad ───────────── */}
      <EnterPinDrawer
        visible={isDrawer3Visible}
        onClose={() => setIsDrawer3Visible(false)}
        onPinComplete={handlePinSubmit}
      />

      {/* ── 4-Second Pulsating Chipa Loading Overlay ───────────────────────── */}
      <LoadingOverlay visible={isLoading} />
    </SafeAreaView>
  );
}
