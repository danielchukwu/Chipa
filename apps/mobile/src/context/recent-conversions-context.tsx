import React, { createContext, useCallback, useContext, useState } from 'react';

export interface RecentConversion {
  id: string;
  from: string;
  to: string;
  displayTo?: string;
  toFlag?: string;
  fromFlag?: string;
  timestamp?: number;
}

export const INITIAL_RECENT_CONVERSIONS: RecentConversion[] = [
  {
    id: 'conv_1',
    from: 'NGN',
    to: 'USD',
  },
  {
    id: 'conv_2',
    from: 'NGN',
    to: 'USD',
    toFlag: 'UK', // Matches screenshot: UK flag with USD text
  },
  {
    id: 'conv_3',
    from: 'USD',
    to: 'NGN',
  },
];

interface RecentConversionsContextType {
  recentConversions: RecentConversion[];
  addRecentConversion: (
    from: string,
    to: string,
    options?: { toFlag?: string; displayTo?: string }
  ) => void;
  clearRecentConversions: () => void;
}

const RecentConversionsContext = createContext<RecentConversionsContextType | undefined>(
  undefined
);

export function RecentConversionsProvider({ children }: { children: React.ReactNode }) {
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>(
    INITIAL_RECENT_CONVERSIONS
  );

  const addRecentConversion = useCallback(
    (
      from: string,
      to: string,
      options?: { toFlag?: string; displayTo?: string }
    ) => {
      setRecentConversions((prev) => {
        const filtered = prev.filter(
          (item) => !(item.from === from && item.to === to)
        );
        const newItem: RecentConversion = {
          id: `conv_${Date.now()}`,
          from,
          to,
          toFlag: options?.toFlag,
          displayTo: options?.displayTo,
          timestamp: Date.now(),
        };
        return [newItem, ...filtered];
      });
    },
    []
  );

  const clearRecentConversions = useCallback(() => {
    setRecentConversions([]);
  }, []);

  return (
    <RecentConversionsContext.Provider
      value={{
        recentConversions,
        addRecentConversion,
        clearRecentConversions,
      }}>
      {children}
    </RecentConversionsContext.Provider>
  );
}

export function useRecentConversions() {
  const context = useContext(RecentConversionsContext);
  if (!context) {
    throw new Error('useRecentConversions must be used within a RecentConversionsProvider');
  }
  return context;
}
