import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { AppButton } from "@/components/ui/app-button";
import { ArrowDownCircleIcon } from "@/components/ui/icons/app-icons";
import { RuleCard } from "@/components/ui/rule-card";
import { TabButton } from "@/components/ui/tab-button";
import { TabHeader } from "@/components/ui/tab-header";
import { cn } from "@/lib/utils";
import { RewardsIcon } from "@/components/ui/icons/navbar/rewards-icon";

// ─── Referral & Transaction Models
interface ReferralItem {
  id: string;
  name: string;
  daysLeft: number;
  percentage: number;
  avatarUrl: string;
}

const REFERRALS: ReferralItem[] = [
  {
    id: "ref_1",
    name: "Eberechi Eze",
    daysLeft: 43,
    percentage: 34,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "ref_2",
    name: "Joshua Gapsiso",
    daysLeft: 43,
    percentage: 32,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "ref_3",
    name: "Adaobi Okonkwo",
    daysLeft: 38,
    percentage: 65,
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  },
  {
    id: "ref_4",
    name: "Tunde Bakare",
    daysLeft: 21,
    percentage: 80,
    avatarUrl:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  },
];

interface RewardTransaction {
  id: string;
  title: string;
  date: string;
  amount: string;
}

const REWARD_TRANSACTIONS: RewardTransaction[] = [
  {
    id: "rt_1",
    title: "Daniel Chukwu",
    date: "Feb 28, 9:56 PM",
    amount: "₦5,245.83",
  },
  {
    id: "rt_2",
    title: "Transfer to Chidebere",
    date: "Feb 28, 9:56 PM",
    amount: "₦5,245.83",
  },
  {
    id: "rt_3",
    title: "Referral Bonus - Eberechi Eze",
    date: "Feb 26, 4:12 PM",
    amount: "₦5,245.83",
  },
  {
    id: "rt_4",
    title: "Referral Bonus - Joshua Gapsiso",
    date: "Feb 20, 11:30 AM",
    amount: "₦5,245.83",
  },
];

const CONDITIONS = [
  {
    id: "1",
    title: "Cash Inflow",
    subtitle:
      "They must receive a total of $200 (or the equivalent in GBP or EUR)",
  },
  {
    id: "2",
    title: "USD to Non-USD transfers",
    subtitle:
      "They must spend a total of $200 using their Chipa virtual dollar card",
  },
  {
    id: "3",
    title: "Time duration",
    subtitle:
      "They must meet the above conditions within 50 days after sign up",
  },
];

