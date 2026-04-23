import { useQueryClient } from "@tanstack/react-query";
import {
  getGetActiveOrdersQueryKey,
  getGetAvailableOrdersQueryKey,
  useAcceptOrderDelivery,
  useGetAvailableOrders,
} from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
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

export default function DriverAvailable() {
  const colors = useColors();
  const router = useRouter();
  const qc = useQueryClient();
  const { driver, loading: driverLoading } = useDriver();

  const { data, isLoading, refetch, isRefetching, isError, error } =
    useGetAvailableOrders({
      query: { refetchInterval: 10_000, enabled: !!driver } as any,
    });

  const accept = useAcceptOrderDelivery({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetAvailableOrdersQueryKey() });
        qc.invalidateQueries({ queryKey: getGetActiveOrdersQueryKey() });
        Alert.alert("Commande acceptée", "Rendez-vous chez le restaurant.");
        router.push("/(driver)/active");
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : "Erreur";
        Alert.alert("Échec", msg);
      },
    },
  });

  if (driverLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!driver) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
          Profil livreur introuvable
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          Connectez-vous avec un compte livreur (rôle « driver »).
        </Text>
      </View>
    );
  }

  const onAccept = (orderId: number) => {
    Alert.alert(
      "Accepter cette livraison ?",
      `Commande #${orderId}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Accepter",
          onPress: () =>
            accept.mutate({
              id: orderId,
              data: { driverId: driver.id },
            }),
        },
      ],
    );
  };

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      data={data ?? []}
      keyExtractor={(o) => String(o.id)}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      ListEmptyComponent={
        <View style={{ alignItems: "center", marginTop: 60 }}>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : isError ? (
            <Text style={{ color: colors.destructive, textAlign: "center" }}>
              {error instanceof Error
                ? error.message
                : "Erreur de chargement."}
            </Text>
          ) : (
            <Text style={{ color: colors.mutedForeground }}>
              Aucune commande disponible pour le moment.
            </Text>
          )}
        </View>
      }
      renderItem={({ item: o }) => (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
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
                {o.items.length} article(s) · {formatDate(o.createdAt)}
              </Text>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 13,
                  marginTop: 6,
                }}
                numberOfLines={2}
              >
                <Text style={{ color: colors.mutedForeground }}>Livraison : </Text>
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
          </View>
          <Pressable
            onPress={() => onAccept(o.id)}
            disabled={accept.isPending}
            style={[
              styles.acceptBtn,
              { backgroundColor: colors.primary, opacity: accept.isPending ? 0.7 : 1 },
            ]}
          >
            <Text
              style={{
                color: colors.primaryForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Accepter la livraison
            </Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10 },
  title: { fontFamily: "Inter_500Medium", fontSize: 14 },
  acceptBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});
