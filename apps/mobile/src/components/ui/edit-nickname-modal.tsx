import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface EditNicknameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
}

function EditNicknameModalContent({
  currentName,
  onClose,
  onSave,
}: Omit<EditNicknameModalProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(currentName);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/60">
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityLabel="Dismiss edit nickname modal"
        />

        <View
          className="bg-white rounded-t-[36px] px-6 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
          <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6" />

          <Text className="font-satoshi text-[22px] font-bold text-gray-900 mb-2">
            Edit Card Nickname
          </Text>
          <Text className="font-sans text-sm text-gray-500 mb-6">
            Give this card a personalized name to keep your spending organized.
          </Text>

          <View className="bg-gray-100 rounded-2xl px-4 py-3.5 mb-6 border border-gray-200">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Daniel's Card"
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="font-satoshi text-base font-semibold text-gray-900"
            />
          </View>

          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 h-14 bg-gray-200 rounded-full items-center justify-center active:opacity-85">
              <Text className="font-satoshi text-base font-bold text-gray-900">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              className="flex-1 h-14 bg-[#111827] rounded-full items-center justify-center active:opacity-85">
              <Text className="font-satoshi text-base font-bold text-white">
                Save
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function EditNicknameModal({
  visible,
  currentName,
  onClose,
  onSave,
}: EditNicknameModalProps) {
  if (!visible) {
    return null;
  }

  return (
    <EditNicknameModalContent
      currentName={currentName}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
