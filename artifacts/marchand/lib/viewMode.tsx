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

  // Force the mode for non-admins based on their role.
  useEffect(() => {
    if (!user) return;
    if (user.role === "restaurant_owner" && mode !== "merchant") {
      setModeState("merchant");
    } else if (user.role === "driver" && mode !== "driver") {
      setModeState("driver");
    } else if (user.role === "admin" && !mode) {
      setModeState("merchant");
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
