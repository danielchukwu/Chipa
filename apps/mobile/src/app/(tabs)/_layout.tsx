import { Tabs } from "expo-router";
import React from "react";
import { Platform, Text, View } from "react-native";

import { CardsIcon } from "@/components/ui/icons/navbar/card-icon";
import { HomeIcon } from "@/components/ui/icons/navbar/home-icon";
import { PointsIcon } from "@/components/ui/icons/navbar/points-icon";
import { ProfileIcon } from "@/components/ui/icons/navbar/profile-icon";
import { RewardsIcon } from "@/components/ui/icons/navbar/rewards-icon";

// ─── Colours ─────────────────────────────────────────────────────────────────
const ACTIVE_COLOR = "#111827";
const INACTIVE_COLOR = "#9CA3AF";
const TAB_BAR_BG = "#FFFFFF";

// ─── Custom tab-bar label ─────────────────────────────────────────────────────
function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="clip"
      allowFontScaling={false}
      style={{
        fontFamily: "Inter",
        fontSize: 10,
        fontWeight: focused ? "700" : "500",
        color: focused ? ACTIVE_COLOR : INACTIVE_COLOR,
        marginTop: 2,
        textAlign: "center",
        flexShrink: 0,
        ...(Platform.OS === "web" ? ({ whiteSpace: "nowrap" } as any) : {}),
      }}
    >
      {label}
    </Text>
  );
}

// ─── Custom tab icon wrapper ──────────────────────────────────────────────────
function TabIcon({
  icon,
  solidIcon,
  label,
  focused,
}: {
  icon: React.ReactNode;
  solidIcon: React.ReactNode;
  label: string;
  focused: boolean;
}) {
  return (
    <View
      className="items-center justify-center min-w-[52px]"
      style={{ marginTop: 6 }}
    >
      {focused ? solidIcon : icon}
      <TabLabel label={label} focused={focused} />
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BG,
          borderTopColor: "#F3F4F6",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 64,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          paddingTop: 4,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Home"
              focused={focused}
              icon={<HomeIcon width={24} height={24} color={INACTIVE_COLOR} />}
              solidIcon={
                <HomeIcon width={24} height={24} color={ACTIVE_COLOR} />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="points"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Points"
              focused={focused}
              icon={
                <PointsIcon width={24} height={24} color={INACTIVE_COLOR} />
              }
              solidIcon={
                <PointsIcon width={24} height={24} color={ACTIVE_COLOR} />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="rewards"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Rewards"
              focused={focused}
              icon={
                <RewardsIcon width={24} height={24} color={INACTIVE_COLOR} />
              }
              solidIcon={
                <RewardsIcon width={24} height={24} color={ACTIVE_COLOR} />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cards"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Cards"
              focused={focused}
              icon={<CardsIcon width={24} height={24} color={INACTIVE_COLOR} />}
              solidIcon={
                <CardsIcon width={24} height={24} color={ACTIVE_COLOR} />
              }
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Account"
              focused={focused}
              icon={
                <ProfileIcon width={24} height={24} color={INACTIVE_COLOR} />
              }
              solidIcon={
                <ProfileIcon width={24} height={24} color={ACTIVE_COLOR} />
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}
