import { useQueryClient } from "@tanstack/react-query";
import {
  getGetActiveOrdersQueryKey,
  getGetAvailableOrdersQueryKey,
  getGetOrderQueryKey,
  getListOrdersQueryKey,
  UpdateOrderStatusBodyStatus,
  useConfirmOrderDelivery,
  useGetOrder,
  useUpdateOrderStatus,
} from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { StatusBadge } from "@/components/StatusBadge";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { formatDate, formatMAD, ORDER_STATUS_LABELS } from "@/lib/format";
import { useViewMode } from "@/lib/viewMode";

const MERCHANT_NEXT: Record<string, string | null> = {
  pending: "accepted",
  accepted: "preparing",
  preparing: "ready",
  ready: null, // waiting for driver
};

export default function OrderDetail() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = Number(id);
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { mode } = useViewMode();
  const [pickupCode, setPickupCode] = useState("");

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetOrder(orderId, {
    query: { enabled: !!orderId, refetchInterval: 10_000 } as any,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getGetOrderQueryKey(orderId) });
    qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    qc.invalidateQueries({ queryKey: getGetActiveOrdersQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAvailableOrdersQueryKey() });
  };

  const update = useUpdateOrderStatus({
    mutation: {
      onSuccess: invalidate,
      onError: (e: unknown) =>
        Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur"),
    },
  });

  const confirmDelivery = useConfirmOrderDelivery({
    mutation: {
      onSuccess: () => {
        invalidate();
        Alert.alert("Livré", "Livraison confirmée avec succès.");
        router.back();
      },
      onError: (e: unknown) =>
        Alert.alert("Code invalide", e instanceof Error ? e.message : "Erreur"),
    },
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (isError || !order) {
    const msg =
      error instanceof Error ? error.message : "Commande introuvable.";
    return (
      <View style={styles.center}>
        <Text
          style={{
            color: colors.foreground,
            fontFamily: "Inter_600SemiBold",
            textAlign: "center",
          }}
        >
          Impossible de charger la commande
        </Text>
        <Text
          style={{
            color: colors.mutedForeground,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {msg}
        </Text>
        <Pressable
          onPress={() => refetch()}
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary, marginTop: 16, paddingHorizontal: 24 },
          ]}
        >
          <Text
            style={{
              color: colors.primaryForeground,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            Réessayer
          </Text>
        </Pressable>
      </View>
    );
  }

  const isAdmin = user?.role === "admin";
  const showMerchantActions = mode === "merchant" || isAdmin;
  // Only show driver delivery-confirmation UI to actual drivers — admins in
  // driver mode have no driver profile and would 403/404 when posting the
  // pickup code.
  const showDriverActions = mode === "driver" && user?.role === "driver";
  const merchantNext = MERCHANT_NEXT[order.status];

  const setStatus = (next: string) => {
    update.mutate({
      id: orderId,
      data: { status: next as keyof typeof UpdateOrderStatusBodyStatus },
    });
  };

  const submitPickup = () => {
    if (!/^\d{4}$/.test(pickupCode)) {
      Alert.alert("Code invalide", "Le code de livraison contient 4 chiffres.");
      return;
    }
    confirmDelivery.mutate({ id: orderId, data: { pickupCode } });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.h1, { color: colors.foreground }]}>
            Commande #{order.id}
          </Text>
          <Text style={{ color: colors.mutedForeground, marginTop: 2, fontSize: 13 }}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <Section title="Restaurant">
        <Text style={{ color: colors.foreground }}>{order.restaurantName}</Text>
      </Section>

      <Section title="Client">
        <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
          {order.userName}
        </Text>
        <Text style={{ color: colors.mutedForeground, marginTop: 4 }}>
          {order.deliveryAddress}
        </Text>
        {order.notes ? (
          <Text style={{ color: colors.mutedForeground, marginTop: 4, fontStyle: "italic" }}>
            Note : {order.notes}
          </Text>
        ) : null}
      </Section>

      <Section title="Articles">
        {order.items.map((it) => (
          <View
            key={it.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingVertical: 6,
            }}
          >
            <Text style={{ color: colors.foreground, flex: 1 }}>
              {it.quantity} × {it.menuItemName}
            </Text>
            <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
              {formatMAD(it.totalPrice)}
            </Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 8 }} />
        <Row label="Sous-total" value={formatMAD(order.subtotal)} />
        <Row label="Livraison" value={formatMAD(order.deliveryFee)} />
        <Row label="Total" value={formatMAD(order.total)} bold />
      </Section>

      {showMerchantActions && merchantNext ? (
        <Pressable
          onPress={() => setStatus(merchantNext)}
          disabled={update.isPending}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
        >
          <Text
            style={{
              color: colors.primaryForeground,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            Marquer comme « {ORDER_STATUS_LABELS[merchantNext]} »
          </Text>
        </Pressable>
      ) : null}

      {showMerchantActions &&
      (order.status === "pending" || order.status === "accepted") ? (
        <Pressable
          onPress={() =>
            Alert.alert("Annuler la commande ?", "", [
              { text: "Non", style: "cancel" },
              {
                text: "Annuler la commande",
                style: "destructive",
                onPress: () => setStatus("cancelled"),
              },
            ])
          }
          style={[styles.outlineBtn, { borderColor: colors.destructive }]}
        >
          <Text
            style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold" }}
          >
            Annuler la commande
          </Text>
        </Pressable>
      ) : null}

      {showDriverActions && order.status === "picked_up" ? (
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              color: colors.mutedForeground,
              fontSize: 12,
              marginBottom: 6,
            }}
          >
            Code de livraison (4 chiffres, demandé au client)
          </Text>
          <TextInput
            value={pickupCode}
            onChangeText={(t) => setPickupCode(t.replace(/\D/g, "").slice(0, 4))}
            keyboardType="number-pad"
            placeholder="0000"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />
          <Pressable
            onPress={submitPickup}
            disabled={confirmDelivery.isPending}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
          >
            <Text
              style={{
                color: colors.primaryForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              Confirmer la livraison
            </Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        marginTop: 16,
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 14,
      }}
    >
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: colors.foreground,
          fontFamily: bold ? "Inter_700Bold" : "Inter_500Medium",
          fontSize: bold ? 16 : 13,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  h1: { fontFamily: "Inter_700Bold", fontSize: 22 },
  primaryBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 6,
    textAlign: "center",
  },
});
