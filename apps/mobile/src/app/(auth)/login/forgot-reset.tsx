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
import { AppInput } from '@/components/ui/input/app-input';
import {
  PasswordChecklist,
  isPasswordValid,
} from '@/components/ui/password-checklist';
import { BackArrowIcon } from '@/components/ui/icons/back-arrow-icon';
import { ChipaLogo } from '@/components/chipa-logo';
import { authService } from '@/api/services/auth.service';

export default function ForgotResetScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canContinue =
    isPasswordValid(password) && confirmPassword.length > 0 && !loading;

  const handleReset = async () => {
    if (!isPasswordValid(password)) {
      setError('Please satisfy all password requirements');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!email || !otp) {
      setError('Invalid reset session. Please start over.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await authService.changePasswordByEmail({ email, otp, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    // Dismiss the entire forgot-password sub-stack and return to login
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
            Password reset!
          </Text>
          <Text className="font-sans text-sm text-gray-500 text-center leading-5">
            Your password has been updated successfully. You can now log in with your new password.
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
                Set new password
              </Text>
              <Text className="font-sans text-sm text-gray-500 mb-8 leading-5">
                Your new password must be different from your previous password.
              </Text>

              {/* New Password */}
              <View className="gap-5">
                <AppInput
                  label="New password"
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    if (error) setError('');
                  }}
                  isPassword
                  autoFocus
                />

                {/* Password requirements checklist */}
                {password.length > 0 && (
                  <PasswordChecklist password={password} />
                )}

                <AppInput
                  label="Confirm new password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={(t) => {
                    setConfirmPassword(t);
                    if (error) setError('');
                  }}
                  isPassword
                  error={error}
                />
              </View>

              <View className="mt-8">
                <AppButton
                  title="Reset password"
                  variant="primary"
                  onPress={handleReset}
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
