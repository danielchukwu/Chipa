import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { AuthScreenLayout } from '@/components/ui/auth-screen-layout';
import { CountrySelect } from '@/components/ui/country-select';
import { MapPinIcon } from '@/components/ui/icons/onboarding';
import { useRegister } from '@/context/register-context';

export default function WhereDoYouLiveScreen() {
  const router = useRouter();
  const { data, updateField } = useRegister();

  const handleContinue = () => {
    router.push('/register/email' as any);
  };

  return (
    <AuthScreenLayout
      badgeIcon={MapPinIcon}
      title="Where do you live?"
      buttonTitle="Continue"
      onButtonPress={handleContinue}>
      <View className="w-full mt-2">
        <CountrySelect
          selectedCountry={data.country}
          onSelectCountry={(country) => updateField('country', country)}
        />
      </View>
    </AuthScreenLayout>
  );
}
