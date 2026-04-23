import { useGetDriverEarnings } from "@workspace/api-client-react";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useDriver } from "@/lib/driver";
import { formatMAD } from "@/lib/format";

export default function DriverEarnings() {
  const colors = useColors();
  const { driver, loading } = useDriver();

  const earnings = useGetDriverEarnings(driver?.id ?? 0, {
    query: { enabled: !!driver } as any,
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!driver) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.mutedForeground }}>
          Profil livreur introuvable.
        </Text>
      </View>
    );
  }

  const e = earnings.data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl
          refreshing={earnings.isRefetching}
          onRefresh={earnings.refetch}
        />
      }
    >
      <View
        style={[
          styles.bigCard,
          { backgroundColor: colors.primary },
        ]}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 13, opacity: 0.85 }}>
          Aujourd'hui
        </Text>
        <Text
          style={{
            color: colors.primaryForeground,
            fontSize: 36,
            fontFamily: "Inter_700Bold",
            marginTop: 6,
          }}
        >
          {formatMAD(e?.today ?? 0)}
        </Text>
        <Text
          style={{
            color: colors.primaryForeground,
            opacity: 0.85,
            marginTop: 4,
            fontSize: 12,
          }}
        >
          {e?.completedToday ?? 0} livraison(s) terminée(s)
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
        <SmallStat label="Cette semaine" value={formatMAD(e?.thisWeek ?? 0)} />
        <SmallStat label="Ce mois" value={formatMAD(e?.thisMonth ?? 0)} />
      </View>

      <View
        style={[
          styles.totalCard,
          { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 },
        ]}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
          Total des livraisons
        </Text>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_700Bold",
            fontSize: 22,
            marginTop: 4,
          }}
        >
          {e?.totalDeliveries ?? 0}
        </Text>
      </View>
    </ScrollView>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.smallCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{label}</Text>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: "Inter_700Bold",
          fontSize: 18,
          marginTop: 4,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  bigCard: { borderRadius: 14, padding: 18 },
  smallCard: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12 },
  totalCard: { borderWidth: 1, borderRadius: 10, padding: 14 },
});
