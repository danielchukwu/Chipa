import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes cleanly, discarding falsy values and properly
 * resolving class conflicts according to Tailwind's specificity hierarchy.
 *
 * NOTE for React Native / NativeWind:
 * Keep shadow utilities (e.g. `shadow-sm`, `shadow-md`) in `style` or `StyleSheet`
 * rather than dynamic `cn` calls to avoid NativeWind 4.x runtime CSS-interop race conditions.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
