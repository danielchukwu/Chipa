import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { BackArrowIcon } from "@/components/ui/icons/back-arrow-icon";
import { CopyIcon } from "@/components/ui/icons/copy-icon";
import { SnowflakeIcon } from "@/components/ui/icons/snowflake-icon";
import { EditNicknameModal } from "@/components/ui/edit-nickname-modal";
import { FreezeCardDrawer } from "@/components/ui/bottom-sheets/freeze-card-drawer";
import { MoreCardActionsDrawer } from "@/components/ui/bottom-sheets/more-card-actions-drawer";
import { useCards, type VirtualCard } from "@/context/cards-context";
import { EyeIcon } from "@/components/ui/icons/eye-icon";
import { FreezeIcon } from "@/components/ui/icons/freeze-icon";
import { cn } from "@/lib/utils";
import { EyeClosedIcon } from "@/components/ui/icons/eye-closed-icon";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.round((CARD_WIDTH * 9) / 16);

const CARD_BACKGROUNDS = {
  mastercard: require("@/assets/images/cards/MASTER.webp"),
  visa: require("@/assets/images/cards/VISA.webp"),
};

// ─── Billing Address Field Row Component ─────────────────────────────────────
function AddressFieldRow({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: () => void;
}) {
  return (
    <Pressable
      onPress={onCopy}
      hitSlop={10}
      className="flex-row items-center justify-between"
    >
      <View className="flex-1 mr-3">
        <Text className="text-xs font-medium text-gray-400 mb-0.5">
          {label}
        </Text>
        <Text className="text-lg text-gray-900">{value}</Text>
      </View>
      <CopyIcon width={24} height={24} color="#6B7280" />
    </Pressable>
  );
}

// ─── Circular Action Button Component ────────────────────────────────────────
interface CardActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  buttonClassName?: string;
  textClassName?: string;
}