// ─── Avatar Component with Error Fallback ────────────────────────────────────
function AvatarImage({ uri, name }: { uri: string; name: string }) {
  const [hasError, setHasError] = useState(false);
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (hasError) {
    return (
      <View className="w-11 h-11 rounded-full bg-amber-100 items-center justify-center border border-amber-200">
        <Text className="font-satoshi text-sm font-bold text-amber-900">
          {initials}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      onError={() => setHasError(true)}
      className="w-11 h-11 rounded-full bg-gray-200"
    />
  );
}

// ─── Metric Card Component ──────────────────────────────────────────────────
interface MetricCardProps {
  label: string;
  value: string | number;
  delta?: string;
  variant?: "accent" | "default";
  width?: string;
}

function MetricCard({
  label,
  value,
  delta,
  variant = "default",
  width,
}: MetricCardProps) {
  const isAccent = variant === "accent";

  return (
    <View
      className={cn(
        "rounded-2xl p-4 justify-between gap-2.5",
        width ?? "min-w-[150px]",
        isAccent ? "bg-[#FDBE4E]" : "bg-[#F8F8FB]",
      )}
    >
      <Text
        className={cn(
          "text-xs font-medium",
          isAccent ? "text-amber-950/80" : "text-gray-400",
        )}
      >
        {label}
      </Text>
      <View className="flex-row items-baseline">
        <Text className="font-satoshi text-[24px] font-bold text-gray-900">
          {value}
        </Text>
        {Boolean(delta) && (
          <Text className="font-bold text-[#16A34A] ml-2">{delta}</Text>
        )}
      </View>
    </View>
  );
}

const METRICS: MetricCardProps[] = [
  {
    label: "Rewards",
    value: "$10.00",
    variant: "accent",
    width: "w-[155px]",
  },
  {
    label: "Referrals Who Met Conditions",
    value: "10",
    delta: "+2",
    width: "w-[220px]",
  },
  {
    label: "Total Referrals",
    value: "89",
    width: "w-[160px]",
  },
];

// ─── Home Tab View Component ────────────────────────────────────────────────
function RewardsHomeTab({
  referralLink,
  onCopy,
  onShare,
}: {
  referralLink: string;
  onCopy: () => void;
  onShare: () => void;
}) {
  return (
    <View>
      {/* Referral link box */}
      <View className="mb-5 gap-2">
        <Text className="text-[16px] font-medium text-black/80">
          Referral Link
        </Text>
        <View className="h-14 flex-row items-center gap-2 bg-black/5 rounded-2xl px-4">
          <Text className="flex-1 text-[18px] text-gray-600" numberOfLines={1}>
            {referralLink}
          </Text>
          <Pressable
            onPress={onCopy}
            className="h-9 bg-[#FDBE4E] rounded-full px-4 items-center justify-center active:bg-amber-400"
          >
            <Text className="text-[14px] font-bold text-gray-900">Copy</Text>
          </Pressable>
          <Pressable
            onPress={onShare}
            className="h-9 bg-gray-900 rounded-full px-4 items-center justify-center active:bg-gray-800"
          >
            <Text className="text-[14px] font-bold text-white">Share</Text>
          </Pressable>
        </View>
      </View>

      {/* Conditions headline */}
      <View className="mb-5">
        <Text className="font-satoshi text-[28px] font-bold text-gray-900">
          Earn <Text style={{ color: "#F05D09" }}>$5</Text> for every user you refer
          that meets the below conditions
        </Text>
      </View>

      {/* Conditions list */}
      <View className="gap-4">
        {CONDITIONS.map((cond) => (
          <RuleCard
            key={cond.id}
            icon={
              <RewardsIcon
                width={24}
                height={24}
                className="shrink-0"
                color="#9CA3AF"
              />
            }
            title={cond.title}
            subtitle={cond.subtitle}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Referrals Tab View Component ───────────────────────────────────────────
function RewardsReferralsTab({
  referrals = REFERRALS,
}: {
  referrals?: ReferralItem[];
} = {}) {
  return (
    <View>
      {referrals.map((item) => (
        <View key={item.id} className="flex-row items-center gap-3.5 py-4">
          <AvatarImage uri={item.avatarUrl} name={item.name} />
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-medium text-gray-900">
                {item.name}
              </Text>
              <Text className="text-base text-gray-500">
                {item.daysLeft}d left ·{" "}
                <Text className="font-bold">{item.percentage}%</Text>
              </Text>
            </View>
            <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <View
                style={{ width: `${item.percentage}%` }}
                className="h-full bg-[#059669] rounded-full"
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Transactions Tab View Component ────────────────────────────────────────
function RewardsTransactionsTab({
  transactions = REWARD_TRANSACTIONS,
}: {
  transactions?: RewardTransaction[];
} = {}) {
  return (
    <View>
      {transactions.map((tx) => (
        <View
          key={tx.id}
          className="flex-row items-center justify-between py-5"
        >
          <View className="flex-row items-center gap-3">
            <ArrowDownCircleIcon width={38} height={38} />
            <View>
              <Text className="text-base font-semibold text-gray-900 mb-0.5">
                {tx.title}
              </Text>
              <Text className="text-xs text-gray-400">{tx.date}</Text>
            </View>
          </View>
          <Text className="text-base font-bold text-[#16A34A]">
            {tx.amount}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function RewardsScreen() {
  const insets = useSafeAreaInsets();
  const [activeSegment, setActiveSegment] = useState<
    "Home" | "Referrals" | "Transactions"
  >("Home");

  const referralLink = "https://referral.chipa.com/referral_code=daniel";

  const handleCopy = () => {
    Alert.alert("Copied!", "Referral link copied to clipboard.");
  };

  const handleShare = () => {
    Alert.alert("Share", "Share sheet coming soon!");
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <TabHeader title="Rewards" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pt-4 px-5"
        >
          <View className="flex-row gap-3">
            {METRICS.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </View>
        </ScrollView>

        <View className="px-12 pt-6">
          <AppButton
            title="Withdraw"
            variant="primary"
            onPress={() =>
              Alert.alert("Withdraw", "Withdrawal feature coming soon!")
            }
          />
        </View>

        {/* ── Segment Pills Row: Home | Referrals | Transactions ───────────── */}
        <View className="flex-row items-center px-5 pt-6 gap-2">
          {(["Home", "Referrals", "Transactions"] as const).map((seg) => (
            <TabButton
              key={seg}
              title={seg}
              active={activeSegment === seg}
              onPress={() => setActiveSegment(seg)}
            />
          ))}
        </View>
        <View className="px-5 pt-6">
          {activeSegment === "Home" && (
            <RewardsHomeTab
              referralLink={referralLink}
              onCopy={handleCopy}
              onShare={handleShare}
            />
          )}
          {activeSegment === "Referrals" && <RewardsReferralsTab />}
          {activeSegment === "Transactions" && <RewardsTransactionsTab />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
