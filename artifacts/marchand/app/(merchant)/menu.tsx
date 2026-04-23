import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  getListMenuItemsQueryKey,
  useListMenuItems,
  useUpdateMenuItem,
} from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatMAD } from "@/lib/format";
import { useRestaurant } from "@/lib/restaurant";

export default function MerchantMenu() {
  const colors = useColors();
  const router = useRouter();
  const { selected } = useRestaurant();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useListMenuItems(
    selected?.id ?? 0,
    undefined,
    { query: { enabled: !!selected } as any },
  );

  const updateItem = useUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        if (selected)
          qc.invalidateQueries({
            queryKey: getListMenuItemsQueryKey(selected.id),
          });
      },
    },
  });

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
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(m) => String(m.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
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
              Aucun plat. Ajoutez votre premier plat.
            </Text>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Pressable
                style={{ flex: 1 }}
                onPress={() => router.push(`/menu/${item.id}`)}
              >
                <Text style={[styles.title, { color: colors.foreground }]}>
                  {item.name}
                </Text>
                <Text
                  style={{
                    color: colors.mutedForeground,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {item.category} · {formatMAD(item.price)}
                </Text>
              </Pressable>
              <Switch
                value={item.isAvailable}
                onValueChange={(v) =>
                  updateItem.mutate({
                    id: item.id,
                    data: { isAvailable: v },
                  })
                }
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>
          )}
        />
      )}
      <Pressable
        onPress={() => router.push("/menu/new")}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </Pressable>
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
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
