import React from "react";
import { Text, View } from "react-native";
import { WelcomeOffering } from "./types";

interface VisualCardProps {
  offering: WelcomeOffering;
}

export function VisualCard({ offering }: VisualCardProps) {
  return (
    <View className="w-full h-[360px] bg-[#9AA6C8] rounded-[28px] overflow-hidden p-4 items-center justify-center">
      {offering.type === "get_paid" && <GetPaidVisual />}
      {offering.type === "fx_rates" && <FxRatesVisual />}
      {offering.type === "timing_vault" && <TimingVaultVisual />}
      {offering.type === "subscriptions" && <SubscriptionsVisual />}
      {offering.type === "virtual_cards" && <VirtualCardsVisual />}
    </View>
  );
}

// 1. Get Paid Visual
function GetPaidVisual() {
  return (
    <View className="w-full h-full justify-between items-center">
      <View className="bg-white/45 px-3 py-1 rounded-full self-center">
        <Text className="font-sans text-slate-800 text-xs font-bold tracking-[0.2px]">
          🌍 Global Receiving Accounts
        </Text>
      </View>

      {/* Main incoming transaction card */}
      <View className="w-full bg-white rounded-[18px] px-3.5 py-3 shadow-md">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full items-center justify-center bg-green-100">
            <Text className="text-green-600 font-extrabold text-base">↓</Text>
          </View>
          <View className="flex-1 ml-2.5">
            <Text className="font-sans text-sm font-bold text-gray-900">
              Stripe Inc.
            </Text>
            <Text className="font-sans text-xs text-gray-500 mt-0.5">
              US Client Direct Deposit
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-satoshi text-[15px] font-extrabold text-green-700">
              +$2,450.00
            </Text>
            <Text className="font-sans text-[11px] text-green-700 font-semibold mt-0.5">
              Completed ✓
            </Text>
          </View>
        </View>
      </View>

      {/* Second incoming transaction card */}
      <View className="w-full bg-white rounded-[18px] px-3.5 py-3 shadow-md mt-2.5 opacity-95">
        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full items-center justify-center bg-blue-100">
            <Text className="text-blue-600 font-extrabold text-base">↓</Text>
          </View>
          <View className="flex-1 ml-2.5">
            <Text className="font-sans text-sm font-bold text-gray-900">
              Deel Global
            </Text>
            <Text className="font-sans text-xs text-gray-500 mt-0.5">
              Monthly Salary (UK)
            </Text>
          </View>
          <View className="items-end">
            <Text className="font-satoshi text-[15px] font-extrabold text-blue-700">
              +£1,200.00
            </Text>
            <Text className="font-sans text-[11px] text-blue-700 font-semibold mt-0.5">
              Completed ✓
            </Text>
          </View>
        </View>
      </View>

      {/* Account pills row */}
      <View className="flex-row gap-2 justify-center w-full">
        <View className="bg-white/70 px-2.5 py-1 rounded-xl">
          <Text className="font-sans text-[11px] font-bold text-gray-800">
            🇺🇸 USD Account
          </Text>
        </View>
        <View className="bg-white/70 px-2.5 py-1 rounded-xl">
          <Text className="font-sans text-[11px] font-bold text-gray-800">
            🇬🇧 GBP Account
          </Text>
        </View>
        <View className="bg-white/70 px-2.5 py-1 rounded-xl">
          <Text className="font-sans text-[11px] font-bold text-gray-800">
            🇪🇺 EUR Account
          </Text>
        </View>
      </View>

      <View className="bg-slate-900/70 px-3.5 py-1.5 rounded-full">
        <Text className="font-sans text-white text-[11px] font-semibold">
          ⚡ Instant settlement • Dedicated account numbers
        </Text>
      </View>
    </View>
  );
}

