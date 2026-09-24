import { useRouter } from 'expo-router';
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
import { AppInput } from '@/components/ui/input/app-input';
import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { ChipaLogo } from '@/components/chipa-logo';
import { authService } from '@/api/services/auth.service';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await authService.sendForgotPasswordOTP(trimmed);
      // Navigate to OTP verification screen, passing the email as a param
      router.push({
        pathname: '/(auth)/login/forgot-verify' as any,
        params: { email: trimmed },
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
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
                <Text style={{ fontSize: 30 }}>🔐</Text>
              </View>

              {/* Title & Subtitle */}
              <Text className="font-satoshi text-[28px] font-extrabold text-gray-900 leading-[34px] tracking-[-0.6px] mb-2">
                Forgot password?
              </Text>
              <Text className="font-sans text-sm text-gray-500 mb-8 leading-5">
                No worries. Enter your registered email address and we'll send you a 6-digit reset code.
              </Text>

              {/* Email Input */}
              <AppInput
                label="Email address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (error) setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                error={error}
              />

              <View className="mt-8">
                <AppButton
                  title="Send reset code"
                  variant="primary"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={!email.trim() || loading}
                />
              </View>

              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                className="items-center mt-6"
              >
                <Text className="font-sans text-sm text-gray-500">
                  Back to{' '}
                  <Text className="font-bold text-gray-900">Log in</Text>
                </Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
