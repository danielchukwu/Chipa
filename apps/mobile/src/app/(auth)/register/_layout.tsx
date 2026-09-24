import { Stack } from "expo-router";
import React from "react";

import { RegisterProvider } from "@/context/register-context";

export default function RegisterLayout() {
  return (
    <RegisterProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="email" />
        <Stack.Screen name="verify-email" />
        <Stack.Screen name="password" />
        <Stack.Screen name="phone" />
        <Stack.Screen name="verify-phone" />
        <Stack.Screen name="personal-info" />
        <Stack.Screen name="address" />
        <Stack.Screen name="referral" />
        <Stack.Screen name="bvn" />
        <Stack.Screen name="pin" />
      </Stack>
    </RegisterProvider>
  );
}
