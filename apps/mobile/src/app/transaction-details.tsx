import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { CopyIcon } from '@/components/ui/icons/copy-icon';
import { TelcoLogo, TelcoProvider } from '@/components/ui/telco-logo';
import {
  DiscoElectricityLogo,
  DStvLogo,
  GTBankLogo,
  NigeriaRoundFlag,
  USRoundFlag,
} from '@/components/ui/transaction-brand-logos';

export type TransactionDetailVariant =
  | 'outgoing_transfer'
  | 'incoming_transfer'
  | 'stamp_duty'
  | 'conversion'
  | 'tv'
  | 'electricity'
  | 'airtime'
  | 'data';

function FormattedHeroAmount({ amount }: { amount: string }) {
  const dotIndex = amount.lastIndexOf('.');
  if (dotIndex !== -1) {
    const main = amount.slice(0, dotIndex);
    const decimal = amount.slice(dotIndex);
    return (
      <Text className="font-satoshi text-[34px] font-extrabold text-gray-900 mt-3 mb-5 tracking-tight text-center">
        {main}
        <Text className="text-[20px] font-bold text-gray-900">{decimal}</Text>
      </Text>
    );
  }
  return (
    <Text className="font-satoshi text-[34px] font-extrabold text-gray-900 mt-3 mb-5 tracking-tight text-center">
      {amount}
    </Text>
  );
}

