import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "./auth";

export type ViewMode = "merchant" | "driver";
const KEY = "marchand_view_mode";

type Ctx = {
  loading: boolean;
  mode: ViewMode | null;
  canSwitch: boolean;
  setMode: (m: ViewMode) => Promise<void>;
};

const ViewModeContext = createContext<Ctx | null>(null);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mode, setModeState] = useState<ViewMode | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v === "merchant" || v === "driver") setModeState(v);
      setHydrated(true);
    });
  }, []);

  // Force the mode for non-admins based on their role, and persist so the
  // stored value never disagrees with the active role on next launch.
  useEffect(() => {
    if (!user) return;
    let forced: ViewMode | null = null;
    if (user.role === "restaurant_owner" && mode !== "merchant") {
      forced = "merchant";
    } else if (user.role === "driver" && mode !== "driver") {
      forced = "driver";
    } else if (user.role === "admin" && !mode) {
      forced = "merchant";
    }
    if (forced) {
      setModeState(forced);
      AsyncStorage.setItem(KEY, forced).catch(() => {});
    }
  }, [user, mode]);

  const setMode = useCallback(async (m: ViewMode) => {
    setModeState(m);
    await AsyncStorage.setItem(KEY, m);
  }, []);

  const canSwitch = user?.role === "admin";

  const value = useMemo<Ctx>(
    () => ({ loading: !hydrated, mode, canSwitch, setMode }),
    [hydrated, mode, canSwitch, setMode],
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode(): Ctx {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}
