import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/lib/theme';

const Ctx = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();
  const show = useCallback((m: string) => {
    setMessage(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {message ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 12, left: 16, right: 16, alignItems: 'center' }}>
          <View style={{ backgroundColor: colors.text, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, maxWidth: 480 }}>
            <Text style={{ color: colors.bg, fontWeight: '700', fontSize: 15 }} testID="toast">
              {message}
            </Text>
          </View>
        </View>
      ) : null}
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