// 2. FX Rates Visual
function FxRatesVisual() {
  return (
    <View className="w-full h-full justify-between items-center">
      <View className="bg-white/45 px-3 py-1 rounded-full self-center">
        <Text className="font-sans text-slate-800 text-xs font-bold tracking-[0.2px]">
          🔥 Live Market Conversion
        </Text>
      </View>

      <View className="w-full bg-white rounded-[18px] p-3.5 shadow-md">
        {/* Send row */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-sans text-[11px] text-gray-500 font-semibold uppercase">
              You convert
            </Text>
            <Text className="font-satoshi text-xl font-extrabold text-gray-900 mt-0.5">
              $1,000.00
            </Text>
          </View>
          <View className="bg-amber-100 px-2.5 py-1.5 rounded-xl">
            <Text className="font-sans text-xs font-bold text-amber-800">
              🇺🇸 USD
            </Text>
          </View>
        </View>

        {/* Swap indicator */}
        <View className="flex-row items-center my-2.5">
          <View className="flex-1 h-px bg-gray-200" />
          <View className="bg-brand px-2.5 py-1 rounded-xl mx-2">
            <Text className="font-sans text-white text-[11px] font-bold">
              1 USD = ₦1,550.00
            </Text>
          </View>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        {/* Receive row */}
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="font-sans text-[11px] text-gray-500 font-semibold uppercase">
              You receive
            </Text>
            <Text className="font-satoshi text-xl font-extrabold text-green-700 mt-0.5">
              ₦1,550,000.00
            </Text>
          </View>
          <View className="bg-sky-100 px-2.5 py-1.5 rounded-xl">
            <Text className="font-sans text-xs font-bold text-sky-700">
              🇳🇬 NGN
            </Text>
          </View>
        </View>
      </View>

      {/* Savings highlight */}
      <View className="w-full bg-emerald-50 border border-emerald-200 rounded-2xl py-2 px-3 items-center shadow-md">
        <Text className="font-sans text-[13px] font-bold text-emerald-900">
          🎉 Save up to ₦48,500
        </Text>
        <Text className="font-sans text-[11px] text-emerald-700 mt-0.5">
          Compared to traditional bank conversion rates
        </Text>
      </View>
    </View>
  );
}

// 3. Timing Vault Visual
function TimingVaultVisual() {
  return (
    <View className="w-full h-full justify-between items-center">
      <View className="bg-white/45 px-3 py-1 rounded-full self-center">
        <Text className="font-sans text-slate-800 text-xs font-bold tracking-[0.2px]">
          🔒 Multi-Currency Vaults
        </Text>
      </View>

      <View className="w-full bg-white rounded-[18px] p-4 shadow-md">
        <View className="flex-row justify-between items-center">
          <Text className="font-sans text-[13px] font-semibold text-gray-500">
            USD Reserve
          </Text>
          <View className="bg-green-100 px-2 py-0.5 rounded-lg">
            <Text className="font-sans text-[11px] font-bold text-green-600">
              Hedged 🛡️
            </Text>
          </View>
        </View>
        <Text className="font-satoshi text-[28px] font-extrabold text-gray-900 mt-1">
          $3,850.50
        </Text>
        <Text className="font-sans text-xs text-gray-600 mt-0.5">
          No forced naira conversion
        </Text>
      </View>

      <View className="flex-row gap-2.5 w-full">
        <View className="flex-1 bg-white/90 rounded-2xl p-2.5 shadow-md">
          <Text className="text-base">🇬🇧</Text>
          <Text className="font-sans text-[11px] font-semibold text-gray-500 mt-0.5">
            GBP Vault
          </Text>
          <Text className="font-satoshi text-[15px] font-extrabold text-gray-900 mt-0.5">
            £1,450.00
          </Text>
        </View>

        <View className="flex-1 bg-white/90 rounded-2xl p-2.5 shadow-md">
          <Text className="text-base">🇪🇺</Text>
          <Text className="font-sans text-[11px] font-semibold text-gray-500 mt-0.5">
            EUR Vault
          </Text>
          <Text className="font-satoshi text-[15px] font-extrabold text-gray-900 mt-0.5">
            €920.00
          </Text>
        </View>
      </View>

      <View className="bg-slate-900/70 px-3.5 py-1.5 rounded-full">
        <Text className="font-sans text-white text-[11px] font-semibold">
          ⏳ Hold for days, months, or convert anytime
        </Text>
      </View>
    </View>
  );
}

// 4. Subscriptions Visual
function SubscriptionsVisual() {
  return (
    <View className="w-full h-full justify-between items-center">
      <View className="bg-white/45 px-3 py-1 rounded-full self-center">
        <Text className="font-sans text-slate-800 text-xs font-bold tracking-[0.2px]">
          ✨ Zero Decline Subscriptions
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-2.5 w-full justify-between">
        <View className="w-[48%] bg-white rounded-2xl p-2.5 items-center shadow-md">
          <View className="w-8 h-8 rounded-full items-center justify-center bg-[#E50914]">
            <Text className="font-sans text-white font-extrabold text-sm">
              N
            </Text>
          </View>
          <Text className="font-sans text-[13px] font-bold text-gray-900 mt-1">
            Netflix
          </Text>
          <Text className="font-sans text-[11px] text-gray-500">$19.99/mo</Text>
          <Text className="font-sans text-[10px] font-bold text-green-700 mt-0.5">
            Paid ✓
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-2.5 items-center shadow-md">
          <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-900">
            <Text className="font-sans text-white font-extrabold text-sm">
              
            </Text>
          </View>
          <Text className="font-sans text-[13px] font-bold text-gray-900 mt-1">
            Apple
          </Text>
          <Text className="font-sans text-[11px] text-gray-500">$9.99/mo</Text>
          <Text className="font-sans text-[10px] font-bold text-green-700 mt-0.5">
            Paid ✓
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-2.5 items-center shadow-md">
          <View className="w-8 h-8 rounded-full items-center justify-center bg-[#10A37F]">
            <Text className="font-sans text-white font-extrabold text-sm">
              ⚡
            </Text>
          </View>
          <Text className="font-sans text-[13px] font-bold text-gray-900 mt-1">
            ChatGPT
          </Text>
          <Text className="font-sans text-[11px] text-gray-500">$20.00/mo</Text>
          <Text className="font-sans text-[10px] font-bold text-green-700 mt-0.5">
            Paid ✓
          </Text>
        </View>

        <View className="w-[48%] bg-white rounded-2xl p-2.5 items-center shadow-md">
          <View className="w-8 h-8 rounded-full items-center justify-center bg-[#4285F4]">
            <Text className="font-sans text-white font-extrabold text-sm">
              G
            </Text>
          </View>
          <Text className="font-sans text-[13px] font-bold text-gray-900 mt-1">
            Google
          </Text>
          <Text className="font-sans text-[11px] text-gray-500">$4.99/mo</Text>
          <Text className="font-sans text-[10px] font-bold text-green-700 mt-0.5">
            Paid ✓
          </Text>
        </View>
      </View>

      <View className="bg-slate-900/70 px-3.5 py-1.5 rounded-full">
        <Text className="font-sans text-white text-[11px] font-semibold">
          🛡️ 3D-Secure enabled for global acceptance
        </Text>
      </View>
    </View>
  );
}

// 5. Virtual Cards Visual
function VirtualCardsVisual() {
  return (
    <View className="w-full h-full justify-between items-center">
      <View className="bg-white/45 px-3 py-1 rounded-full self-center">
        <Text className="font-sans text-slate-800 text-xs font-bold tracking-[0.2px]">
          💳 Visa & Mastercard Cards
        </Text>
      </View>

      <View className="w-full h-[200px] items-center justify-center">
        {/* Background card (Mastercard) */}
        <View className="absolute top-0 w-[88%] h-[140px] bg-[#E05813] rounded-2xl p-3.5 shadow-md rotate-6 translate-x-3">
          <View className="flex-row justify-between">
            <Text className="font-sans text-white/70 text-[11px] font-bold">
              CHIPA MC
            </Text>
            <View className="flex-row">
              <View className="w-3.5 h-3.5 rounded-full bg-[#EB001B] -mr-1" />
              <View className="w-3.5 h-3.5 rounded-full bg-[#F79E1B]" />
            </View>
          </View>
          <Text className="font-satoshi text-white/80 text-xs mt-3 tracking-[2px]">
            •••• 7104
          </Text>
        </View>

        {/* Foreground main card (Visa) */}
        <View className="absolute top-5 w-[92%] h-[160px] bg-[#1E2433] rounded-[18px] p-3.5 border border-white/20 justify-between shadow-md">
          <View className="flex-row justify-between items-center">
            <Text className="font-satoshi text-white font-extrabold text-sm tracking-[1.5px]">
              CHIPA
            </Text>
            <Text className="font-sans text-white/60 text-[10px] font-bold tracking-widest">
              VIRTUAL
            </Text>
          </View>

          {/* Chip and contactless */}
          <View className="flex-row items-center gap-2">
            <View className="w-6 h-5 bg-amber-500 rounded justify-center items-center">
              <View className="w-4/5 h-px bg-black/30" />
            </View>
            <Text className="text-white/60 text-xs font-bold">))))</Text>
          </View>

          {/* Card number */}
          <Text className="font-satoshi text-white text-sm font-bold tracking-[2px]">
            •••• •••• •••• 4829
          </Text>

          {/* Card footer */}
          <View className="flex-row justify-between items-end">
            <View>
              <Text className="font-sans text-white/50 text-[8px] font-bold tracking-[0.5px]">
                CARDHOLDER
              </Text>
              <Text className="font-sans text-white text-[10px] font-bold">
                DANIEL CHUKWU
              </Text>
            </View>
            <View>
              <Text className="font-sans text-white/50 text-[8px] font-bold tracking-[0.5px]">
                EXPIRES
              </Text>
              <Text className="font-sans text-white text-[10px] font-bold">
                09/29
              </Text>
            </View>
            <Text className="font-satoshi text-white text-base font-black italic">
              VISA
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-slate-900/70 px-3.5 py-1.5 rounded-full">
        <Text className="font-sans text-white text-[11px] font-semibold">
          ❄️ Instant issue • Freeze & unfreeze in 1-tap
        </Text>
      </View>
    </View>
  );
}
