import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import type { Driver } from "@workspace/api-client-react";
import React, {
  createContext,
  useContext,
  useMemo,
} from "react";

import { useAuth } from "./auth";
import { useViewMode } from "./viewMode";

const TOKEN_KEY = "marchand_token";

async function fetchMyDriver(): Promise<Driver | null> {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  const base = domain ? `https://${domain}` : "";
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${base}/api/drivers/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as Driver;
}

type Ctx = {
  driver: Driver | null;
  loading: boolean;
  error: unknown;
  refetch: () => void;
};

const DriverContext = createContext<Ctx | null>(null);

export function DriverProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const { mode } = useViewMode();
  const enabled = !!token && !!user && mode === "driver";

  const q = useQuery({
    queryKey: ["my-driver", user?.id ?? null],
    queryFn: fetchMyDriver,
    enabled,
    staleTime: 30_000,
  });

  const value = useMemo<Ctx>(
    () => ({
      driver: q.data ?? null,
      loading: q.isLoading,
      error: q.error,
      refetch: q.refetch,
    }),
    [q.data, q.isLoading, q.error, q.refetch],
  );

  return (
    <DriverContext.Provider value={value}>{children}</DriverContext.Provider>
  );
}

export function useDriver(): Ctx {
  const ctx = useContext(DriverContext);
  if (!ctx) throw new Error("useDriver must be used within DriverProvider");
  return ctx;
}
