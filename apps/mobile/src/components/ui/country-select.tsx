import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";
import {
  EURIcon,
  GBPIcon,
  NGNIcon,
  USDIcon,
} from "@/components/ui/icons/currencies";
import { COUNTRIES, Country } from "@/context/register-context";
import { SelectInput } from "@/components/ui/select-input";

interface CountrySelectProps {
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
  label?: string;
  countries?: Country[];
  error?: string;
  containerClassName?: string;
}

interface CountryOption {
  country: Country;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
}

const DEFAULT_OPTIONS: CountryOption[] = [
  {
    country: COUNTRIES[0],
    label: "NGN",
    Icon: NGNIcon,
  },
];

const getCountryOption = (c: Country): CountryOption => {
  if (c.code === "NG") return { country: c, label: "NGN", Icon: NGNIcon };
  if (c.code === "US") return { country: c, label: "USD", Icon: USDIcon };
  if (c.code === "GB") return { country: c, label: "GBP", Icon: GBPIcon };
  if (c.code === "DE" || c.code === "FR")
    return { country: c, label: "EUR", Icon: EURIcon };
  return {
    country: c,
    label: c.code,
    Icon: ({ size = 28 }) => (
      <Text style={{ fontSize: size * 0.75 }}>{c.flag}</Text>
    ),
  };
};

export function CountrySelect({
  selectedCountry,
  onSelectCountry,
  label,
  countries,
  error,
  containerClassName,
}: CountrySelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const options = useMemo(() => {
    if (countries && countries.length > 0) {
      return countries.map(getCountryOption);
    }
    return DEFAULT_OPTIONS;
  }, [countries]);

  const handleSelect = (country: Country) => {
    onSelectCountry(country);
    setModalVisible(false);
  };

  const flagIcon =
    selectedCountry.code === "NG" ? (
      <NGNIcon size={28} />
    ) : (
      <Text className="text-xl leading-none">{selectedCountry.flag}</Text>
    );

  return (
    <View className="w-full">
      <SelectInput
        label={label}
        value={selectedCountry.name}
        leadingIcon={flagIcon}
        onPress={() => setModalVisible(true)}
        error={error}
        containerClassName={containerClassName}
      />

      <DraggableBottomSheet
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      >
        {/* Title */}
        <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-6">
          Select Country
        </Text>

        {/* Country options list */}
        {options.map((item) => (
          <Pressable
            key={item.country.code}
            onPress={() => handleSelect(item.country)}
            className="flex-row items-center gap-3.5 py-3 active:bg-gray-50 rounded-2xl px-1"
          >
            <item.Icon size={28} />
            <Text className="font-inter text-lg text-gray-900">
              {item.label}
            </Text>
          </Pressable>
        ))}
      </DraggableBottomSheet>
    </View>
  );
}
