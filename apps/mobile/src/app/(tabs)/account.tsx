import { useRouter } from "expo-router";
import React from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { ChevronRightIcon } from "@/components/ui/icons/app-icons";
import { CopyIcon } from "@/components/ui/icons/copy-icon";
import {
  AccountInfoCircleIcon,
  BadgeVerificationIcon,
  RedLogoutIcon,
} from "@/components/ui/icons/snowflake-icon";
import { TabHeader } from "@/components/ui/tab-header";
import { useAuth } from "@/context/auth-context";
import { TierIcon } from "@/components/ui/icons/tier-icon";
import { cn } from "@/lib/utils";

// ─── Menu Row Component ──────────────────────────────────────────────────────
interface AccountMenuRowProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  isDestructive?: boolean;
}

function AccountMenuRow({
  label,
  icon,
  onPress,
  isDestructive = false,
}: AccountMenuRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-16 flex-row items-center justify-between py-4 active:opacity-60"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-7 items-center justify-center mr-3">{icon}</View>
        <Text
          className={cn(
            "font-satoshi text-base font-semibold",
            isDestructive ? "text-red-500" : "text-gray-900",
          )}
        >
          {label}
        </Text>
      </View>
      <ChevronRightIcon width={16} height={16} color="#6B7280" />
    </Pressable>
  );
}

// ─── Menu Section Component ──────────────────────────────────────────────────
interface AccountMenuSectionProps {
  title: string;
  children: React.ReactNode;
}

function AccountMenuSection({ title, children }: AccountMenuSectionProps) {
  return (
    <View className="mb-6 gap-2.5">
      <Text className="text-base font-medium text-black/90">{title}</Text>
      <View className="bg-[#F8F8FB] rounded-2xl px-5 py-1.5">{children}</View>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const accountId = "09819347";
  const userName = "Lottana Chukwuka";

  const handleCopyId = () => {
    Alert.alert("Copied", `Account ID ${accountId} copied to clipboard.`);
  };

  const handleUpgradeTier = () => {
    Alert.alert(
      "Upgrade to Tier 2",
      "Upload a government-issued ID and proof of address to unlock higher daily transaction limits.",
      [
        { text: "Later", style: "cancel" },
        {
          text: "Continue",
          onPress: () =>
            Alert.alert("Verification", "Verification portal initiated."),
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/" as any);
        },
      },
    ]);
  };

  const menuSections = [
    {
      title: "Profile",
      items: [
        {
          id: "account-info",
          label: "Account Info",
          icon: (
            <AccountInfoCircleIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert(
              "Account Info",
              `Name: ${userName}\nAccount ID: ${accountId}`,
            ),
        },
        {
          id: "verifications",
          label: "Verifications",
          icon: (
            <BadgeVerificationIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert(
              "Verifications",
              "Tier 1 verified. Tier 2 pending documents.",
            ),
        },
        {
          id: "limits",
          label: "Account Limits",
          icon: (
            <BadgeVerificationIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert(
              "Account Limits",
              "Tier 1 Daily Limit: ₦50,000\nUpgrade to Tier 2 for ₦5,000,000 daily limit.",
            ),
        },
      ],
    },
    {
      title: "Security",
      items: [
        {
          id: "change-password",
          label: "Change Password",
          icon: (
            <AccountInfoCircleIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert("Change Password", "Password change feature is ready."),
        },
        {
          id: "2fa",
          label: "Two-Factor authentication",
          icon: (
            <BadgeVerificationIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert(
              "Two-Factor authentication",
              "Two-Factor authentication is active via SMS/Email OTP.",
            ),
        },
      ],
    },
    {
      title: "More",
      items: [
        {
          id: "contact-us",
          label: "Contact us",
          icon: (
            <AccountInfoCircleIcon width={22} height={22} color="#111827" />
          ),
          onPress: () =>
            Alert.alert(
              "Contact us",
              "Support team is available 24/7 at support@chipa.com",
            ),
        },
        {
          id: "logout",
          label: "Log out",
          icon: <RedLogoutIcon width={22} height={22} />,
          isDestructive: true,
          onPress: handleLogout,
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <TabHeader title="Account" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* ── User Profile Header ─────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between mb-5">
          {/* Left Column: Name, ID Pill & Tier Badge */}
          <View className="flex-1 mr-4">
            <Text className="font-satoshi text-[21px] font-bold text-gray-900 mb-2">
              {userName}
            </Text>

            <View className="flex-row items-center gap-2">
              {/* ID Pill with Copy Icon */}
              <Pressable
                onPress={handleCopyId}
                hitSlop={6}
                className="h-8 flex-row items-center gap-2 border border-gray-200 bg-white rounded-full px-3 py-1 active:bg-gray-50 shadow-2xs"
              >
                <Text className="font-sans text-sm font-medium text-black/50">
                  ID: <Text className="text-black/80">{accountId}</Text>
                </Text>
                <CopyIcon width={14} height={14} color="#9CA3AF" />
              </Pressable>

              {/* Tier 1 Badge */}
              <View className="relative flex-row items-center gap-1">
                <TierIcon width={68} />
                <View className="absolute left-2 top-1.5">
                  <View className="flex-row gap-3 items-center">
                    <Text className="font-bold text-black/70">1</Text>
                    <Text className="text-xs font-bold text-[#B45309]">
                      Tier 1
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Right Column: Profile Picture */}
          <View className="size-16 rounded-full overflow-hidden border border-gray-200">
            <Image
              source={require("@/assets/images/avatar_lottana.jpg")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>

        <View className="h-14 bg-[#FBF0E4] rounded-2xl px-4 flex-row items-center justify-between mb-7">
          <Text className="text-base font-medium text-black/70">
            Upgrade to Tier 2
          </Text>
          <Pressable
            onPress={handleUpgradeTier}
            className="bg-[#C66928] rounded-full px-5 py-2 active:opacity-90 shadow-2xs"
          >
            <Text className="text-sm font-bold text-white">Upgrade</Text>
          </Pressable>
        </View>

        {menuSections.map((section) => (
          <AccountMenuSection key={section.title} title={section.title}>
            {section.items.map((item) => (
              <AccountMenuRow
                key={item.id}
                label={item.label}
                icon={item.icon}
                onPress={item.onPress}
                isDestructive={item.isDestructive}
              />
            ))}
          </AccountMenuSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
