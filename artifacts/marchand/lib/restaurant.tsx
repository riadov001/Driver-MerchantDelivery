import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useListRestaurants,
  type Restaurant,
} from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./auth";

const KEY = "marchand_selected_restaurant";

type Ctx = {
  loading: boolean;
  restaurants: Restaurant[];
  selected: Restaurant | null;
  selectId: (id: number) => Promise<void>;
  refetch: () => void;
};

const RestaurantContext = createContext<Ctx | null>(null);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v) setSelectedId(Number(v));
      setHydrated(true);
    });
  }, []);

  const enabled = !!token && !!user && user.role === "restaurant_owner";

  const { data, isLoading, refetch } = useListRestaurants(
    user ? { ownerId: user.id } : undefined,
    {
      query: { enabled, refetchOnWindowFocus: false } as any,
    },
  );

  const restaurants = useMemo<Restaurant[]>(() => data ?? [], [data]);

  useEffect(() => {
    if (!hydrated) return;
    if (restaurants.length === 0) return;
    if (!selectedId || !restaurants.some((r) => r.id === selectedId)) {
      const id = restaurants[0].id;
      setSelectedId(id);
      AsyncStorage.setItem(KEY, String(id));
    }
  }, [restaurants, hydrated, selectedId]);

  const selectId = useCallback(async (id: number) => {
    setSelectedId(id);
    await AsyncStorage.setItem(KEY, String(id));
  }, []);

  const selected = useMemo(
    () => restaurants.find((r) => r.id === selectedId) ?? null,
    [restaurants, selectedId],
  );

  const value = useMemo<Ctx>(
    () => ({
      loading: !hydrated || isLoading,
      restaurants,
      selected,
      selectId,
      refetch,
    }),
    [hydrated, isLoading, restaurants, selected, selectId, refetch],
  );

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant(): Ctx {
  const ctx = useContext(RestaurantContext);
  if (!ctx)
    throw new Error("useRestaurant must be used within RestaurantProvider");
  return ctx;
}
