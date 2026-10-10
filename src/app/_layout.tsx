import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/Toast';
import { StoreProvider, useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, primary: colors.primary, text: colors.text, border: colors.border },
};

function RootStack() {
  const { hydrated, profile } = useStore();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  const onboarded = !!profile;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={onboarded}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="log" options={{ presentation: 'modal' }} />
        <Stack.Screen name="live" options={{ gestureEnabled: false }} />
        <Stack.Screen name="run/[id]" />
        <Stack.Screen name="friend/[id]" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="friends" />
        <Stack.Screen name="food/add" />
        <Stack.Screen name="body" />
        <Stack.Screen name="strength" options={{ gestureEnabled: false }} />
        <Stack.Screen name="exercise/[id]" />
        <Stack.Screen name="sport/[sport]" />
        <Stack.Screen name="sport/log" options={{ gestureEnabled: false }} />
        <Stack.Screen name="sport/session/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!onboarded}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Screen name="invite/[code]" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <StoreProvider>
          <ToastProvider>
            <StatusBar style="light" />
            <RootStack />
          </ToastProvider>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
