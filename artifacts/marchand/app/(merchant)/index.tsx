import {
  useGetRestaurantStats,
  useListOrders,
} from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMAD } from "@/lib/format";
import { useRestaurant } from "@/lib/restaurant";

export default function MerchantHome() {
  const colors = useColors();
  const router = useRouter();
  const { user } = useAuth();
  const { selected, restaurants, selectId, loading } = useRestaurant();

  const stats = useGetRestaurantStats(selected?.id ?? 0, {
    query: { enabled: !!selected } as any,
  });
  const orders = useListOrders(
    selected ? { restaurantId: selected.id } : undefined,
    { query: { enabled: !!selected, refetchInterval: 15000 } as any },
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!selected) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.mutedForeground, textAlign: "center" }}>
          Aucun restaurant associé à votre compte.
        </Text>
      </View>
    );
  }

  const recent = (orders.data ?? []).slice(0, 5);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
        Bonjour {user?.name?.split(" ")[0] ?? ""}
      </Text>
      <Text style={[styles.restaurantName, { color: colors.foreground }]}>
        {selected.name}
      </Text>

      {restaurants.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
        >
          {restaurants.map((r) => {
            const active = r.id === selected.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => selectId(r.id)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                  backgroundColor: active ? colors.accent : colors.background,
                }}
              >
                <Text
                  style={{
                    color: active ? colors.primary : colors.foreground,
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                  }}
                >
                  {r.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard
          label="En attente"
          value={stats.data?.pendingOrders ?? 0}
          color={colors.primary}
        />
        <StatCard
          label="Total commandes"
          value={stats.data?.totalOrders ?? 0}
          color={colors.foreground}
        />
        <StatCard
          label="Revenu"
          value={formatMAD(stats.data?.totalRevenue ?? 0)}
          color={colors.success}
          small
        />
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Commandes récentes
        </Text>
        <Pressable onPress={() => router.push("/(merchant)/orders")}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}>
            Voir tout
          </Text>
        </Pressable>
      </View>

      {orders.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
      ) : recent.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>
          Aucune commande pour le moment.
        </Text>
      ) : (
        recent.map((o) => (
          <Pressable
            key={o.id}
            onPress={() => router.push(`/orders/${o.id}`)}
            style={[
              styles.orderRow,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.orderTitle, { color: colors.foreground }]}>
                Commande #{o.id} · {o.userName}
              </Text>
              <Text
                style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 2 }}
              >
                {o.items.length} article(s) · {formatDate(o.createdAt)}
              </Text>
              <View style={{ marginTop: 6 }}>
                <StatusBadge status={o.status} />
              </View>
            </View>
            <Text
              style={{
                color: colors.foreground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {formatMAD(o.total)}
            </Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function StatCard({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: number | string;
  color: string;
  small?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{label}</Text>
      <Text
        style={{
          color,
          fontFamily: "Inter_700Bold",
          fontSize: small ? 16 : 22,
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
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  restaurantName: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  statsRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
  },
  orderTitle: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
