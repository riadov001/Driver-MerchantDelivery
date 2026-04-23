import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { ORDER_STATUS_LABELS } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const colors = useColors();
  const map: Record<string, { bg: string; fg: string }> = {
    pending: { bg: "#fef3c7", fg: "#92400e" },
    accepted: { bg: "#dbeafe", fg: "#1e40af" },
    preparing: { bg: "#e0e7ff", fg: "#3730a3" },
    ready: { bg: "#dcfce7", fg: "#166534" },
    picked_up: { bg: "#fef3c7", fg: "#92400e" },
    delivered: { bg: "#dcfce7", fg: "#166534" },
    cancelled: { bg: "#fee2e2", fg: "#991b1b" },
  };
  const c = map[status] ?? { bg: colors.muted, fg: colors.mutedForeground };
  return (
    <View
      style={{
        backgroundColor: c.bg,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: c.fg, fontSize: 11, fontFamily: "Inter_600SemiBold" }}>
        {ORDER_STATUS_LABELS[status] ?? status}
      </Text>
    </View>
  );
}
