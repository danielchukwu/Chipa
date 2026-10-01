import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/app-button';
import { PinInput } from '@/components/ui/input/pin-input';
import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { ChipaLogo } from '@/components/chipa-logo';
import { authService } from '@/api/services/auth.service';
import { chipaApi } from '@/lib/api';

export default function ForgotResetScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canContinue =
    pin.length === 4 && confirmPin.length === 4 && !loading;

  const handleResetPin = async () => {
    if (pin.length < 4) {
      setError('PIN must be 4 digits');
      return;
    }
    if (confirmPin.length < 4) {
      setError('Please confirm your 4-digit PIN');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (email && otp) {
        await authService.changePinByEmail({ email, otp, pin });
      } else {
        await chipaApi.setTransactionPIN(pin);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset PIN. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Dismiss the entire forgot sub-stack and return to login / PIN screen
    if (router.canDismiss()) router.dismissAll();
    router.replace('/(auth)/login' as any);
  };

  // ── Success State ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <View className="items-center gap-4">
          <View className="w-20 h-20 rounded-full bg-green-50 border border-green-100 items-center justify-center mb-2">
            <Text style={{ fontSize: 38 }}>✅</Text>
          </View>
          <Text className="font-satoshi text-[24px] font-extrabold text-gray-900 text-center tracking-[-0.4px]">
            PIN reset complete!
          </Text>
          <Text className="font-sans text-sm text-gray-500 text-center leading-5">
            Your PIN has been updated successfully. You can now log in with your new PIN.
          </Text>
          <View className="w-full mt-6">
            <AppButton
              title="Back to Log in"
              variant="primary"
              onPress={handleBackToLogin}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Default State ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View className="px-6 pt-3 pb-2 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 items-center justify-center"
          >
            <BackArrowIcon width={18} height={18} stroke="#111827" />
          </Pressable>
          <View className="flex-1 items-center">
            <View className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 items-center justify-center shadow-sm mr-10">
              <ChipaLogo size={26} />
            </View>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 pt-8">
              {/* Icon */}
              <View className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center mb-6">
                <Text style={{ fontSize: 30 }}>🔑</Text>
              </View>

              {/* Title & Subtitle */}
              <Text className="font-satoshi text-[28px] font-extrabold text-gray-900 leading-[34px] tracking-[-0.6px] mb-2">
                Set new PIN
              </Text>
              <Text className="font-sans text-sm text-gray-500 mb-8 leading-5">
                Enter a new secure 4-digit PIN for your account.
              </Text>

              {/* PIN Inputs */}
              <View className="w-full items-center">
                <PinInput
                  label="New PIN"
                  value={pin}
                  onChangePin={(val) => {
                    setPin(val);
                    if (error) setError('');
                  }}
                  secureTextEntry
                  autoFocus
                />

                <PinInput
                  label="Confirm New PIN"
                  value={confirmPin}
                  onChangePin={(val) => {
                    setConfirmPin(val);
                    if (error) setError('');
                  }}
                  secureTextEntry
                  error={error}
                />
              </View>

              <View className="mt-8 w-full">
                <AppButton
                  title="Reset PIN"
                  variant="primary"
                  onPress={handleResetPin}
                  loading={loading}
                  disabled={!canContinue}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
