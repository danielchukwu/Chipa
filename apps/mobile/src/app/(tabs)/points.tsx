import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { PointsIcon } from "@/components/ui/icons/navbar/points-icon";
import { RuleCard } from "@/components/ui/rule-card";
import { TabHeader } from "@/components/ui/tab-header";

function PointsBillboard({ points }: { points: number }) {
  return (
    <View className="bg-gray-900 rounded-2xl px-5 py-5 gap-3">
      <Text className="text-sm text-white/50">Points</Text>

      <View className="flex-row items-center gap-3 justify-between flex-1">
        <View className="flex-1 flex-row items-center gap-3">
          <PointsIcon width={20} height={20} color="#9CA3AF" />
          <Text className="font-satoshi text-2xl font-bold text-white">
            {points}
          </Text>
        </View>

        <View className="bg-[#FDBE4E] border-2 border-white rounded-full px-3 py-1.5">
          <Text className="text-xs font-bold text-gray-900">
            100 points = $1
          </Text>
        </View>
      </View>
    </View>
  );
}

const POINTS_RULES = [
  {
    id: "1",
    title: "USD deposits",
    subtitle: "For every $10, you get 1 point",
  },
  {
    id: "2",
    title: "USD to Non-USD transfers",
    subtitle: "For every $10, you get 1 point",
  },
  {
    id: "3",
    title: "USD card transactions",
    subtitle: "For every $10, you get 1 point",
  },
  {
    id: "4",
    title: "Conversions",
    subtitle: "For every 10 conversions, you get 1 point",
  },
];

export default function PointsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Header */}
      <TabHeader title="Points" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        className="px-5 pt-5"
      >
        <PointsBillboard points={0} />

        <View className="gap-6 pt-5">
          <Text className="font-satoshi text-[28px] font-bold text-gray-900">
            Earn points that convert to{" "}
            <Text style={{ color: "#FDBE4E" }}>dollars</Text> by carrying out the
            below transactions on Chipa
          </Text>

          {/* ── Rules list ─────────────────────────────────────────────────── */}
          <View className="gap-4">
            {POINTS_RULES.map((rule) => (
              <RuleCard
                key={rule.id}
                icon={<PointsIcon width={24} height={24} color="#9CA3AF" />}
                title={rule.title}
                subtitle={rule.subtitle}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
