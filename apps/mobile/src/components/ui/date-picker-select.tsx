import React, { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import {
  DatePickerModal,
  formatDateString,
  parseDateString,
} from "@/components/ui/date-picker-modal";
import { SelectInput } from "@/components/ui/select-input";

export interface DatePickerSelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onConfirm: (dateStr: string) => void;
  error?: string;
  leadingIcon?: React.ReactNode;
  containerClassName?: string;
  disabled?: boolean;
  title?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DatePickerSelect({
  label = "Date of birth",
  placeholder = "Select your DOB",
  value,
  onConfirm,
  error,
  leadingIcon,
  containerClassName,
  disabled = false,
  title,
  maximumDate,
  minimumDate,
}: DatePickerSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const currentYear = new Date().getFullYear();
  const defaultMinYear = currentYear - 100;
  const defaultMaxYear = currentYear - 16;

  const maxDate = useMemo(
    () =>
      maximumDate ||
      new Date(defaultMaxYear, new Date().getMonth(), new Date().getDate()),
    [maximumDate, defaultMaxYear]
  );

  const minDate = useMemo(
    () => minimumDate || new Date(defaultMinYear, 0, 1),
    [minimumDate, defaultMinYear]
  );

  const handlePress = () => {
    if (disabled) return;

    if (Platform.OS === "android") {
      // Use native Android Material DatePickerDialog
      const parsedDate = parseDateString(value);
      DateTimePickerAndroid.open({
        value: parsedDate,
        onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
          if (event.type === "set" && selectedDate) {
            onConfirm(formatDateString(selectedDate));
          }
        },
        mode: "date",
        maximumDate: maxDate,
        minimumDate: minDate,
      });
    } else {
      // iOS & Web: Open standard bottom sheet with native iOS spinner or web selector
      setModalVisible(true);
    }
  };

  return (
    <View className="w-full">
      <SelectInput
        label={label}
        placeholder={placeholder}
        value={value}
        leadingIcon={leadingIcon}
        onPress={handlePress}
        error={error}
        containerClassName={containerClassName}
        disabled={disabled}
      />

      {/* Only needed for iOS (embedded in DraggableBottomSheet) and Web fallback */}
      {Platform.OS !== "android" && (
        <DatePickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={onConfirm}
          initialDate={value}
          title={title}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}
    </View>
  );
}
