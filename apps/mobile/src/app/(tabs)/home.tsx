import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { BackArrowIcon, PlusIcon } from "@/components/ui/icons";
import { ChevronRightIcon } from "@/components/ui/icons/app-icons";
import { EyeClosedIcon } from "@/components/ui/icons/eye-closed-icon";
import { EyeIcon } from "@/components/ui/icons/eye-icon";
import { FancyBankIcon } from "@/components/ui/icons/fancy-bank-icon";
import { NotificationIcon } from "@/components/ui/icons/notification-icon";
import { TransferIcon } from "@/components/ui/icons/transfer-icon";
import { MoreOptionsDrawer } from "@/components/ui/bottom-sheets/more-options-drawer";
import { RecentConversionsDrawer } from "@/components/ui/bottom-sheets/recent-conversions-drawer";
import { SelectAccountDrawer } from "@/components/ui/bottom-sheets/select-account-drawer";
import {
  NigeriaRoundFlag,
  UKRoundFlag,
  USRoundFlag,
} from "@/components/ui/transaction-brand-logos";
import { TransferTypeDrawer } from "@/components/ui/bottom-sheets/transfer-type-drawer";
import { useAuth } from "@/context/auth-context";
import {
  type RecentConversion,
  useRecentConversions,
} from "@/context/recent-conversions-context";
import { ConvertIcon } from "@/components/ui/icons/convert-icon";
import { cn } from "@/lib/utils";
import { ElectricityIcon } from "@/components/ui/icons/electricity-icon";
import { TVIcon } from "@/components/ui/icons/tv-icon";
import { DataIcon } from "@/components/ui/icons/data-icon";
import { AirtimeIcon } from "@/components/ui/icons/airtime-icon";

