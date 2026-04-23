import { useListOrders } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { formatDate, formatMAD } from "@/lib/format";
import { useRestaurant } from "@/lib/restaurant";

const FILTERS: Array<{ key: string | null; label: string }> = [
  { key: null, label: "Toutes" },
  { key: "pending", label: "En attente" },
  { key: "accepted", label: "Acceptées" },
  { key: "preparing", label: "En préparation" },
  { key: "ready", label: "Prêtes" },
  { key: "picked_up", label: "Récupérées" },
  { key: "delivered", label: "Livrées" },
];

export default function MerchantOrdersList() {
  const colors = useColors();
  const router = useRouter();
  const { selected } = useRestaurant();
  const [filter, setFilter] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useListOrders(
    selected
      ? { restaurantId: selected.id, ...(filter ? { status: filter } : {}) }
      : undefined,
    { query: { enabled: !!selected, refetchInterval: 15000 } as any },
  );

  if (!selected) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.mutedForeground }}>
          Sélectionnez un restaurant.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.label}
              onPress={() => setFilter(f.key)}
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
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(o) => String(o.id)}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <Text
              style={{
                color: colors.mutedForeground,
                textAlign: "center",
                marginTop: 40,
              }}
            >
              Aucune commande.
            </Text>
          }
          renderItem={({ item: o }) => (
            <Pressable
              onPress={() => router.push(`/orders/${o.id}`)}
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.foreground }]}>
                  #{o.id} · {o.userName}
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 12,
                    marginTop: 2,
                  }}
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
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  title: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
