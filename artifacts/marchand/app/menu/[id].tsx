import { useQueryClient } from "@tanstack/react-query";
import {
  getListMenuItemsQueryKey,
  useDeleteMenuItem,
  useGetMenuItem,
  useUpdateMenuItem,
} from "@workspace/api-client-react";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Alert, View } from "react-native";

import { MenuItemForm } from "@/components/MenuItemForm";
import { useColors } from "@/hooks/useColors";
import { useRestaurant } from "@/lib/restaurant";

export default function EditMenuItem() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const itemId = Number(id);
  const qc = useQueryClient();
  const { selected } = useRestaurant();

  const { data, isLoading } = useGetMenuItem(itemId, {
    query: { enabled: !!itemId } as any,
  });

  const invalidate = () => {
    if (selected)
      qc.invalidateQueries({
        queryKey: getListMenuItemsQueryKey(selected.id),
      });
  };

  const update = useUpdateMenuItem({
    mutation: {
      onSuccess: () => {
        invalidate();
        router.back();
      },
      onError: (e: unknown) =>
        Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur"),
    },
  });

  const del = useDeleteMenuItem({
    mutation: {
      onSuccess: () => {
        invalidate();
        router.back();
      },
      onError: (e: unknown) =>
        Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur"),
    },
  });

  if (isLoading || !data) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <MenuItemForm
      initial={{
        name: data.name,
        description: data.description ?? "",
        price: String(data.price),
        category: data.category,
        imageUrl: data.imageUrl ?? "",
        isAvailable: data.isAvailable,
        isPopular: data.isPopular,
      }}
      submitting={update.isPending}
      submitLabel="Enregistrer"
      onSubmit={(v) => {
        const price = Number(v.price);
        if (!v.name.trim() || !v.category.trim() || !Number.isFinite(price) || price <= 0) {
          Alert.alert("Champs invalides", "Nom, catégorie et prix (>0) requis.");
          return;
        }
        update.mutate({
          id: itemId,
          data: {
            name: v.name.trim(),
            description: v.description.trim() || undefined,
            price,
            category: v.category.trim(),
            imageUrl: v.imageUrl.trim() || undefined,
            isAvailable: v.isAvailable,
            isPopular: v.isPopular,
          },
        });
      }}
      deleting={del.isPending}
      onDelete={() =>
        Alert.alert("Supprimer ce plat ?", "Cette action est définitive.", [
          { text: "Annuler", style: "cancel" },
          {
            text: "Supprimer",
            style: "destructive",
            onPress: () => del.mutate({ id: itemId }),
          },
        ])
      }
    />
  );
}
