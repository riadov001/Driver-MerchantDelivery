import { useQueryClient } from "@tanstack/react-query";
import {
  getListMenuItemsQueryKey,
  useCreateMenuItem,
} from "@workspace/api-client-react";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, Text, View } from "react-native";

import { emptyForm, MenuItemForm } from "@/components/MenuItemForm";
import { useColors } from "@/hooks/useColors";
import { useRestaurant } from "@/lib/restaurant";

export default function NewMenuItem() {
  const colors = useColors();
  const router = useRouter();
  const { selected } = useRestaurant();
  const qc = useQueryClient();

  const create = useCreateMenuItem({
    mutation: {
      onSuccess: () => {
        if (selected)
          qc.invalidateQueries({
            queryKey: getListMenuItemsQueryKey(selected.id),
          });
        router.back();
      },
      onError: (e: unknown) =>
        Alert.alert("Erreur", e instanceof Error ? e.message : "Erreur"),
    },
  });

  if (!selected) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        <Text style={{ color: colors.mutedForeground }}>
          Sélectionnez un restaurant.
        </Text>
      </View>
    );
  }

  return (
    <MenuItemForm
      initial={emptyForm()}
      submitting={create.isPending}
      submitLabel="Créer le plat"
      onSubmit={(v) => {
        const price = Number(v.price);
        if (!v.name.trim() || !v.category.trim() || !Number.isFinite(price) || price <= 0) {
          Alert.alert(
            "Champs invalides",
            "Nom, catégorie et prix (>0) sont requis.",
          );
          return;
        }
        create.mutate({
          restaurantId: selected.id,
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
    />
  );
}