// ─── Paper Airplane Icon for Transfer ───────────────────────────────────────
function PaperAirplaneIcon({ color = "#374151" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Sync Arrows Icon for Convert ───────────────────────────────────────────
function SyncArrowsIcon({ color = "#374151" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 7H8a4 4 0 00-4 4v1m0 0l3-3m-3 3l3 3M4 17h12a4 4 0 004-4v-1m0 0l-3 3m3-3l-3-3"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Up Arrow Icon for More ─────────────────────────────────────────────────
function UpArrowIcon({ color = "#374151" }: { color?: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 19V5M5 12l7-7 7 7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Soft Green Circular Arrow Down Icon for each row ───────────────────────
function SoftGreenArrowIcon({
  color = "#059669",
}: {
  color?: string;
} = {}) {
  return (
    <View className="w-10 h-10 rounded-full bg-[#E8F8F0] items-center justify-center mr-3 shrink-0">
      <BackArrowIcon
        width={16}
        height={16}
        strokeWidth={3}
        color={color}
        style={{ transform: [{ rotate: "-90deg" }] }}
      />
    </View>
  );
}

// ─── Currency Card Component ────────────────────────────────────────────────
function CurrencyCard({
  flag,
  currency,
  balance,
  active = false,
  onPress,
}: {
  flag: React.ReactNode;
  currency: string;
  balance: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 h-16 rounded-2xl flex-row items-center gap-2.5 border active:opacity-85 ${
        active
          ? "bg-[#FDEBD2] border-brand/20 shadow-2xs"
          : "bg-white border-gray-100"
      }`}
      style={{ minWidth: 132 }}
    >
      {flag}
      <View>
        <Text className="text-sm text-gray-700 font-medium">{currency}</Text>
        <Text className=" font-medium text-gray-900">{balance}</Text>
      </View>
    </Pressable>
  );
}

// ─── Floating Quick Action Button ───────────────────────────────────────────
function QuickAction({
  icon,
  label,
  onPress,
  accent = false,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2 active:opacity-70"
    >
      {accent ? (
        <View
          className={cn(
            "w-16 h-16 rounded-[24px] flex items-center justify-center bg-[#FBA130]/50 relative overflow-hidden shadow-2xs",
            className,
          )}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 5,
              bottom: 5,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
              backgroundColor: "#FDEBD2",
            }}
            className="items-center justify-center"
          ></View>
          {icon}
        </View>
      ) : (
        <View
          className={cn(
            "w-16 h-16 rounded-[20px] items-center justify-center shadow-2xs bg-[#E7E7E7]",
            className,
          )}
        >
          {icon}
        </View>
      )}
      <Text className="text-[12px] font-semibold text-gray-800 text-center">
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Service Item Button ─────────────────────────────────────────────────────
function ServiceItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2 active:opacity-70"
    >
      <View className="size-16 rounded-full bg-[#E6E6E6] items-center justify-center">
        {icon}
      </View>
      <Text className="text-sm font-medium text-gray-700 text-center">
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Action Link Component ───────────────────────────────────────────────────
interface ActionLinkProps {
  label: string;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  chevronColor?: string;
}

function ActionLink({
  label,
  onPress,
  className,
  textClassName,
  chevronColor,
}: ActionLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      className={cn(
        "flex-row items-center gap-0.5 active:opacity-70",
        className,
      )}
    >
      <Text className={cn("text-sm text-gray-700", textClassName)}>
        {label}
      </Text>
      <ChevronRightIcon
        className={cn("text-gray-700", textClassName)}
        color={chevronColor}
      />
    </Pressable>
  );
}

// ─── Home Header Component
function HomeHeader({
  accountNumber,
  onAddMoney,
}: {
  accountNumber?: string;
  onAddMoney: () => void;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center px-5 pt-3 pb-4 gap-2.5">
      {/* Avatar with photo or initials */}
      <Pressable
        onPress={() => router.push("/(tabs)/account" as any)}
        className="w-10 h-10 rounded-full bg-brand overflow-hidden border border-gray-200 items-center justify-center active:opacity-80"
      >
        <Image
          source={require("../../../assets/images/avatar_lottana.jpg")}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Pressable>

      {/* Account Number Pill (🏛 9031420494 >) */}
      <Pressable
        onPress={onAddMoney}
        className="flex-row items-center gap-1.5 bg-[#EBEBEE] rounded-lg px-2 py-1.5 active:bg-gray-200"
      >
        <FancyBankIcon width={16} height={16} />
        <Text className="text-sm font-medium text-gray-800">
          {accountNumber || "9031420494"}
        </Text>
        <ChevronRightIcon color="#9CA3AF" />
      </Pressable>

      <View className="flex-1" />

      {/* Notification bell with badge 2 */}
      <Pressable
        className="relative h-9 px-3 items-center justify-center active:opacity-70"
        onPress={() => router.push("/notifications" as any)}
      >
        <NotificationIcon className="text-gray-700" strokeWidth={1.5} />
        <View className="absolute top-0 right-2 min-w-4 h-4 px-1.5 rounded-full bg-[#EF4444] items-center justify-center">
          <Text className="text-[9px] font-bold text-white">2</Text>
        </View>
      </Pressable>

      {/* Earn badge */}
      <Pressable
        className="bg-brand rounded-lg h-8 px-3 items-center justify-center"
        onPress={() => router.push("/(tabs)/rewards" as any)}
      >
        <Text className="text-sm font-medium text-[#F7DCB5]">Earn $500</Text>
      </Pressable>
    </View>
  );
}

// ─── Balance Section Component (L310-L357) ──────────────────────────────────
function BalanceSection({
  currencySymbol = "₦",
  balanceHidden,
  onToggleBalance,
  onAddMoney,
}: {
  currencySymbol?: string;
  balanceHidden: boolean;
  onToggleBalance: () => void;
  onAddMoney: () => void;
}) {
  const router = useRouter();

  return (
    <View className="px-5 mb-4 gap-2.5">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={onToggleBalance} hitSlop={8}>
          <View className="flex-row items-center gap-2">
            <Text className="text-sm text-gray-800 font-medium">
              Total balance
            </Text>
            {balanceHidden ? (
              <EyeClosedIcon className="text-gray-800" />
            ) : (
              <EyeIcon className="text-gray-800" />
            )}
          </View>
        </Pressable>

        <ActionLink
          label="Transaction history"
          onPress={() => router.push("/transactions" as any)}
        />
      </View>

      {/* Balance Amount & + Add Money button on same row */}
      <View className="flex-row items-center justify-between">
        <Text className="font-satoshi text-2xl font-extrabold text-gray-900 ">
          {balanceHidden
            ? `${currencySymbol} • • • • • •`
            : `${currencySymbol}2,800.00`}
        </Text>

        <Pressable
          onPress={onAddMoney}
          className="flex-row items-center gap-1.5 bg-black rounded-full px-4 py-2.5 active:bg-gray-800 shadow-2xs"
        >
          <PlusIcon width={14} height={14} color="#fff" />
          <Text className="text-xs font-bold text-white">Add Money</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Horizontal Currency Cards Section (L359-L387) ──────────────────────────
function CurrencyCardsSection({
  selectedCurrency,
  onSelectCurrency,
}: {
  selectedCurrency: "NGN" | "USD" | "GBP";
  onSelectCurrency: (currency: "NGN" | "USD" | "GBP") => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 4 }}
      className="mb-5"
    >
      <View className="flex flex-row gap-3">
        <CurrencyCard
          flag={<NigeriaRoundFlag size={26} />}
          currency="NGN"
          balance="202,800.00"
          active={selectedCurrency === "NGN"}
          onPress={() => onSelectCurrency("NGN")}
        />
        <CurrencyCard
          flag={<USRoundFlag size={26} />}
          currency="USD"
          balance="0.00"
          active={selectedCurrency === "USD"}
          onPress={() => onSelectCurrency("USD")}
        />
        <CurrencyCard
          flag={<UKRoundFlag size={26} />}
          currency="GBP"
          balance="45.00"
          active={selectedCurrency === "GBP"}
          onPress={() => onSelectCurrency("GBP")}
        />
      </View>
    </ScrollView>
  );
}

// ─── Transaction Card Component ─────────────────────────────────────────────
interface TransactionCardProps {
  title: string;
  date: string;
  amount: string;
  isCredit?: boolean;
  icon?: React.ReactNode;
  onPress?: () => void;
}

function TransactionCard({
  title,
  date,
  amount,
  isCredit,
  icon = <SoftGreenArrowIcon />,
  onPress,
}: TransactionCardProps) {
  const router = useRouter();
  const credit = isCredit ?? amount.trim().startsWith("+");

  return (
    <Pressable
      onPress={onPress ?? (() => router.push("/transactions" as any))}
      className="h-16 flex-row items-center justify-between active:opacity-70"
    >
      <View className="flex-row flex-1 mr-3">
        {icon}
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-[14px] font-medium text-gray-900"
          >
            {title}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">{date}</Text>
        </View>
      </View>
      <Text
        className={`text-[14px] font-bold ${
          credit ? "text-[#10B981]" : "text-gray-900"
        }`}
      >
        {amount}
      </Text>
    </Pressable>
  );
}

// ─── Recent Transactions Card Section ───────────────────────────────────────
interface RecentTransactionsCardProps {
  children?: React.ReactNode;
  transactions?: TransactionCardProps[];
}

function RecentTransactionsCard({
  children,
  transactions,
}: RecentTransactionsCardProps = {}) {
  return (
    <View className="mx-5 bg-white rounded-2xl border border-gray-100 px-4 py-1 mb-6 shadow-2xs">
      {children ? (
        children
      ) : transactions && transactions.length > 0 ? (
        transactions.map((tx, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <View className="h-px bg-gray-100 my-2" />}
            <TransactionCard {...tx} />
          </React.Fragment>
        ))
      ) : (
        <>
          {/* Row 1: Mathew Ikechukwu */}
          <TransactionCard
            title="Transfer from Mathew Ikechuk..."
            date="Feb 28, 2026"
            amount="+₦5,245.83"
            isCredit
          />

          {/* Row 2: Uche Eze */}
          <TransactionCard
            title="Transfer to Uche Eze"
            date="Feb 28, 2026"
            amount="₦5,245.83"
          />
        </>
      )}
    </View>
  );
}

// ─── Floating Quick Actions Section (L443-L474) ─────────────────────────────
function QuickActionsSection({
  onAddMoney,
  onTransfer,
  onConvert,
  onMore,
}: {
  onAddMoney: () => void;
  onTransfer: () => void;
  onConvert: () => void;
  onMore: () => void;
}) {
  return (
    <View className="flex-row justify-between px-2 mb-6">
      <QuickAction
        accent
        icon={<PlusIcon width={28} height={28} />}
        label="Top up"
        onPress={onAddMoney}
      />
      <QuickAction
        icon={<TransferIcon width={28} height={28} />}
        label="Transfer"
        onPress={onTransfer}
      />
      <QuickAction
        icon={<ConvertIcon width={28} height={28} />}
        label="Convert"
        onPress={onConvert}
      />
      <QuickAction
        icon={
          <BackArrowIcon
            width={28}
            height={28}
            strokeWidth={1.5}
            style={{ transform: [{ rotate: "90deg" }] }}
          />
        }
        label="More"
        onPress={onMore}
      />
    </View>
  );
}

// ─── Services Section Component (L477-L514) ─────────────────────────────────
function ServicesSection() {
  const router = useRouter();

  return (
    <View className="mx-5 bg-white rounded-2xl border border-gray-100 pt-4 pb-5 shadow-2xs">
      <View className="px-4 flex-row items-center justify-between mb-4">
        <Text className="font-satoshi text-base font-extrabold text-gray-900">
          Services
        </Text>
        <ActionLink
          label="See all"
          onPress={() => Alert.alert("Services", "All services coming soon!")}
        />
      </View>
      <View className="flex-row justify-between">
        <ServiceItem
          icon={<AirtimeIcon color="#6B7280" />}
          label="Airtime"
          onPress={() => router.push("/airtime" as any)}
        />
        <ServiceItem
          icon={<DataIcon color="#3B82F6" />}
          label="Data"
          onPress={() => router.push("/data" as any)}
        />
        <ServiceItem
          icon={<TVIcon color="#8B5CF6" />}
          label="TV"
          onPress={() => router.push("/tv" as any)}
        />
        <ServiceItem
          icon={<ElectricityIcon color="#FDBE4E" />}
          label="Electricity"
          onPress={() => router.push("/electricity" as any)}
        />
      </View>
    </View>
  );
}

// ─── Home Screen ────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [balanceHidden, setBalanceHidden] = useState(false);

  const [selectedCurrency, setSelectedCurrency] = useState<
    "NGN" | "USD" | "GBP"
  >("NGN");
  const [isTransferTypeDrawerVisible, setIsTransferTypeDrawerVisible] =
    useState(false);
  const [isMoreDrawerVisible, setIsMoreDrawerVisible] = useState(false);
  const [isSelectAccountDrawerVisible, setIsSelectAccountDrawerVisible] =
    useState(false);
  const [
    isRecentConversionsDrawerVisible,
    setIsRecentConversionsDrawerVisible,
  ] = useState(false);

  const { recentConversions } = useRecentConversions();

  if (!user) return null;

  const handleConvertPress = () => {
    if (recentConversions && recentConversions.length > 0) {
      setIsRecentConversionsDrawerVisible(true);
    } else {
      router.push("/convert" as any);
    }
  };

  const handleSelectRecentConversion = (item: RecentConversion) => {
    setIsRecentConversionsDrawerVisible(false);
    router.push({
      pathname: "/convert" as any,
      params: {
        from: item.from,
        to: item.displayTo || item.to,
      },
    });
  };

  const handleNewConversion = () => {
    setIsRecentConversionsDrawerVisible(false);
    router.push("/convert" as any);
  };

  const handleAddMoney = () => {
    router.push({
      pathname: "/add-money" as any,
      params: {
        currency: selectedCurrency,
      },
    });
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F8F8FB]"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header Row */}
        <HomeHeader
          accountNumber={user.accountNumber}
          onAddMoney={handleAddMoney}
        />

        {/* Balance Section */}
        <BalanceSection
          currencySymbol={user.totalBalanceCurrency}
          balanceHidden={balanceHidden}
          onToggleBalance={() => setBalanceHidden((p) => !p)}
          onAddMoney={handleAddMoney}
        />

        {/* Horizontal Currency Cards */}
        <CurrencyCardsSection
          selectedCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
        />

        {/* Recent Transactions Card */}
        <RecentTransactionsCard />

        {/* Floating Quick Actions */}
        <QuickActionsSection
          onAddMoney={() => setIsSelectAccountDrawerVisible(true)}
          onTransfer={() => setIsTransferTypeDrawerVisible(true)}
          onConvert={handleConvertPress}
          onMore={() => setIsMoreDrawerVisible(true)}
        />

        {/* Services Section */}
        <ServicesSection />
      </ScrollView>

      {/* ── Transfer Destination Type Drawer ─────────────────────────────── */}
      <TransferTypeDrawer
        visible={isTransferTypeDrawerVisible}
        onClose={() => setIsTransferTypeDrawerVisible(false)}
        onSelectBank={() => router.push("/transfer" as any)}
        onSelectChipa={() => router.push("/transfer-chipa" as any)}
      />

      {/* ── More Options Drawer ───────────────────────────────────────────── */}
      <MoreOptionsDrawer
        visible={isMoreDrawerVisible}
        onClose={() => setIsMoreDrawerVisible(false)}
      />

      {/* ── Select Account Drawer ────────────────────────────────────────── */}
      <SelectAccountDrawer
        visible={isSelectAccountDrawerVisible}
        onClose={() => setIsSelectAccountDrawerVisible(false)}
        userAccountNumber={user.accountNumber || "9031420494"}
      />

      {/* ── Recent Conversions Drawer ─────────────────────────────────────── */}
      <RecentConversionsDrawer
        visible={isRecentConversionsDrawerVisible}
        onClose={() => setIsRecentConversionsDrawerVisible(false)}
        recentConversions={recentConversions}
        onSelect={handleSelectRecentConversion}
        onNew={handleNewConversion}
      />
    </SafeAreaView>
  );
}
