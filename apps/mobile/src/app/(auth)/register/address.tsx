import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

import { AppInput } from "@/components/ui/input/app-input";
import { CountryFlagIcon } from "@/components/ui/input/phone-input";
import { AuthScreenLayout } from "@/components/ui/auth-screen-layout";
import { MapPinIcon } from "@/components/ui/icons/onboarding";
import { SelectInput } from "@/components/ui/select-input";
import { SelectModal, SelectOption } from "@/components/ui/select-modal";
import { COUNTRIES, useRegister } from "@/context/register-context";
import { chipaApi } from "@/lib/api";

const NIGERIAN_STATES: SelectOption[] = [
  { label: "Abia", value: "Abia" },
  { label: "Abuja (FCT)", value: "Abuja (FCT)" },
  { label: "Adamawa", value: "Adamawa" },
  { label: "Akwa Ibom", value: "Akwa Ibom" },
  { label: "Anambra", value: "Anambra" },
  { label: "Bauchi", value: "Bauchi" },
  { label: "Bayelsa", value: "Bayelsa" },
  { label: "Benue", value: "Benue" },
  { label: "Borno", value: "Borno" },
  { label: "Cross River", value: "Cross River" },
  { label: "Delta", value: "Delta" },
  { label: "Ebonyi", value: "Ebonyi" },
  { label: "Edo", value: "Edo" },
  { label: "Ekiti", value: "Ekiti" },
  { label: "Enugu", value: "Enugu" },
  { label: "Gombe", value: "Gombe" },
  { label: "Imo", value: "Imo" },
  { label: "Jigawa", value: "Jigawa" },
  { label: "Kaduna", value: "Kaduna" },
  { label: "Kano", value: "Kano" },
  { label: "Katsina", value: "Katsina" },
  { label: "Kebbi", value: "Kebbi" },
  { label: "Kogi", value: "Kogi" },
  { label: "Kwara", value: "Kwara" },
  { label: "Lagos", value: "Lagos" },
  { label: "Nasarawa", value: "Nasarawa" },
  { label: "Niger", value: "Niger" },
  { label: "Ogun", value: "Ogun" },
  { label: "Ondo", value: "Ondo" },
  { label: "Osun", value: "Osun" },
  { label: "Oyo", value: "Oyo" },
  { label: "Plateau", value: "Plateau" },
  { label: "Rivers", value: "Rivers" },
  { label: "Sokoto", value: "Sokoto" },
  { label: "Taraba", value: "Taraba" },
  { label: "Yobe", value: "Yobe" },
  { label: "Zamfara", value: "Zamfara" },
];

export default function AddressScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const countryOptions: SelectOption[] = COUNTRIES.map((c) => ({
    label: c.name,
    value: c.code,
    icon: <CountryFlagIcon country={c} size={24} />,
  }));

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.state.trim()) newErrors.state = "Please select your state";
    if (!data.streetAddress.trim())
      newErrors.streetAddress = "Street address is required";
    if (!data.city.trim()) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push("/register/referral" as any);
  };

  const canContinue =
    data.state.trim().length > 0 &&
    data.streetAddress.trim().length > 0 &&
    data.city.trim().length > 0 &&
    !loading;

  return (
    <AuthScreenLayout
      badgeIcon={MapPinIcon}
      title="Enter your home address"
      buttonTitle="Continue"
      buttonLoading={loading}
      buttonDisabled={!canContinue}
      onButtonPress={handleContinue}
    >
      <View className="w-full gap-6">
        {/* Country of Residence */}
        <SelectInput
          label="Country of residence"
          value={data.countryOfResidence.name}
          leadingIcon={
            <CountryFlagIcon country={data.countryOfResidence} size={24} />
          }
          onPress={() => setCountryModalVisible(true)}
        />

        {/* State */}
        <SelectInput
          label="State"
          placeholder="Select state"
          value={data.state}
          onPress={() => setStateModalVisible(true)}
          error={errors.state}
        />

        {/* Street Address */}
        <AppInput
          label="Street address"
          placeholder="Enter your street address"
          value={data.streetAddress}
          onChangeText={(val) => {
            updateField("streetAddress", val);
            if (errors.streetAddress) {
              setErrors((prev) => ({ ...prev, streetAddress: "" }));
            }
          }}
          error={errors.streetAddress}
        />

        {/* City */}
        <AppInput
          label="City"
          placeholder="Enter your city"
          value={data.city}
          onChangeText={(val) => {
            updateField("city", val);
            if (errors.city) {
              setErrors((prev) => ({ ...prev, city: "" }));
            }
          }}
          error={errors.city}
        />

        {/* Post Code / ZIP code (Optional) */}
        <AppInput
          label="Post code / ZIP code (Optional)"
          placeholder="Enter post code / ZIP code"
          value={data.postCode}
          onChangeText={(val) => updateField("postCode", val)}
          keyboardType="numbers-and-punctuation"
        />
      </View>

      {/* Country Selection Modal */}
      <SelectModal
        visible={countryModalVisible}
        title="Select Country"
        options={countryOptions}
        selectedValue={data.countryOfResidence.code}
        onSelect={(opt) => {
          const found = COUNTRIES.find((c) => c.code === opt.value);
          if (found) updateField("countryOfResidence", found);
        }}
        onClose={() => setCountryModalVisible(false)}
        searchable
      />

      {/* State Selection Modal */}
      <SelectModal
        visible={stateModalVisible}
        title="Select State"
        options={NIGERIAN_STATES}
        selectedValue={data.state}
        onSelect={(opt) => {
          updateField("state", opt.value);
          if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
        }}
        onClose={() => setStateModalVisible(false)}
        searchable
      />
    </AuthScreenLayout>
  );
}
