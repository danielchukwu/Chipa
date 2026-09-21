import { cn } from "@/lib/utils";
import React from "react";
import { Text, View } from "react-native";

import { CheckIcon } from "@/components/ui/icons/check-icon";

export interface PasswordRule {
  id: string;
  label: string;
  isValid: boolean;
}

export function evaluatePasswordRules(password: string): PasswordRule[] {
  return [
    {
      id: "min_length",
      label: "At least 8 characters",
      isValid: password.length >= 8,
    },
    {
      id: "uppercase",
      label: "Include one uppercase letter",
      isValid: /[A-Z]/.test(password),
    },
    {
      id: "lowercase",
      label: "Include one lowercase letter",
      isValid: /[a-z]/.test(password),
    },
    {
      id: "number",
      label: "Include one number",
      isValid: /[0-9]/.test(password),
    },
    {
      id: "special",
      label: "Include one special character (e.g. !@#$%&*+-.:;?@\\^_|~)",
      isValid: /[!@#$%&*+\-.:;?@\^_|~]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return evaluatePasswordRules(password).every((rule) => rule.isValid);
}

interface PasswordChecklistProps {
  password: string;
  className?: string;
}

export function PasswordChecklist({
  password,
  className = "",
}: PasswordChecklistProps) {
  const rules = evaluatePasswordRules(password);

  return (
    <View className={cn(`gap-2.5 my-4`, className)}>
      {rules.map((rule) => (
        <View key={rule.id} className="flex-row items-start gap-2.5">
          {rule.isValid ? (
            <View className="w-5 h-5 items-center justify-center mt-0.5">
              <CheckIcon size={20} />
            </View>
          ) : (
            <View className="w-5 h-5 rounded-full bg-gray-200 mt-0.5" />
          )}

          <Text
            className={`flex-1 font-inter text-base ${
              rule.isValid ? "text-gray-800 font-medium" : "text-gray-500"
            }`}
          >
            {rule.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
