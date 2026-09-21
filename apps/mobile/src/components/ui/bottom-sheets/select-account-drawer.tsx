import { useRouter } from "expo-router";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { ChevronRightIcon } from "@/components/ui/icons/app-icons";
import {
  CHPIcon,
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";

export interface SelectAccountDrawerProps {
  visible: boolean;
  onClose: () => void;
  userAccountNumber?: string;
  chipaId?: string;
}

export function SelectAccountDrawer({
  visible,
  onClose,
  userAccountNumber = "9031420494",
  chipaId = "011784892",
}: SelectAccountDrawerProps) {
  const router = useRouter();

  const handleSelect = (currency: "NGN" | "USD") => {
    onClose();
    router.push({
      pathname: "/add-money" as any,
      params: { currency },
    });
  };

  const handleGetAccount = (currency: string) => {
    onClose();
    Alert.alert(
      `Get ${currency} Account`,
      `Request your dedicated international ${currency} virtual banking account with zero maintenance fees.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Apply Now",
          onPress: () =>
            Alert.alert(
              "Application Submitted",
              `Your ${currency} account application has been submitted and will be ready in 1-2 business hours.`
            ),
        },
      ]
    );
  };

  const handleChipaAccount = () => {
    onClose();
    Alert.alert(
      "Chipa Account",
      `Your Chipa Account ID is ${chipaId}. Friends can send you funds instantly using this ID or your Chipa tag @chioma.`,
      [
        { text: "Close", style: "cancel" },
        {
          text: "Copy ID",
          onPress: () =>
            Alert.alert("Copied!", `Chipa ID ${chipaId} copied to clipboard.`),
        },
      ]
    );
  };

  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-6">
        Select Account
      </Text>

      {/* 1. NGN Account */}
      <Pressable
        onPress={() => handleSelect("NGN")}
        className="flex-row items-center justify-between py-3.5 active:bg-gray-50 rounded-2xl px-1 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <NGNIcon size={28} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            NGN
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="bg-[#E5E7EB] rounded-xl px-3.5 py-1.5">
            <Text className="font-satoshi text-sm font-semibold text-[#1F2937]">
              {userAccountNumber}
            </Text>
          </View>
          <ChevronRightIcon color="#374151" />
        </View>
      </Pressable>

      {/* 2. USD Account */}
      <Pressable
        onPress={() => handleSelect("USD")}
        className="flex-row items-center justify-between py-3.5 active:bg-gray-50 rounded-2xl px-1 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <USDIcon size={28} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            USD
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="bg-[#E5E7EB] rounded-xl px-3.5 py-1.5">
            <Text className="font-satoshi text-sm font-semibold text-[#1F2937]">
              {userAccountNumber}
            </Text>
          </View>
          <ChevronRightIcon color="#374151" />
        </View>
      </Pressable>

      {/* 3. GBP Account */}
      <Pressable
        onPress={() => handleGetAccount("GBP")}
        className="flex-row items-center justify-between py-3.5 active:bg-gray-50 rounded-2xl px-1 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <GBPIcon size={28} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            GBP
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="bg-[#E6F0FA] rounded-xl px-3.5 py-1.5">
            <Text className="font-satoshi text-sm font-semibold text-[#1E293B]">
              Get Account
            </Text>
          </View>
          <ChevronRightIcon color="#374151" />
        </View>
      </Pressable>

      {/* 4. EUR Account */}
      <Pressable
        onPress={() => handleGetAccount("EUR")}
        className="flex-row items-center justify-between py-3.5 active:bg-gray-50 rounded-2xl px-1 mb-1"
      >
        <View className="flex-row items-center gap-3.5">
          <EURIcon size={28} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            EUR
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="bg-[#E6F0FA] rounded-xl px-3.5 py-1.5">
            <Text className="font-satoshi text-sm font-semibold text-[#1E293B]">
              Get Account
            </Text>
          </View>
          <ChevronRightIcon color="#374151" />
        </View>
      </Pressable>

      {/* 5. Chipa Account */}
      <Pressable
        onPress={handleChipaAccount}
        className="flex-row items-center justify-between py-3.5 active:bg-gray-50 rounded-2xl px-1"
      >
        <View className="flex-row items-center gap-3.5">
          <CHPIcon size={28} />
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Chipa
          </Text>
        </View>

        <View className="flex-row items-center gap-2.5">
          <View className="bg-[#E5E7EB] rounded-xl px-3.5 py-1.5">
            <Text className="font-satoshi text-sm font-semibold text-[#1F2937]">
              ID: {chipaId}
            </Text>
          </View>
          <ChevronRightIcon color="#374151" />
        </View>
      </Pressable>
    </DraggableBottomSheet>
  );
}
