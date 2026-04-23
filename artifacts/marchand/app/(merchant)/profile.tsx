import { Feather } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { useRestaurant } from "@/lib/restaurant";
import { useViewMode } from "@/lib/viewMode";

export default function MerchantProfile() {
  const colors = useColors();
  const { user, signOut } = useAuth();
  const { selected, restaurants, selectId } = useRestaurant();
  const { mode, canSwitch, setMode } = useViewMode();

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
        <Text style={{ color: colors.primary, fontSize: 12, marginTop: 4, fontFamily: "Inter_500Medium" }}>
          Rôle : {user?.role}
        </Text>
      </View>

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

      {restaurants.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <Text style={{ color: colors.mutedForeground, fontSize: 12, marginBottom: 8 }}>
            Vos restaurants
          </Text>
          {restaurants.map((r) => {
            const active = selected?.id === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => selectId(r.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  gap: 8,
                }}
              >
                <Feather
                  name={active ? "check-circle" : "circle"}
                  size={18}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={{
                    color: colors.foreground,
                    fontFamily: active ? "Inter_600SemiBold" : "Inter_400Regular",
                  }}
                >
                  {r.name}
                </Text>
              </Pressable>
            );
          })}
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
