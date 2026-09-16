import { Stack, router, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "../context/AuthContext";

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  const segments = useSegments();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const firstSegment = segments[0] as string | undefined;

    const isAuthScreen =
      firstSegment === "login" ||
      firstSegment === "forgot-password" ||
      firstSegment === "reset-password";

    /*
     * USER IS NOT LOGGED IN
     */
    if (!isAuthenticated) {
      if (firstSegment === undefined || firstSegment === "index") {
        return;
      }

      if (isAuthScreen) {
        return;
      }

      router.replace("/login");
      return;
    }

    /*
     * USER IS LOGGED IN
     *
     * For now, use the existing working dashboard route.
     * We will connect the bottom tabs properly afterward.
     */
    if (
      firstSegment === undefined ||
      firstSegment === "index" ||
      isAuthScreen
    ) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#F5F7F6",
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
