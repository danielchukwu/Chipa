import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PlusIcon } from "@/components/ui/icons/plus-icon";
import { TabButton } from "@/components/ui/tab-button";
import { TabHeader } from "@/components/ui/tab-header";
import { useCards, type VirtualCard } from "@/context/cards-context";

export interface SubscriptionItem {
  id: string;
  name: string;
  logo: string;
  amount: string;
  frequency: string;
  nextBilling: string;
  cardName: string;
  active: boolean;
}

const MOCK_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub_1",
    name: "Netflix Premium",
    logo: "🎬",
    amount: "$19.99",
    frequency: "Monthly",
    nextBilling: "Mar 24, 2026",
    cardName: "Visa ••3814",
    active: true,
  },
  {
    id: "sub_2",
    name: "Spotify Family",
    logo: "🎵",
    amount: "$16.99",
    frequency: "Monthly",
    nextBilling: "Mar 28, 2026",
    cardName: "Mastercard ••3814",
    active: true,
  },
  {
    id: "sub_3",
    name: "ChatGPT Plus",
    logo: "🤖",
    amount: "$20.00",
    frequency: "Monthly",
    nextBilling: "Apr 02, 2026",
    cardName: "Visa ••3814",
    active: true,
  },
  {
    id: "sub_4",
    name: "Apple iCloud+ 2TB",
    logo: "☁️",
    amount: "$9.99",
    frequency: "Monthly",
    nextBilling: "Apr 05, 2026",
    cardName: "Visa ••3814",
    active: true,
  },
];

// ─── Brand Badges Matching Screenshot ────────────────────────────────────────
function VisaBadge() {
  return (
    <View className="w-12 h-8 rounded-lg bg-[#EBF3FC] items-center justify-center border border-blue-100/50">
      <Text className="font-satoshi text-xs font-black italic tracking-tighter text-[#1434CB]">
        VISA
      </Text>
    </View>
  );
}

function MastercardBadge() {
  return (
    <View className="w-12 h-8 rounded-lg bg-[#111827] items-center justify-center flex-row">
      <View className="flex-row items-center -space-x-1.5">
        <View className="w-3.5 h-3.5 rounded-full bg-[#EB001B]" />
        <View className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]" />
      </View>
    </View>
  );
}

// ─── Card Row Item ───────────────────────────────────────────────────────────
export interface CardRowProps {
  card: VirtualCard;
  onPress: () => void;
}

export function CardRow({ card, onPress }: CardRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-5 active:bg-gray-50"
    >
      <View className="flex-row items-center gap-3.5">
        {card.brand === "visa" ? <VisaBadge /> : <MastercardBadge />}
        <View>
          <Text className="font-satoshi text-base font-bold text-gray-900">
            {card.name}
          </Text>
          <Text className="font-sans text-sm font-medium text-gray-400 mt-0.5">
            ••{card.last4}
          </Text>
        </View>
      </View>
      <Text className="font-sans text-sm font-normal text-gray-400">
        {card.isFrozen ? "Frozen" : card.type}
      </Text>
    </Pressable>
  );
}

// ─── Subscription Card Item ──────────────────────────────────────────────────
export interface SubscriptionCardProps {
  subscription: SubscriptionItem;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  return (
    <View className="flex-row items-center justify-between py-3.5">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-2xl bg-gray-100 items-center justify-center">
          <Text className="text-xl">{subscription.logo}</Text>
        </View>
        <View>
          <Text className="font-satoshi text-base font-bold text-gray-900">
            {subscription.name}
          </Text>
          <Text className="font-sans text-xs text-gray-400 mt-0.5">
            {subscription.cardName} · Next {subscription.nextBilling}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="font-satoshi text-base font-bold text-gray-900">
          {subscription.amount}
        </Text>
        <Text className="font-sans text-xs text-gray-400">
          {subscription.frequency}
        </Text>
      </View>
    </View>
  );
}

export default function CardsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { cards } = useCards();

  const [activeTab, setActiveTab] = useState<"Manage" | "Subscriptions">(
    "Manage",
  );

  // Navigate to Card Details screen
  const handleCardPress = (cardId: string) => {
    router.push({
      pathname: "/card-details" as any,
      params: { initialCardId: cardId },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <TabHeader
        title="Cards"
        rightAction={
          <Pressable
            onPress={() => router.push("/create-card" as any)}
            className="h-11 flex-row items-center gap-1.5 bg-gray-100 bg-[#E7E7E7]* px-3.5 py-2 rounded-full active:bg-gray-200"
          >
            <PlusIcon
              width={18}
              height={18}
              // color="#111827"
              className="text-black/80"
            />
            <Text className="text-lg font-medium text-black/80">
              Create card
            </Text>
          </Pressable>
        }
      />

      <View className="flex-row items-center px-5 mt-2 mb-4 gap-2">
        <TabButton
          title="Manage"
          active={activeTab === "Manage"}
          onPress={() => setActiveTab("Manage")}
        />
        <TabButton
          title="Subscriptions"
          active={activeTab === "Subscriptions"}
          onPress={() => setActiveTab("Subscriptions")}
        />
      </View>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {activeTab === "Manage" ? (
          /* Card list matching screenshot */
          <View className="w-full">
            {cards.map((card) => (
              <CardRow
                key={card.id}
                card={card}
                onPress={() => handleCardPress(card.id)}
              />
            ))}
          </View>
        ) : (
          /* Subscriptions View */
          <View className="px-5 pt-2">
            <Text className="font-sans text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Active Card Subscriptions
            </Text>
            {MOCK_SUBSCRIPTIONS.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