function CardActionButton({
  label,
  icon,
  onPress,
  buttonClassName,
  textClassName,
}: CardActionButtonProps) {
  return (
    <Pressable onPress={onPress} className="items-center flex-1">
      <View
        className={cn(
          "w-16 h-16 rounded-3xl bg-[#F3F4F6] items-center justify-center active:bg-gray-200",
          buttonClassName,
        )}
      >
        {icon}
      </View>
      <Text
        className={cn(
          "font-sans text-xs font-semibold text-gray-900 mt-2",
          textClassName,
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ─── 16:9 Card Graphic Component ─────────────────────────────────────────────
interface CardGraphicProps {
  card: VirtualCard;
  showDetails?: boolean;
  className?: string;
}

function CardGraphic({
  card,
  showDetails = true,
  className,
}: CardGraphicProps) {
  const cardImage =
    card.brand === "mastercard"
      ? CARD_BACKGROUNDS.mastercard
      : CARD_BACKGROUNDS.visa;

  return (
    <View className={cn("px-6 mt-3 mb-7 items-center", className)}>
      <View
        style={{
          width: "100%",
          maxWidth: CARD_WIDTH,
          height: CARD_HEIGHT,
          aspectRatio: 16 / 9,
        }}
        className="relative overflow-hidden"
      >
        <ImageBackground
          source={cardImage}
          resizeMode="cover"
          style={{ width: "100%", height: "100%" }}
          imageStyle={{ borderRadius: 28 }}
          className="p-5 justify-end relative"
        >
          {/* Frosted overlay badge if frozen */}
          {card.isFrozen && (
            <View className="absolute inset-0 bg-black/60 rounded-[28px] items-center justify-center z-10">
              <View className="bg-red-600 px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-md">
                <FreezeIcon width={14} height={14} color="#FFFFFF" />
                <Text className="font-sans text-xs font-bold text-white tracking-wider">
                  FROZEN
                </Text>
              </View>
            </View>
          )}

          {/* Card Details positioned at bottom-left */}
          <View className="max-w-[70%] px-5">
            <Text className="font-satoshi text-base font-bold text-white/90 mb-1">
              Daniel Chukwu
            </Text>

            {/* Card Number */}
            <Text className="font-satoshi text-[16px] font-bold tracking-[2px] text-white/90 mb-1.5">
              {showDetails ? card.cardNumber : "•••• •••• •••• ••••"}
            </Text>

            {/* Expiry & CVC row */}
            <View className="flex-row items-center">
              <View className="flex-row items-center gap-1.5 w-[84px]">
                <Text className="font-sans text-sm text-white/50">Exp</Text>
                <Text className="font-sans text-sm text-white/90">
                  {showDetails ? card.expiry : "••/••"}
                </Text>
              </View>
              <View className="flex-row items-center gap-1.5 w-[84px]">
                <Text className="font-sans text-sm text-white/50">CVC</Text>
                <Text className="font-sans text-sm text-white/90">
                  {showDetails ? card.cvv : "••••"}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

// ─── Card Details Screen ─────────────────────────────────────────────────────
export default function CardDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ initialCardId?: string }>();
  const { cards, toggleFreezeCard, updateCardNickname, deleteCard } =
    useCards();

  const activeCard =
    cards.find((c) => c.id === params.initialCardId) || cards[0];

  const [showDetails, setShowDetails] = useState(true);
  const [isFreezeDrawerVisible, setIsFreezeDrawerVisible] = useState(false);
  const [isMoreDrawerVisible, setIsMoreDrawerVisible] = useState(false);
  const [isEditNicknameVisible, setIsEditNicknameVisible] = useState(false);

  // Address Data matching Screenshot
  const billingAddress = {
    street: "15 of Wall Street",
    city: "Maitama",
    state: "FCT",
    zipCode: "900001",
    country: "Nigeria",
  };

  const handleCopyField = (field: string, val: string) => {
    Alert.alert("Copied", `${field}: "${val}" copied to clipboard.`);
  };

  const handleCopyAll = () => {
    const full = `${billingAddress.street}, ${billingAddress.city}, ${billingAddress.state} ${billingAddress.zipCode}, ${billingAddress.country}`;
    Alert.alert(
      "Copied!",
      `Complete billing address copied to clipboard:\n\n${full}`,
    );
  };

  const handleTransactionHistory = () => {
    if (!activeCard) return;
    Alert.alert(
      "Transaction History",
      `Recent activity for ${activeCard.name} (••${activeCard.last4}):\n\n• Netflix.com: -$15.99\n• Amazon Prime: -$14.99\n• Apple Services: -$9.99\n• Lead Bank Funding: +$500.00`,
    );
  };

  const handleCancelCard = () => {
    if (!activeCard) return;
    Alert.alert(
      "Cancel Card",
      `Are you sure you want to permanently cancel ${activeCard.name} (••${activeCard.last4})? This action cannot be undone.`,
      [
        { text: "Keep Card", style: "cancel" },
        {
          text: "Cancel Card",
          style: "destructive",
          onPress: () => {
            deleteCard(activeCard.id);
            router.back();
          },
        },
      ],
    );
  };

  if (!activeCard) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Text className="font-satoshi text-lg font-bold text-gray-900 mb-4">
          No card selected
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="px-6 py-3 bg-black rounded-full"
        >
          <Text className="font-satoshi text-sm font-bold text-white">
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* ── Top Bar: Back Arrow & Dynamic Active Card Title ───────────────── */}
      <View className="relative flex-row items-center justify-center px-5 py-3.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="absolute left-5 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10"
        >
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-base font-bold text-gray-900">
          ••{activeCard.last4} {activeCard.name}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <CardGraphic card={activeCard} showDetails={showDetails} />

        <View className="flex-row items-center justify-around px-8 mb-8">
          <CardActionButton
            label={showDetails ? "Hide details" : "Show details"}
            icon={
              showDetails ? (
                <EyeIcon
                  width={24}
                  height={24}
                  strokeWidth={1.2}
                  className="text-black/80"
                />
              ) : (
                <EyeClosedIcon
                  width={24}
                  height={24}
                  strokeWidth={1.2}
                  className="text-black/80"
                />
              )
            }

            onPress={() => setShowDetails((prev) => !prev)}
          />

          <CardActionButton
            label={activeCard.isFrozen ? "Unfreeze" : "Freeze"}
            buttonClassName={
              activeCard.isFrozen ? "bg-red-500 active:bg-red-600" : undefined
            }
            icon={
              <FreezeIcon
                width={24}
                height={24}
                className={activeCard.isFrozen ? "text-white" : "text-black/80"}
                color={activeCard.isFrozen ? "#FFFFFF" : "#111827"}
              />
            }
            onPress={() => setIsFreezeDrawerVisible(true)}
          />

          <CardActionButton
            label="More"
            icon={
              <BackArrowIcon
                width={24}
                height={24}
                className="text-black/80"
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            }
            onPress={() => setIsMoreDrawerVisible(true)}
          />
        </View>

        {/* ── Billing Address Section ───────────────────────────────────────── */}
        <View className="px-6 mb-6">
          <Text className="font-satoshi text-[20px] font-extrabold text-gray-900 mb-4">
            Billing Address
          </Text>

          <View className="bg-[#F8F8FB] rounded-[24px] p-5 gap-4">
            <AddressFieldRow
              label="Street"
              value={billingAddress.street}
              onCopy={() => handleCopyField("Street", billingAddress.street)}
            />
            <AddressFieldRow
              label="City"
              value={billingAddress.city}
              onCopy={() => handleCopyField("City", billingAddress.city)}
            />
            <AddressFieldRow
              label="State"
              value={billingAddress.state}
              onCopy={() => handleCopyField("State", billingAddress.state)}
            />
            <AddressFieldRow
              label="ZIP Code"
              value={billingAddress.zipCode}
              onCopy={() => handleCopyField("ZIP Code", billingAddress.zipCode)}
            />
            <AddressFieldRow
              label="Country"
              value={billingAddress.country}
              onCopy={() => handleCopyField("Country", billingAddress.country)}
            />
          </View>
        </View>

        {/* ── "Copy All" Bottom Button ──────────────────────────────────────── */}
        <View className="px-6 pb-6">
          <Pressable
            onPress={handleCopyAll}
            className="w-full bg-[#FAD2A4] rounded-full py-4 items-center justify-center active:bg-amber-200"
          >
            <Text className="font-sans text-base font-bold text-gray-900">
              Copy All
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Freeze Confirmation Bottom Sheet ──────────────────────────────── */}
      <FreezeCardDrawer
        visible={isFreezeDrawerVisible}
        card={activeCard}
        onClose={() => setIsFreezeDrawerVisible(false)}
        onProceed={() => toggleFreezeCard(activeCard.id)}
      />

      {/* ── More Actions Bottom Sheet ─────────────────────────────────────── */}
      <MoreCardActionsDrawer
        visible={isMoreDrawerVisible}
        onClose={() => setIsMoreDrawerVisible(false)}
        onTransactionHistory={handleTransactionHistory}
        onEditNickname={() => setIsEditNicknameVisible(true)}
        onCancelCard={handleCancelCard}
      />

      {/* ── Edit Nickname Modal ───────────────────────────────────────────── */}
      <EditNicknameModal
        visible={isEditNicknameVisible}
        currentName={activeCard.name}
        onClose={() => setIsEditNicknameVisible(false)}
        onSave={(newName) => updateCardNickname(activeCard.id, newName)}
      />
    </SafeAreaView>
  );
}
