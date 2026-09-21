import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { DatePickerSelect } from "@/components/ui/date-picker-select";
import { UserIcon } from "@/components/ui/icons/onboarding";
import { SelectInput } from "@/components/ui/select-input";
import { SelectModal, SelectOption } from "@/components/ui/select-modal";
import { useRegister } from "@/context/register-context";

const REFERRAL_OPTIONS: SelectOption[] = [
  {
    label: "Social Media (Twitter/X, Instagram, TikTok)",
    value: "social_media",
    icon: "📱",
  },
  {
    label: "Friend or Family recommendation",
    value: "friend_family",
    icon: "👥",
  },
  { label: "Google Search / Online Search", value: "search", icon: "🔍" },
  { label: "Billboard / Print Advertisement", value: "ad", icon: "📢" },
  { label: "Financial Blog or News Article", value: "news", icon: "📰" },
  { label: "Other", value: "other", icon: "✨" },
];

export default function PersonalInfoScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();

  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.firstName.trim()) newErrors.firstName = "First name is required";
    if (!data.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!data.dob.trim()) newErrors.dob = "Date of birth is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push("/register/address" as any);
  };

  const canContinue =
    data.firstName.trim().length > 0 &&
    data.lastName.trim().length > 0 &&
    data.dob.trim().length > 0;

  return (
    <AuthScreenLayout
      badgeIcon={UserIcon}
      title="Personal Information"
      buttonTitle="Continue"
      buttonDisabled={!canContinue}
      onButtonPress={handleContinue}
    >
      <View className="w-full gap-6">
        {/* First Name */}
        <AppInput
          label="First name"
          placeholder="Enter your first name"
          value={data.firstName}
          onChangeText={(val) => {
            updateField("firstName", val);
            if (errors.firstName) {
              setErrors((prev) => ({ ...prev, firstName: "" }));
            }
          }}
          autoCapitalize="words"
          error={errors.firstName}
        />

        {/* Middle Name */}
        <AppInput
          label="Middle name"
          placeholder="Enter your middle name"
          value={data.middleName}
          onChangeText={(val) => updateField("middleName", val)}
          autoCapitalize="words"
        />

        {/* Last Name */}
        <AppInput
          label="Last name"
          placeholder="Enter your last name"
          value={data.lastName}
          onChangeText={(val) => {
            updateField("lastName", val);
            if (errors.lastName) {
              setErrors((prev) => ({ ...prev, lastName: "" }));
            }
          }}
          autoCapitalize="words"
          error={errors.lastName}
        />

        {/* Date of Birth */}
        <DatePickerSelect
          label="Date of birth"
          placeholder="Select your DOB"
          value={data.dob}
          onConfirm={(dateStr) => {
            updateField("dob", dateStr);
            if (errors.dob) setErrors((prev) => ({ ...prev, dob: "" }));
          }}
          error={errors.dob}
        />

        {/* Dashed separator matching Screen 3 */}
        <View className="w-full border-b border-dashed border-gray-300 my-2" />

        {/* Referral Source (Optional) */}
        <SelectInput
          label="Tell us how you hear about us? (Optional)"
          placeholder="Pick an answer"
          value={
            REFERRAL_OPTIONS.find((opt) => opt.value === data.referralSource)
              ?.label || data.referralSource
          }
          onPress={() => setReferralModalVisible(true)}
        />
      </View>

      {/* Referral Selection Modal */}
      <SelectModal
        visible={referralModalVisible}
        title="How did you hear about us?"
        options={REFERRAL_OPTIONS}
        selectedValue={data.referralSource}
        onSelect={(opt) => updateField("referralSource", opt.value)}
        onClose={() => setReferralModalVisible(false)}
      />
    </AuthScreenLayout>
  );
}
