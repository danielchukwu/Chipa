import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { OtpInput } from '@/components/ui/input/otp-input';
import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { ChipaLogo } from '@/components/chipa-logo';
import { authService } from '@/api/services/auth.service';

export default function ForgotVerifyScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const displayEmail = email || 'your email';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleContinue = () => {
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setError('');
    router.push({
      pathname: '/(auth)/login/forgot-reset' as any,
      params: { email, otp },
    });
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authService.sendForgotPasswordOTP(email);
      Alert.alert('Code Sent', `A new reset code was sent to ${displayEmail}.`);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 pt-8">
              {/* Icon */}
              <View className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 items-center justify-center mb-6">
                <Text style={{ fontSize: 30 }}>📩</Text>
              </View>

              {/* Title & Subtitle */}
              <Text className="font-satoshi text-[28px] font-extrabold text-gray-900 leading-[34px] tracking-[-0.6px] mb-2">
                Check your email
              </Text>
              <Text className="font-sans text-sm text-gray-500 mb-8 leading-5">
                We sent a 6-digit reset code to{' '}
                <Text className="font-bold text-gray-900">{displayEmail}</Text>.
                {'\n'}Enter the code below.
              </Text>

              {/* OTP Input with built-in resend countdown */}
              <OtpInput
                value={otp}
                onChangeOtp={(val) => {
                  setOtp(val);
                  if (error) setError('');
                }}
                onResend={handleResend}
                autoFocus
              />

              {/* Error message */}
              {error ? (
                <Text className="font-sans text-xs text-red-500 mt-2 text-center">
                  {error}
                </Text>
              ) : null}

              {/* Manual resend fallback */}
              <View className="flex-row items-center justify-center mt-5">
                <Text className="font-sans text-sm text-gray-500">
                  Didn't receive it?{' '}
                </Text>
                <Pressable
                  onPress={handleResend}
                  disabled={resending}
                  hitSlop={8}
                >
                  <Text className="font-sans text-sm font-bold text-gray-900">
                    {resending ? 'Sending…' : 'Resend code'}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-8">
                <AppButton
                  title="Verify code"
                  variant="primary"
                  onPress={handleContinue}
                  loading={loading}
                  disabled={otp.length < 6 || loading}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
