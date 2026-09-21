import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { ChevronRightIcon } from "@/components/ui/icons/app-icons";

// ─── 1. History Clock Icon ──────────────────────────────────────────────────
function HistoryClockIcon({
  size = 22,
  color = "#111827",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 3v5h5M12 7v5l3 3"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── 2. Beneficiaries People Icon ───────────────────────────────────────────
function BeneficiariesPeopleIcon({
  size = 22,
  color = "#111827",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={1.9} />
      <Path
        d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── 3. Account Statement Document Icon ─────────────────────────────────────
function AccountStatementIcon({
  size = 22,
  color = "#111827",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── 4. Proof of Account Rosette / Checkmark Badge Icon ─────────────────────
function ProofOfAccountIcon({
  size = 22,
  color = "#111827",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.85 8.62a4 4 0 014.78-4.77 4 4 0 016.74 0 4 4 0 014.78 4.78 4 4 0 010 6.74 4 4 0 01-4.77 4.78 4 4 0 01-6.75 0 4 4 0 01-4.78-4.77 4 4 0 010-6.76z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export interface MoreOptionsDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function MoreOptionsDrawer({ visible, onClose }: MoreOptionsDrawerProps) {
  const router = useRouter();

  const handleTransactionHistory = () => {
    onClose();
    router.push("/transactions" as any);
  };

  const handleBeneficiaries = () => {
    onClose();
    router.push("/transfer" as any);
  };

  const handleAccountStatement = () => {
    onClose();
    Alert.alert(
      "Account Statement",
      "Select date range to export your certified PDF account statement.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export Last 30 Days",
          onPress: () =>
            Alert.alert(
              "Sent",
              "Your statement has been sent to your email address."
            ),
        },
      ]
    );
  };

  const handleProofOfAccount = () => {
    onClose();
    Alert.alert(
      "Proof of Account",
      "Download an official Chipa bank confirmation letter verifying your account number and name.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Download PDF",
          onPress: () =>
            Alert.alert(
              "Downloaded",
              "Proof of account certificate saved to downloads."
            ),
        },
      ]
    );
  };

  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-xl font-bold text-gray-900 mb-6">
        More
      </Text>

      {/* Option 1: Transaction History */}
      <Pressable
        onPress={handleTransactionHistory}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <HistoryClockIcon />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Transaction History
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>

      {/* Option 2: Beneficiaries/Recipients */}
      <Pressable
        onPress={handleBeneficiaries}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <BeneficiariesPeopleIcon />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Beneficiaries/Recipients
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>

      {/* Option 3: Account Statement */}
      <Pressable
        onPress={handleAccountStatement}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <AccountStatementIcon />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Account Statement
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>

      {/* Option 4: Proof of Account */}
      <Pressable
        onPress={handleProofOfAccount}
        className="flex-row items-center justify-between py-4 px-2 rounded-2xl active:bg-gray-50"
      >
        <View className="flex-row items-center gap-3.5">
          <ProofOfAccountIcon />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Proof of Account
          </Text>
        </View>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>
    </DraggableBottomSheet>
  );
}
