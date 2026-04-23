import { useGetActiveOrders } from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { useDriver } from "@/lib/driver";
import { formatDate, formatMAD } from "@/lib/format";

export default function DriverActive() {
  const colors = useColors();
  const router = useRouter();
  const { driver, loading } = useDriver();

  const orders = useGetActiveOrders({
    query: { refetchInterval: 10_000, enabled: !!driver } as any,
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

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={orders.data ?? []}
      keyExtractor={(o) => String(o.id)}
      refreshControl={
        <RefreshControl
          refreshing={orders.isRefetching}
          onRefresh={orders.refetch}
        />
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          <Text style={{ color: colors.mutedForeground }}>
            Aucune livraison en cours.
          </Text>
        </View>
      }
      renderItem={({ item: o }) => (
        <Pressable
          onPress={() => router.push(`/orders/${o.id}`)}
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              #{o.id} · {o.restaurantName}
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Client : {o.userName} · {formatDate(o.createdAt)}
            </Text>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 13,
                marginTop: 6,
              }}
              numberOfLines={2}
            >
              {o.deliveryAddress}
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
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  title: { fontFamily: "Inter_500Medium", fontSize: 14 },
});
