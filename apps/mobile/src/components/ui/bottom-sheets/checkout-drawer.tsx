import React from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import { ChevronRightIcon } from "@/components/ui/icons/app-icons";
import { CloseIcon } from "@/components/ui/icons/snowflake-icon";
import {
  EURoundFlag,
  NigeriaRoundFlag,
  UKRoundFlag,
  USRoundFlag,
} from "@/components/ui/transaction-brand-logos";
import { cn } from "@/lib/utils";

export interface CheckoutRowItem {
  label: string;
  value?: string;
  valueNode?: React.ReactNode;
  valueClassName?: string;
  strikeThroughValue?: string;
}

export interface CheckoutPaymentMethod {
  currency?: string;
  flag?: React.ReactNode | string;
  balance?: string;
  label?: string;
  onPress?: () => void;
  clickable?: boolean;
}

export interface CheckoutDrawerProps {
  visible: boolean;
  onClose: () => void;
  onPay: () => void;
  heroAmount: string;
  rows: CheckoutRowItem[];
  paymentMethod?: CheckoutPaymentMethod;
  payButtonText?: string;
  payButtonClassName?: string;
  containerClassName?: string;
}

export function CheckoutDrawer({
  visible,
  onClose,
  onPay,
  heroAmount,
  rows,
  paymentMethod,
  payButtonText = "Pay",
  payButtonClassName,
  containerClassName,
}: CheckoutDrawerProps) {
  const renderFlag = () => {
    if (paymentMethod?.flag) {
      if (typeof paymentMethod.flag === "string") {
        return <Text className="text-xl mr-1">{paymentMethod.flag}</Text>;
      }
      return paymentMethod.flag;
    }

    const cur = paymentMethod?.currency?.toUpperCase() || "NGN";
    switch (cur) {
      case "USD":
        return <USRoundFlag size={24} />;
      case "GBP":
        return <UKRoundFlag size={24} />;
      case "EUR":
        return <EURoundFlag size={24} />;
      default:
        return <NigeriaRoundFlag size={24} />;
    }
  };

  return (
    <DraggableBottomSheet
      visible={visible}
      onClose={onClose}
      containerClassName={containerClassName}
    >
      {/* ── Header: Hero Amount & Close Button ── */}
      <View className="relative items-center justify-center py-2 mb-2">
        <Text className="font-satoshi text-[32px] font-extrabold text-gray-900 tracking-tight text-center">
          {heroAmount}
        </Text>
        <Pressable
          onPress={onClose}
          hitSlop={12}
          className="absolute right-0 w-9 h-9 rounded-full items-center justify-center active:bg-gray-100"
          accessibilityLabel="Dismiss checkout drawer"
        >
          <CloseIcon width={18} height={18} color="#6B7280" />
        </Pressable>
      </View>

      {/* ── Dashed Divider ── */}
      <View className="border-b border-dashed border-gray-200 my-4" />

      {/* ── Breakdown / Invoice Rows ── */}
      <View className="gap-3.5 mb-6">
        {rows.map((row, idx) => (
          <View key={idx} className="flex-row items-center justify-between">
            <Text className="font-sans text-sm text-gray-400 font-medium">
              {row.label}
            </Text>
            {row.valueNode ? (
              row.valueNode
            ) : (
              <View className="flex-row items-center gap-1.5">
                {row.strikeThroughValue && (
                  <Text className="font-satoshi text-xs text-gray-400 line-through">
                    {row.strikeThroughValue}
                  </Text>
                )}
                <Text
                  className={cn(
                    "font-satoshi text-sm font-bold text-gray-900",
                    row.valueClassName,
                  )}
                >
                  {row.value}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* ── Payment Method Container ── */}
      {paymentMethod && (
        <View className="mb-6">
          <Text className="font-sans text-xs text-gray-400 font-medium mb-2">
            Payment Method
          </Text>

          <Pressable
            disabled={!paymentMethod.clickable || !paymentMethod.onPress}
            onPress={paymentMethod.onPress}
            className={cn(
              "bg-[#F9FAFB] rounded-2xl px-4 py-3.5 flex-row items-center justify-between border border-gray-100",
              paymentMethod.clickable && paymentMethod.onPress && "active:bg-gray-100",
            )}
          >
            <View className="flex-row items-center gap-2.5">
              {renderFlag()}
              <Text className="font-satoshi text-sm font-bold text-gray-900">
                {paymentMethod.label || "Available Balance"}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5">
              <Text className="font-satoshi text-sm font-bold text-[#10B981]">
                {paymentMethod.balance || "₦2,800.00"}
              </Text>
              {paymentMethod.clickable && paymentMethod.onPress && (
                <ChevronRightIcon width={14} height={14} color="#6B7280" />
              )}
            </View>
          </Pressable>
        </View>
      )}

      {/* ── Action Button ── */}
      <Pressable
        onPress={onPay}
        className={cn(
          "w-full h-14 bg-black rounded-full items-center justify-center active:opacity-85 shadow-xs",
          payButtonClassName,
        )}
      >
        <Text className="font-satoshi text-base font-bold text-white">
          {payButtonText}
        </Text>
      </Pressable>
    </DraggableBottomSheet>
  );
}
