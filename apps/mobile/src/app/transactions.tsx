import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import {
  NigeriaRoundFlag,
  USRoundFlag,
} from '@/components/ui/transaction-brand-logos';
import { TransactionDetailVariant } from './transaction-details';

// ─── Target Coin Icon for "All Transactions" Pill ────────────────────────────
function CoinTargetIcon() {
  return (
    <View className="w-8 h-8 rounded-full bg-black items-center justify-center">
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke="#F59E0B" strokeWidth={3} />
        <Circle cx={12} cy={12} r={3.5} fill="#F59E0B" />
      </Svg>
    </View>
  );
}

// ─── Soft Green Circular Arrow Down Icon for each row ───────────────────────
function SoftGreenArrowIcon() {
  return (
    <View className="w-10 h-10 rounded-full bg-[#E8F8F0] items-center justify-center mr-3 shrink-0">
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 4v16M12 20l-5-5M12 20l5-5"
          stroke="#059669"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

interface TransactionData {
  id: string;
  title: string;
  date: string;
  amountDisplay: string;
  isCredit: boolean;
  variant: TransactionDetailVariant;
  heroAmount: string;
  recipientName?: string;
  bankName?: string;
  accountNumber?: string;
  transferFee?: string;
  remark?: string;
  transactionId: string;
  sessionId?: string;
  transactionDate?: string;
  statusDate?: string;
  fromAmount?: string;
  toAmount?: string;
  exchangeRate?: string;
  network?: string;
}

const SEP_TRANSACTIONS: TransactionData[] = [
  {
    id: 'tx_1',
    title: 'Daniel Chukwu',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '₦5,245.83',
    isCredit: true,
    variant: 'incoming_transfer',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transferFee: '₦20.00',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_2',
    title: 'Transfer to Chidebere',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '₦5,245.83',
    isCredit: false,
    variant: 'outgoing_transfer',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transferFee: '₦20.00',
    remark: '"Use this one flex"',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_3',
    title: 'Stamp Duty',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,245.83',
    isCredit: false,
    variant: 'stamp_duty',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_4',
    title: 'Data: MTN',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,245.83',
    isCredit: false,
    variant: 'data',
    heroAmount: '₦5,000.00',
    network: 'mtn',
    transactionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_5',
    title: 'Airtime: MTN',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,245.83',
    isCredit: false,
    variant: 'airtime',
    heroAmount: '₦5,000.00',
    network: 'mtn',
    transactionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_6',
    title: 'NGN to USD',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,245.83',
    isCredit: false,
    variant: 'conversion',
    heroAmount: '$5.42',
    fromAmount: '₦8,000.00',
    toAmount: '$5.42',
    exchangeRate: '₦1,415.00 = $1.00',
    transactionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_7',
    title: 'TV: DStv',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,000.00',
    isCredit: false,
    variant: 'tv',
    heroAmount: '₦5,000.00',
    transactionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
  {
    id: 'tx_8',
    title: 'Electricity: EEDC',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,000.00',
    isCredit: false,
    variant: 'electricity',
    heroAmount: '₦5,000.00',
    transactionId: '260912020100964271663837',
    transactionDate: 'Sept 12, 2025 · 9:56 PM',
    statusDate: 'Sep 12, 9:56 PM',
  },
];

const AUG_TRANSACTIONS: TransactionData[] = [
  {
    id: 'tx_9',
    title: 'Daniel Chukwu',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '₦5,245.83',
    isCredit: true,
    variant: 'incoming_transfer',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transferFee: '₦20.00',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Aug 28, 2025 · 9:56 PM',
    statusDate: 'Aug 28, 9:56 PM',
  },
  {
    id: 'tx_10',
    title: 'Daniel Chukwu',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '₦5,245.83',
    isCredit: true,
    variant: 'incoming_transfer',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transferFee: '₦20.00',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Aug 28, 2025 · 9:56 PM',
    statusDate: 'Aug 28, 9:56 PM',
  },
  {
    id: 'tx_11',
    title: 'Stamp Duty',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '-₦5,245.83',
    isCredit: false,
    variant: 'stamp_duty',
    heroAmount: '₦501,890.98',
    recipientName: 'DANIEL CHINONSO CHUKWU',
    bankName: 'Kredi money Microfinance Bank',
    accountNumber: '1802009708',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Aug 28, 2025 · 9:56 PM',
    statusDate: 'Aug 28, 9:56 PM',
  },
  {
    id: 'tx_12',
    title: 'Daily Interest Earnings',
    date: 'Feb 28, 9:56 PM',
    amountDisplay: '₦101.45',
    isCredit: true,
    variant: 'incoming_transfer',
    heroAmount: '₦101.45',
    recipientName: 'Interest Savings Account',
    bankName: 'Chipa High Yield Savings',
    accountNumber: '1802009708',
    transactionId: '260912020100964271663837',
    sessionId: '260912020100964271663837',
    transactionDate: 'Aug 28, 2025 · 9:56 PM',
    statusDate: 'Aug 28, 9:56 PM',
  },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<'all' | 'ngn' | 'usd'>('all');

  const handleTransactionPress = (tx: TransactionData) => {
    router.push({
      pathname: '/transaction-details' as any,
      params: {
        variant: tx.variant,
        type: tx.variant,
        heroAmount: tx.heroAmount,
        title: tx.title,
        recipientName: tx.recipientName,
        bankName: tx.bankName,
        accountNumber: tx.accountNumber,
        transferFee: tx.transferFee,
        remark: tx.remark,
        transactionId: tx.transactionId,
        sessionId: tx.sessionId,
        date: tx.transactionDate,
        statusDate: tx.statusDate,
        fromAmount: tx.fromAmount,
        toAmount: tx.toAmount,
        exchangeRate: tx.exchangeRate,
        network: tx.network,
      },
    });
  };

  const filteredSep =
    activeFilter === 'usd'
      ? SEP_TRANSACTIONS.filter((t) => t.variant === 'conversion')
      : activeFilter === 'ngn'
      ? SEP_TRANSACTIONS.filter((t) => t.variant !== 'conversion')
      : SEP_TRANSACTIONS;

  const filteredAug =
    activeFilter === 'usd'
      ? AUG_TRANSACTIONS.filter((t) => t.variant === 'conversion')
      : activeFilter === 'ngn'
      ? AUG_TRANSACTIONS.filter((t) => t.variant !== 'conversion')
      : AUG_TRANSACTIONS;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* ── Top Bar: Back Arrow & Title ──────────────────────────────────── */}
      <View className="relative flex-row items-center justify-center px-5 py-3.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="absolute left-5 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100 z-10">
          <BackArrowIcon width={22} height={22} color="#111827" />
        </Pressable>
        <Text className="font-satoshi text-base font-bold text-gray-900">
          Transactions
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 14,
          paddingBottom: insets.bottom + 24,
        }}>
        {/* ── Horizontal Filter Pills matching Screenshot 1 ────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          className="mb-6">
          {/* Pill 1: All Transactions */}
          <Pressable
            onPress={() => setActiveFilter('all')}
            className={`flex-row items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border active:opacity-85 ${
              activeFilter === 'all'
                ? 'bg-[#FDEBD2] border-[#F59E0B]/30 shadow-2xs'
                : 'bg-white border-gray-100'
            }`}>
            <CoinTargetIcon />
            <View>
              <Text className="font-sans text-[11px] text-gray-600 font-medium">
                All
              </Text>
              <Text className="font-satoshi text-xs font-bold text-gray-900">
                Transactions
              </Text>
            </View>
          </Pressable>

          {/* Pill 2: NGN */}
          <Pressable
            onPress={() => setActiveFilter('ngn')}
            className={`flex-row items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border active:opacity-85 ${
              activeFilter === 'ngn'
                ? 'bg-[#FDEBD2] border-[#F59E0B]/30 shadow-2xs'
                : 'bg-white border-gray-100'
            }`}>
            <NigeriaRoundFlag size={28} />
            <View>
              <Text className="font-sans text-[11px] text-gray-500 font-medium">
                NGN
              </Text>
              <Text className="font-satoshi text-xs font-bold text-gray-900">
                202,800.00
              </Text>
            </View>
          </Pressable>

          {/* Pill 3: USD */}
          <Pressable
            onPress={() => setActiveFilter('usd')}
            className={`flex-row items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border active:opacity-85 ${
              activeFilter === 'usd'
                ? 'bg-[#FDEBD2] border-[#F59E0B]/30 shadow-2xs'
                : 'bg-white border-gray-100'
            }`}>
            <USRoundFlag size={28} />
            <View>
              <Text className="font-sans text-[11px] text-gray-500 font-medium">
                USD
              </Text>
              <Text className="font-satoshi text-xs font-bold text-gray-900">
                0.00
              </Text>
            </View>
          </Pressable>
        </ScrollView>

        {/* ── Section 1: Sep 2026 ─────────────────────────────────────────── */}
        <View className="px-5 mb-8">
          {/* Section Header: Month & Money In/Out */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="font-satoshi text-xl font-extrabold text-gray-900">
              Sep 2026
            </Text>
            <View className="flex-row items-center gap-4">
              <View className="items-end">
                <Text className="font-sans text-[11px] text-gray-400 font-medium">
                  Money in
                </Text>
                <Text className="font-satoshi text-xs font-bold text-[#10B981]">
                  ₦501,890.98
                </Text>
              </View>
              <View className="items-end">
                <Text className="font-sans text-[11px] text-gray-400 font-medium">
                  Money out
                </Text>
                <Text className="font-satoshi text-xs font-bold text-[#EF4444]">
                  -₦73,501,890.98
                </Text>
              </View>
            </View>
          </View>

          {/* Items List */}
          <View className="gap-3.5">
            {filteredSep.map((tx) => (
              <Pressable
                key={tx.id}
                onPress={() => handleTransactionPress(tx)}
                className="flex-row items-center justify-between py-1.5 active:opacity-60">
                <View className="flex-row items-center flex-1 mr-3">
                  <SoftGreenArrowIcon />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-satoshi text-base font-bold text-gray-900">
                      {tx.title}
                    </Text>
                    <Text className="font-sans text-xs text-gray-400 mt-0.5">
                      {tx.date}
                    </Text>
                  </View>
                </View>

                <Text
                  className={`font-satoshi text-base font-bold ${
                    tx.isCredit ? 'text-[#10B981]' : 'text-gray-900'
                  }`}>
                  {tx.amountDisplay}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Section 2: Aug 2026 ─────────────────────────────────────────── */}
        {filteredAug.length > 0 && (
          <View className="px-5 mb-6">
            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="font-satoshi text-xl font-extrabold text-gray-900">
                Aug 2026
              </Text>
              <View className="flex-row items-center gap-4">
                <View className="items-end">
                  <Text className="font-sans text-[11px] text-gray-400 font-medium">
                    Money in
                  </Text>
                  <Text className="font-satoshi text-xs font-bold text-[#10B981]">
                    ₦501,890.98
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-sans text-[11px] text-gray-400 font-medium">
                    Money out
                  </Text>
                  <Text className="font-satoshi text-xs font-bold text-[#EF4444]">
                    -₦73,501,890.98
                  </Text>
                </View>
              </View>
            </View>

            {/* Items List */}
            <View className="gap-3.5">
              {filteredAug.map((tx) => (
              <Pressable
                key={tx.id}
                onPress={() => handleTransactionPress(tx)}
                className="flex-row items-center justify-between py-1.5 active:opacity-60">
                <View className="flex-row items-center flex-1 mr-3">
                  <SoftGreenArrowIcon />
                  <View className="flex-1">
                    <Text
                      numberOfLines={1}
                      className="font-satoshi text-base font-bold text-gray-900">
                      {tx.title}
                    </Text>
                    <Text className="font-sans text-xs text-gray-400 mt-0.5">
                      {tx.date}
                    </Text>
                  </View>
                </View>

                <Text
                  className={`font-satoshi text-base font-bold ${
                    tx.isCredit ? 'text-[#10B981]' : 'text-gray-900'
                  }`}>
                  {tx.amountDisplay}
                </Text>
              </Pressable>
            ))}
          </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