export default function TransactionDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    type?: string;
    variant?: TransactionDetailVariant;
    amount?: string;
    heroAmount?: string;
    title?: string;
    recipientName?: string;
    bankName?: string;
    accountNumber?: string;
    transferFee?: string;
    remark?: string;
    transactionId?: string;
    sessionId?: string;
    date?: string;
    statusDate?: string;
    fromAmount?: string;
    toAmount?: string;
    exchangeRate?: string;
    network?: string;
    transactionType?: string;
    amountPaid?: string;
  }>();

  // Normalize variant from params
  const rawType = (params.variant || params.type || 'airtime').toLowerCase();
  const variant: TransactionDetailVariant =
    rawType === 'outgoing_transfer' || rawType === 'transfer'
      ? 'outgoing_transfer'
      : rawType === 'incoming_transfer'
      ? 'incoming_transfer'
      : rawType === 'stamp_duty'
      ? 'stamp_duty'
      : rawType === 'conversion' || rawType === 'convert'
      ? 'conversion'
      : rawType === 'tv'
      ? 'tv'
      : rawType === 'electricity'
      ? 'electricity'
      : rawType === 'data'
      ? 'data'
      : 'airtime';

  // Fallbacks matching Screenshots 2 & 3
  const heroAmount =
    params.heroAmount ||
    params.amount ||
    (variant === 'conversion'
      ? '$5.42'
      : variant === 'tv' || variant === 'electricity'
      ? '₦5,000.00'
      : '₦501,890.98');
  const recipientName = params.recipientName || 'DANIEL CHINONSO CHUKWU';
  const bankName = params.bankName || 'Kredi money Microfinance Bank';
  const accountNumber = params.accountNumber || '1802009708';
  const transferFee = params.transferFee || '₦20.00';
  const remark = params.remark || '"Use this one flex"';
  const transactionId = params.transactionId || '260912020100964271663837';
  const sessionId = params.sessionId || '260912020100964271663837';
  const transactionDate = params.date || 'Sept 12, 2025 · 9:56 PM';
  const statusDate = params.statusDate || 'Sep 12, 9:56 PM';
  const network = (params.network || 'mtn').toLowerCase() as TelcoProvider;
  const transactionType =
    params.transactionType || (variant === 'tv' || variant === 'electricity' ? 'Airtime' : 'Airtime');
  const amountPaid = params.amountPaid || '₦4,990.00';

  const handleCopy = (label: string, text: string) => {
    Alert.alert('Copied', `${label} ${text} copied to clipboard.`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Chipa Transaction Receipt\nAmount: ${heroAmount}\nType: ${variant}\nID: ${transactionId}\nDate: ${transactionDate}`,
      });
    } catch {
      Alert.alert('Share', 'Unable to share receipt at this time.');
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      `Need help with transaction ${transactionId}? Our customer support team is ready to assist.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Support',
          onPress: () => Alert.alert('Support', 'Ticket submitted to support@chipa.com'),
        },
      ]
    );
  };

  // Status title for single-status layout
  const statusTitle =
    variant === 'incoming_transfer'
      ? 'Transfer Recieved'
      : variant === 'stamp_duty'
      ? 'Stamp Duty'
      : variant === 'conversion'
      ? 'NGN to USD'
      : variant === 'tv'
      ? 'TV'
      : variant === 'electricity'
      ? 'Electricity'
      : variant === 'data'
      ? 'Data: MTN'
      : 'Airtime';

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
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}>
        <View>
          {/* ══════════════════════════════════════════════════════════════════
              HERO SECTION (Icon + Amount + Stepper/Status)
             ══════════════════════════════════════════════════════════════════ */}
          <View className="items-center">
            {/* 1. Variant Logo */}
            {variant === 'outgoing_transfer' && <GTBankLogo size={46} />}
            {variant === 'incoming_transfer' && <NigeriaRoundFlag size={46} />}
            {variant === 'stamp_duty' && <NigeriaRoundFlag size={46} />}
            {variant === 'conversion' && <USRoundFlag size={46} />}
            {variant === 'tv' && <DStvLogo size={46} />}
            {variant === 'electricity' && <DiscoElectricityLogo size={46} />}
            {(variant === 'airtime' || variant === 'data') && (
              <TelcoLogo provider={network} size={46} />
            )}

            {/* 2. Big Hero Amount with smaller decimals */}
            <FormattedHeroAmount amount={variant === 'conversion' ? '$5.42' : heroAmount} />

            {/* 3. Status Display / Stepper */}
            {variant === 'outgoing_transfer' ? (
              /* Outgoing Stepper (Screenshot 2 Left) */
              <View className="w-full px-2 mb-1">
                {/* Step 1: Initiated */}
                <View className="flex-row items-start">
                  <View className="w-4 items-center mr-3 pt-0.5">
                    <View className="w-3 h-3 rounded-full bg-gray-300" />
                    <View className="w-0.5 h-6 bg-gray-200 mt-1" />
                  </View>
                  <View className="flex-1 -mt-0.5">
                    <Text className="font-satoshi text-sm font-bold text-gray-900">
                      Transfer to {params.title || 'Daniel Chukwu'}
                    </Text>
                    <Text className="font-sans text-xs text-gray-400 mt-0.5">
                      {statusDate}
                    </Text>
                  </View>
                </View>

                {/* Step 2: Sent */}
                <View className="flex-row items-start">
                  <View className="w-4 items-center mr-3 pt-0.5">
                    <View className="w-4 h-4 rounded-full bg-[#10B981] items-center justify-center">
                      <Text className="text-white text-[9px] font-bold leading-none">✓</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="font-satoshi text-sm font-bold text-gray-900">
                      Sent
                    </Text>
                    <Text className="font-sans text-xs text-gray-400 mt-0.5">
                      {statusDate}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Single Status Line with Green Checkmark */
              <View className="w-full px-2 mb-1">
                <View className="flex-row items-start">
                  <View className="w-4 items-center mr-3 pt-0.5">
                    <View className="w-4 h-4 rounded-full bg-[#10B981] items-center justify-center">
                      <Text className="text-white text-[9px] font-bold leading-none">✓</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="font-satoshi text-sm font-bold text-gray-900">
                      {statusTitle}
                    </Text>
                    <Text className="font-sans text-xs text-gray-400 mt-0.5">
                      {statusDate}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ══════════════════════════════════════════════════════════════════
              DETAILS CARD (Screenshot 2 & 3 variants)
             ══════════════════════════════════════════════════════════════════ */}
          <View className="bg-[#F9FAFB] rounded-[28px] p-5 mt-6 border border-gray-100 shadow-2xs gap-4">
            {/* VARIANT 4: CONVERSION (Screenshot 3 Left) */}
            {variant === 'conversion' && (
              <>
                {/* From / To Conversion Row */}
                <View className="flex-row items-center justify-between pb-3 border-b border-gray-100">
                  <View>
                    <Text className="font-sans text-xs text-gray-400 mb-1">From</Text>
                    <Text className="font-satoshi text-base font-bold text-gray-900">
                      🇳🇬 ₦8,000.00
                    </Text>
                  </View>

                  <Text className="text-gray-400 font-bold text-lg">→</Text>

                  <View className="items-end">
                    <Text className="font-sans text-xs text-gray-400 mb-1">To</Text>
                    <Text className="font-satoshi text-base font-bold text-[#16A34A]">
                      🇺🇸 $5.42
                    </Text>
                  </View>
                </View>

                {/* Exchange rate */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Exchange rate
                  </Text>
                  <Text className="font-satoshi text-sm font-bold text-gray-900">
                    ₦1,415.00 = $1.00
                  </Text>
                </View>

                {/* Transaction ID */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction ID
                  </Text>
                  <Pressable
                    onPress={() => handleCopy('Transaction ID', transactionId)}
                    hitSlop={6}
                    className="flex-row items-center gap-1.5 active:opacity-70">
                    <Text className="font-satoshi text-xs font-semibold text-gray-900">
                      {transactionId}
                    </Text>
                    <CopyIcon width={13} height={13} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Transaction Date */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction Date
                  </Text>
                  <Text className="font-sans text-sm font-semibold text-gray-900">
                    {transactionDate}
                  </Text>
                </View>
              </>
            )}

            {/* VARIANT 1, 2, 3: BANK TRANSFERS & STAMP DUTY */}
            {(variant === 'outgoing_transfer' ||
              variant === 'incoming_transfer' ||
              variant === 'stamp_duty') && (
              <>
                {/* Recipient Details */}
                <View className="flex-row items-start justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400 pt-0.5">
                    Recipient Details
                  </Text>
                  <View className="items-end max-w-[62%]">
                    <Text className="font-satoshi text-xs font-bold text-gray-900 text-right">
                      {recipientName}
                    </Text>
                    <Text className="font-sans text-xs text-gray-500 text-right mt-0.5">
                      {bankName}
                    </Text>
                    <Text className="font-sans text-xs text-gray-500 text-right">
                      | {accountNumber}
                    </Text>
                  </View>
                </View>

                {/* Transfer Fee (for outgoing & incoming transfers) */}
                {variant !== 'stamp_duty' && (
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans text-sm font-medium text-gray-400">
                      Transfer fee
                    </Text>
                    <Text className="font-satoshi text-sm font-bold text-gray-900">
                      {transferFee}
                    </Text>
                  </View>
                )}

                {/* Remark (for outgoing transfer) */}
                {variant === 'outgoing_transfer' && (
                  <View className="flex-row items-center justify-between">
                    <Text className="font-sans text-sm font-medium text-gray-400">
                      Remark
                    </Text>
                    <Text className="font-sans text-sm font-semibold text-gray-900">
                      {remark}
                    </Text>
                  </View>
                )}

                {/* Transaction ID */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction ID
                  </Text>
                  <Pressable
                    onPress={() => handleCopy('Transaction ID', transactionId)}
                    hitSlop={6}
                    className="flex-row items-center gap-1.5 active:opacity-70">
                    <Text className="font-satoshi text-xs font-semibold text-gray-900">
                      {transactionId}
                    </Text>
                    <CopyIcon width={13} height={13} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Session ID */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Session ID
                  </Text>
                  <Pressable
                    onPress={() => handleCopy('Session ID', sessionId)}
                    hitSlop={6}
                    className="flex-row items-center gap-1.5 active:opacity-70">
                    <Text className="font-satoshi text-xs font-semibold text-gray-900">
                      {sessionId}
                    </Text>
                    <CopyIcon width={13} height={13} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Transaction Date */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction Date
                  </Text>
                  <Text className="font-sans text-sm font-semibold text-gray-900">
                    {transactionDate}
                  </Text>
                </View>
              </>
            )}

            {/* VARIANT 5, 6, 7: BILLS (TV, ELECTRICITY, AIRTIME, DATA) */}
            {(variant === 'tv' ||
              variant === 'electricity' ||
              variant === 'airtime' ||
              variant === 'data') && (
              <>
                {/* Amount Paid */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Amount Paid
                  </Text>
                  <Text className="font-satoshi text-base font-bold text-gray-900">
                    {amountPaid}
                  </Text>
                </View>

                {/* Transaction ID */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction ID
                  </Text>
                  <Pressable
                    onPress={() => handleCopy('Transaction ID', transactionId)}
                    hitSlop={6}
                    className="flex-row items-center gap-1.5 active:opacity-70">
                    <Text className="font-satoshi text-xs font-semibold text-gray-900">
                      {transactionId}
                    </Text>
                    <CopyIcon width={13} height={13} color="#9CA3AF" />
                  </Pressable>
                </View>

                {/* Transaction Type */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction Type
                  </Text>
                  <Text className="font-sans text-sm font-semibold text-gray-900">
                    {transactionType}
                  </Text>
                </View>

                {/* Transaction Date */}
                <View className="flex-row items-center justify-between">
                  <Text className="font-sans text-sm font-medium text-gray-400">
                    Transaction Date
                  </Text>
                  <Text className="font-sans text-sm font-semibold text-gray-900">
                    {transactionDate}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ══════════════════════════════════════════════════════════════════
            BOTTOM ACTION BUTTONS
           ══════════════════════════════════════════════════════════════════ */}
        <View className="mt-12">
          {/* Single Share Receipt button for Incoming Transfer and Conversion */}
          {variant === 'incoming_transfer' || variant === 'conversion' ? (
            <Pressable
              onPress={handleShare}
              className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs">
              <Text className="font-satoshi text-base font-bold text-[#FDE5C5]">
                Share Receipt
              </Text>
            </Pressable>
          ) : (
            /* Two buttons: Share Receipt + Report Issue */
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={handleShare}
                className="flex-1 h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs">
                <Text className="font-satoshi text-base font-bold text-[#FDE5C5]">
                  Share Receipt
                </Text>
              </Pressable>

              <Pressable
                onPress={handleReportIssue}
                className="flex-1 h-14 bg-[#FDEBD2] rounded-full items-center justify-center active:opacity-85 shadow-xs">
                <Text className="font-satoshi text-base font-bold text-gray-900">
                  Report Issue
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
