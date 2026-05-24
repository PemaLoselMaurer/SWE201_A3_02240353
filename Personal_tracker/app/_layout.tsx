import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useExpenseStore } from '@/store/expenseStore';
import { LoadingSpinner } from '@/components/loading-spinner';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { rehydrate, hydrated, user } = useAuthStore();
  const rehydrateFilter = useExpenseStore((s) => s.rehydrateFilter);

  // Rehydrate persisted state before rendering main screens
  useEffect(() => {
    rehydrate();
    rehydrateFilter();
  }, []);

  // Redirect based on auth state once hydrated
  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/auth/login');
    }
  }, [hydrated, user]);

  if (!hydrated) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="expense/create" options={{ headerShown: false }} />
        <Stack.Screen name="expense/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
