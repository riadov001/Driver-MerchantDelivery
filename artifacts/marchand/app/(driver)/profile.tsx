import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateDriver } from "@workspace/api-client-react";
import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { useDriver } from "@/lib/driver";
import { useViewMode } from "@/lib/viewMode";

export default function DriverProfile() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { driver, refetch } = useDriver();
  const { mode, canSwitch, setMode } = useViewMode();
  const qc = useQueryClient();

  const update = useUpdateDriver({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["my-driver"] });
        refetch();
      },
      onError: (e: unknown) => {
        Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur");
      },
    },
  });

  const confirmLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Compte</Text>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name}</Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{user?.email}</Text>
      </View>

      {driver ? (
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>
                Disponibilité
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {driver.isAvailable ? "Vous recevez des commandes" : "Hors ligne"}
              </Text>
            </View>
            <Switch
              value={driver.isAvailable}
              onValueChange={(v) =>
                update.mutate({ id: driver.id, data: { isAvailable: v } })
              }
              trackColor={{ true: colors.primary, false: colors.border }}
            />
          </View>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />

          <Row label="Véhicule" value={driver.vehicleType ?? "—"} />
          <Row label="Plaque" value={driver.vehiclePlate ?? "—"} />
          <Row label="Note" value={driver.rating ? driver.rating.toFixed(1) : "—"} />
          <Row label="Total livraisons" value={String(driver.totalDeliveries)} />
        </View>
      ) : null}

      {canSwitch ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>Mode actif</Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            {(["merchant", "driver"] as const).map((m) => {
              const active = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active ? colors.accent : colors.background,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: active ? colors.primary : colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    {m === "merchant" ? "Marchand" : "Livreur"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={confirmLogout}
        style={[
          styles.logout,
          { borderColor: colors.destructive, marginTop: 24 },
        ]}
      >
        <Feather name="log-out" size={18} color={colors.destructive} />
        <Text
          style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold" }}
        >
          Se déconnecter
        </Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
      }}
    >
      <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 10, padding: 14 },
  name: { fontSize: 18, fontFamily: "Inter_600SemiBold", marginTop: 2 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
});
