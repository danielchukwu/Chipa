/**
 * High-quality verified direct PNG image URLs for Nigerian service providers.
 * Sources:
 * - PaystackHQ/nigerialogos CDN
 * - ichtrojan/nigerian-banks CDN
 * - Seeklogo CDN
 * - Official utility web domains
 */

export const TELCO_LOGOS = {
  mtn: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/mtn/mtn.png',
  airtel: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/airtel/airtel.png',
  glo: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/glo/glo.png',
  '9mobile': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/9mobile/9mobile.png',
} as const;

export type TelcoProviderKey = keyof typeof TELCO_LOGOS;

export const TV_LOGOS = {
  dstv: 'https://images.seeklogo.com/logo-png/52/2/dstv-logo-png_seeklogo-528512.png',
  gotv: 'https://images.seeklogo.com/logo-png/49/1/gotv-logo-png_seeklogo-496045.png',
  startimes: 'https://images.seeklogo.com/logo-png/35/1/startimes-logo-png_seeklogo-354934.png',
  showmax: 'https://images.seeklogo.com/logo-png/28/2/showmax-logo-png_seeklogo-289506.png',
  startimes_on: 'https://images.seeklogo.com/logo-png/35/1/startimes-logo-png_seeklogo-354934.png',
} as const;

export type TvProviderKey = keyof typeof TV_LOGOS;

export const ELECTRICITY_LOGOS = {
  aedc: 'https://www.abujaelectricity.com/wp-content/uploads/2024/03/header_white_logo.png',
  ibedc: 'https://ibedc.com/filesupload/69c80acabfdb59.12308302.jpg',
  ekedc: 'https://ekedp.com/front/assets/images/resources/logo-1.png',
  ikedc: 'https://www.kindpng.com/picc/m/629-6292350_ikeja-electricity-hd-png-download.png',
  kedco: 'https://kedco.ng/wp-content/uploads/2024/07/cropped-KEDCO-LOGO.png',
  jed: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/access_bank/access_bank.png', // fallback
  phed: 'https://www.abujaelectricity.com/wp-content/uploads/2024/03/header_white_logo.png', // fallback
  kaedco: 'https://kedco.ng/wp-content/uploads/2024/07/cropped-KEDCO-LOGO.png', // fallback
  eedc: 'https://ekedp.com/front/assets/images/resources/logo-1.png', // fallback
  bedc: 'https://ibedc.com/filesupload/69c80acabfdb59.12308302.jpg', // fallback
  yedc: 'https://www.abujaelectricity.com/wp-content/uploads/2024/03/header_white_logo.png', // fallback
  startimes_energy: 'https://images.seeklogo.com/logo-png/35/1/startimes-logo-png_seeklogo-354934.png',
} as const;

export type ElectricityProviderKey = keyof typeof ELECTRICITY_LOGOS;

export const BANK_LOGOS: Record<string, string> = {
  opay: 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/paycom.png',
  paycom: 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/paycom.png',
  palmpay: 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/palmpay.png',
  moniepoint: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/moniepoint/moniepoint.png',
  'moniepoint-mfb-ng': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/moniepoint/moniepoint.png',
  kuda: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/kuda_bank/kuda_bank.png',
  'kuda-bank': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/kuda_bank/kuda_bank.png',
  access: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/access_bank/access_bank.png',
  'access-bank': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/access_bank/access_bank.png',
  firstbank: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/first_bank/first_bank.png',
  'first-bank-of-nigeria': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/first_bank/first_bank.png',
  zenith: 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/zenith_bank/zenith_bank.png',
  'zenith-bank': 'https://raw.githubusercontent.com/PaystackHQ/nigerialogos/master/public/logos/zenith_bank/zenith_bank.png',
  gtbank: 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/guaranty-trust-bank.png',
  'guaranty-trust-bank': 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/guaranty-trust-bank.png',
  uba: 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/united-bank-for-africa.png',
  'united-bank-for-africa': 'https://raw.githubusercontent.com/ichtrojan/nigerian-banks/master/logos/united-bank-for-africa.png',
};

export function getTelcoLogoUrl(provider: string): string {
  const key = provider.toLowerCase() as TelcoProviderKey;
  return TELCO_LOGOS[key] || TELCO_LOGOS.mtn;
}

export function getTvLogoUrl(provider: string): string {
  const key = provider.toLowerCase() as TvProviderKey;
  return TV_LOGOS[key] || TV_LOGOS.dstv;
}

export function getElectricityLogoUrl(provider: string): string {
  const key = provider.toLowerCase() as ElectricityProviderKey;
  return ELECTRICITY_LOGOS[key] || ELECTRICITY_LOGOS.aedc;
}

export function getBankLogoUrl(bankKey: string): string {
  const normalized = bankKey.toLowerCase().trim();
  return (
    BANK_LOGOS[normalized] ||
    BANK_LOGOS.opay
  );
}
