import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Platform, Pressable, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AppButton } from "@/components/ui/app-button";
import { DraggableBottomSheet } from "@/components/ui/draggable-bottom-sheet";

export interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (dateStr: string) => void;
  initialDate?: string;
  title?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function parseDateString(dateStr?: string): Date {
  if (!dateStr) {
    const current = new Date();
    return new Date(current.getFullYear() - 20, 0, 1);
  }
  if (dateStr.includes("/")) {
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        const date = new Date(y, m, d);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }
  const current = new Date();
  return new Date(current.getFullYear() - 20, 0, 1);
}

export function formatDateString(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  initialDate,
  title = "Select Date of Birth",
  maximumDate,
  minimumDate,
}: DatePickerModalProps) {
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

  // iOS native date picker state
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    parseDateString(initialDate)
  );

  // Web/Fallback state
  const years = useMemo(() => {
    const list: number[] = [];
    const maxY = maxDate.getFullYear();
    const minY = minDate.getFullYear();
    for (let y = maxY; y >= minY; y--) {
      list.push(y);
    }
    return list;
  }, [maxDate, minDate]);

  const [selectedDay, setSelectedDay] = useState(() => selectedDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(
    () => MONTHS[selectedDate.getMonth()]
  );
  const [selectedYear, setSelectedYear] = useState(() =>
    selectedDate.getFullYear()
  );

  useEffect(() => {
    if (visible) {
      const parsed = parseDateString(initialDate);
      setSelectedDate(parsed);
      setSelectedDay(parsed.getDate());
      setSelectedMonth(MONTHS[parsed.getMonth()]);
      setSelectedYear(parsed.getFullYear());
    }
  }, [visible, initialDate]);

  const daysInMonth = useMemo(() => {
    const monthIndex = MONTHS.indexOf(selectedMonth);
    const count = new Date(selectedYear, monthIndex + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [selectedMonth, selectedYear]);

  const handleConfirm = () => {
    if (Platform.OS === "ios") {
      onConfirm(formatDateString(selectedDate));
    } else {
      const monthPadded = String(MONTHS.indexOf(selectedMonth) + 1).padStart(
        2,
        "0"
      );
      const dayPadded = String(selectedDay).padStart(2, "0");
      onConfirm(`${dayPadded}/${monthPadded}/${selectedYear}`);
    }
    onClose();
  };

  return (
    <DraggableBottomSheet visible={visible} onClose={onClose}>
      {/* Title */}
      <Text className="font-satoshi text-2xl font-bold text-gray-900 mb-2">
        {title}
      </Text>

      {Platform.OS === "ios" ? (
        /* Native iOS Cupertino Spinner Wheel */
        <View className="items-center justify-center py-2 mb-4">
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(_, date) => {
              if (date) setSelectedDate(date);
            }}
            maximumDate={maxDate}
            minimumDate={minDate}
            textColor="#111827"
            themeVariant="light"
            style={{ width: "100%", height: 216 }}
          />
        </View>
      ) : (
        /* Web & Cross-platform 3-column fallback */
        <View className="flex-row h-52 bg-gray-50 rounded-2xl p-2 mb-6">
          {/* Day Column */}
          <View className="flex-1 items-center">
            <Text className="font-inter text-xs font-bold text-gray-500 mb-1">
              DAY
            </Text>
            <FlatList
              data={daysInMonth}
              keyExtractor={(item) => String(item)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === selectedDay;
                return (
                  <Pressable
                    onPress={() => setSelectedDay(item)}
                    className={`h-9 w-full items-center justify-center rounded-lg px-2 my-0.5 ${
                      isSelected ? "bg-black" : "active:bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-inter text-sm ${
                        isSelected ? "text-white font-bold" : "text-gray-800"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Month Column */}
          <View className="flex-[1.5] items-center border-x border-gray-200 px-1">
            <Text className="font-inter text-xs font-bold text-gray-500 mb-1">
              MONTH
            </Text>
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === selectedMonth;
                return (
                  <Pressable
                    onPress={() => setSelectedMonth(item)}
                    className={`h-9 w-full items-center justify-center rounded-lg px-2 my-0.5 ${
                      isSelected ? "bg-black" : "active:bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-inter text-sm ${
                        isSelected ? "text-white font-bold" : "text-gray-800"
                      }`}
                    >
                      {item.slice(0, 3)}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>

          {/* Year Column */}
          <View className="flex-1 items-center">
            <Text className="font-inter text-xs font-bold text-gray-500 mb-1">
              YEAR
            </Text>
            <FlatList
              data={years}
              keyExtractor={(item) => String(item)}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === selectedYear;
                return (
                  <Pressable
                    onPress={() => setSelectedYear(item)}
                    className={`h-9 w-full items-center justify-center rounded-lg px-2 my-0.5 ${
                      isSelected ? "bg-black" : "active:bg-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-inter text-sm ${
                        isSelected ? "text-white font-bold" : "text-gray-800"
                      }`}
                    >
                      {item}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      )}

      {/* Confirm Button */}
      <AppButton
        title="Confirm Date"
        variant="primary"
        onPress={handleConfirm}
      />
    </DraggableBottomSheet>
  );
}
