import React from "react";
import { Pressable, Text, View } from "react-native";
import { cn } from "@/lib/utils";

export interface QuickAmountTileProps {
  amount: number | string;
  onPress: () => void;
  disabled?: boolean;
  currencyPrefix?: string;
  className?: string;
  isSelected?: boolean;
}

export function formatAmountLabel(
  amount: number | string,
  currencyPrefix = "₦",
): string {
  if (typeof amount === "number") {
    const formattedNum =
      amount >= 1000
        ? `${(amount / 1000).toLocaleString("en-US")},000`
        : `${amount}`;
    return `${currencyPrefix}${formattedNum}`;
  }

  const cleanStr = String(amount).trim();
  if (cleanStr.startsWith(currencyPrefix)) {
    return cleanStr;
  }
  return `${currencyPrefix}${cleanStr}`;
}

export function QuickAmountTile({
  amount,
  onPress,
  disabled = false,
  currencyPrefix = "₦",
  className,
  isSelected = false,
}: QuickAmountTileProps) {
  const displayLabel = formatAmountLabel(amount, currencyPrefix);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={cn(
        "h-[72px] min-w-[100px] flex-1 bg-white rounded-xl py-3.5 items-center justify-center border border-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.05)] active:bg-gray-50",
        isSelected && "border-brand bg-brand/5",
        disabled && "opacity-50",
        className,
      )}
    >
      <Text className="font-satoshi text-lg font-medium text-gray-900">
        {displayLabel}
      </Text>
    </Pressable>
  );
}

export interface QuickAmountsGridProps {
  amounts: (number | string)[];
  onSelectAmount: (amount: any) => void;
  disabled?: boolean;
  currencyPrefix?: string;
  className?: string;
  selectedAmount?: number | string;
  columns?: number;
}

export function QuickAmountsGrid({
  amounts,
  onSelectAmount,
  disabled = false,
  currencyPrefix = "₦",
  className,
  selectedAmount,
  columns = 3,
}: QuickAmountsGridProps) {
  // Chunk into rows according to columns count (default 3)
  const rows: (number | string)[][] = [];
  for (let i = 0; i < amounts.length; i += columns) {
    rows.push(amounts.slice(i, i + columns));
  }

  return (
    <View className={cn("gap-2", className)}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-row gap-2">
          {row.map((amt) => (
            <QuickAmountTile
              key={String(amt)}
              amount={amt}
              onPress={() => onSelectAmount(amt)}
              disabled={disabled}
              currencyPrefix={currencyPrefix}
              isSelected={
                selectedAmount !== undefined &&
                String(selectedAmount) === String(amt)
              }
            />
          ))}
        </View>
      ))}
    </View>
  );
}
