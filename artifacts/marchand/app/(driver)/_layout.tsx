import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

import { ModeSwitcher } from "@/components/Header";
import { useColors } from "@/hooks/useColors";

export default function DriverTabsLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          color: colors.foreground,
          fontFamily: "Inter_600SemiBold",
        },
        headerRight: () => <ModeSwitcher />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Disponibles",
          tabBarIcon: ({ color }) => (
            <Feather name="package" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="active"
        options={{
          title: "En cours",
          tabBarIcon: ({ color }) => (
            <Feather name="navigation" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Gains",
          tabBarIcon: ({ color }) => (
            <Feather name="trending-up" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={20} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
