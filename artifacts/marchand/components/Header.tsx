import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useViewMode } from "@/lib/viewMode";

export function ModeSwitcher() {
  const colors = useColors();
  const { mode, canSwitch, setMode } = useViewMode();

  if (!canSwitch) return null;

  const next: "merchant" | "driver" =
    mode === "driver" ? "merchant" : "driver";
  const label = mode === "driver" ? "Marchand" : "Livreur";
  const icon = mode === "driver" ? "shopping-bag" : "truck";

  return (
    <Pressable
      onPress={() => setMode(next)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginRight: 12,
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        backgroundColor: colors.accent,
      }}
    >
      <Feather name={icon as any} size={14} color={colors.primary} />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 12,
          color: colors.primary,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          width: 1,
          height: 12,
          backgroundColor: colors.primary,
          opacity: 0.3,
        }}
      />
      <Feather name="repeat" size={12} color={colors.primary} />
    </Pressable>
  );
}
