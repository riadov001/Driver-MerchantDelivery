import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useColors } from "@/hooks/useColors";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DriverProvider } from "@/lib/driver";
import { RestaurantProvider } from "@/lib/restaurant";
import { ViewModeProvider, useViewMode } from "@/lib/viewMode";

SplashScreen.preventAutoHideAsync();

const domain = process.env.EXPO_PUBLIC_DOMAIN;
if (domain) {
  setBaseUrl(`https://${domain}`);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, token, user } = useAuth();
  const { mode, loading: modeLoading } = useViewMode();
  const segments = useSegments();
  const router = useRouter();
  const colors = useColors();

  useEffect(() => {
    if (loading || modeLoading) return;
    const seg0 = segments[0] as string | undefined;
    const inLogin = seg0 === "login";

    if (!token) {
      if (!inLogin) router.replace("/login");
      return;
    }

    if (inLogin) {
      router.replace(mode === "driver" ? "/(driver)" : "/(merchant)");
      return;
    }

    // Force users into a group consistent with their effective mode.
    const inMerchant = seg0 === "(merchant)";
    const inDriver = seg0 === "(driver)";
    const isSharedRoute = seg0 === "orders" || seg0 === "menu";
    if (isSharedRoute) return;

    if (mode === "driver" && !inDriver && (inMerchant || !seg0)) {
      router.replace("/(driver)");
    } else if (mode === "merchant" && !inMerchant && (inDriver || !seg0)) {
      router.replace("/(merchant)");
    } else if (!inMerchant && !inDriver && !seg0) {
      router.replace(mode === "driver" ? "/(driver)" : "/(merchant)");
    }
    // user role hints (safety)
    if (user?.role === "driver" && mode !== "driver" && inMerchant) {
      router.replace("/(driver)");
    }
    if (user?.role === "restaurant_owner" && mode !== "merchant" && inDriver) {
      router.replace("/(merchant)");
    }
  }, [loading, modeLoading, token, user, mode, segments, router]);

  if (loading || modeLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(merchant)" options={{ headerShown: false }} />
      <Stack.Screen name="(driver)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[id]" options={{ title: "Commande" }} />
      <Stack.Screen name="menu/new" options={{ title: "Nouveau plat" }} />
      <Stack.Screen name="menu/[id]" options={{ title: "Modifier le plat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <ViewModeProvider>
                  <RestaurantProvider>
                    <DriverProvider>
                      <AuthGate>
                        <RootLayoutNav />
                      </AuthGate>
                    </DriverProvider>
                  </RestaurantProvider>
                </ViewModeProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
