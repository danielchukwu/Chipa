import React from 'react';
import { Pressable, View } from 'react-native';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
  onSelect?: (index: number) => void;
}

export function PaginationDots({ total, activeIndex, onSelect }: PaginationDotsProps) {
  return (
    <View className="flex-row items-center justify-center gap-2 my-5">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={index}
            onPress={() => onSelect?.(index)}
            hitSlop={8}
            className={`h-2 w-2 rounded-full ${
              isActive ? 'bg-brand' : 'bg-gray-300'
            }`}
          />
        );
      })}
    </View>
  );
}
