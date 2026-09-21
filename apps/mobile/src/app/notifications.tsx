import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { CHPIcon } from '@/components/ui/icons/currencies';

interface NotificationItem {
  id: string;
  title: string;
  date: string;
  shortBody: string;
  fullBody: string;
  isUnread: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'Bank transfer in your name',
    date: 'Mar 4, 2026',
    shortBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira...",
    fullBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira bank transfers. All virtual accounts have been upgraded to provide instant deposits, improved delivery guarantees, and zero downtime across banking networks. If you experience any delays, our 24/7 support is here to help.",
    isUnread: true,
  },
  {
    id: 'notif_2',
    title: 'Chipa',
    date: 'Mar 4, 2026',
    shortBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira...",
    fullBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira accounts and new multi-currency perks. You can now earn up to 15% APY on dollar balances with Chipa Yield. Check your rewards tab for more details.",
    isUnread: false,
  },
  {
    id: 'notif_3',
    title: "We're back on X! 🎉",
    date: 'Mar 4, 2026',
    shortBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira...",
    fullBody:
      "Dear customer, we're reaching out to inform you of a new change to Naira updates and official news. Follow our official X account @ChipaApp to stay updated on product launches, community giveaways, and engineering updates!",
    isUnread: false,
  },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    // Auto mark as read on interaction
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isUnread: false } : item))
    );
  };

  const hasUnread = notifications.some((n) => n.isUnread);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* ── Top Bar: Back Arrow & Centered Title with Red Dot ─────────────── */}
      <View className="relative flex-row items-center justify-center px-5 py-3.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="absolute left-5 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10">
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>

        <View className="flex-row items-center gap-1.5">
          <Text className="font-satoshi text-base font-bold text-gray-900">
            Notifications
          </Text>
          {hasUnread && (
            <View className="w-2 h-2 rounded-full bg-[#EF4444]" />
          )}
        </View>
      </View>

      {/* ── Notifications List ───────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}>
        {notifications.map((item) => {
          const isExpanded = !!expandedIds[item.id];

          return (
            <Pressable
              key={item.id}
              onPress={() => toggleExpand(item.id)}
              className={`px-5 py-4 flex-row items-start ${
                item.isUnread ? 'bg-[#FFF0F0]' : 'bg-white'
              }`}>
              {/* Avatar: Black circular badge with Chipa Donut Logo */}
              <View className="mr-3 shrink-0 mt-0.5">
                <CHPIcon size={40} />
              </View>

              {/* Text content */}
              <View className="flex-1">
                {/* Header Row: Title and Date */}
                <View className="flex-row items-center justify-between">
                  <Text
                    numberOfLines={1}
                    className="font-satoshi text-base font-bold text-gray-900 flex-1 mr-2">
                    {item.title}
                  </Text>
                  <Text className="font-sans text-xs text-gray-400 font-medium shrink-0">
                    {item.date}
                  </Text>
                </View>

                {/* Body Message */}
                <Text className="font-sans text-sm text-gray-600 mt-1 leading-5">
                  {isExpanded ? item.fullBody : item.shortBody}
                </Text>

                {/* "See more" / "See less" Link */}
                <Pressable
                  onPress={() => toggleExpand(item.id)}
                  hitSlop={6}
                  className="self-start mt-1.5 active:opacity-70">
                  <Text className="font-sans text-sm font-semibold text-[#60A5FA]">
                    {isExpanded ? 'See less' : 'See more'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
