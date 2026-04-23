import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setAuthTokenGetter,
  setOnUnauthorized,
  type User,
} from "@workspace/api-client-react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const TOKEN_KEY = "marchand_token";
const USER_KEY = "marchand_user";
const VIEW_MODE_KEY = "marchand_view_mode";
const SELECTED_RESTAURANT_KEY = "marchand_selected_restaurant";

let currentToken: string | null = null;

setAuthTokenGetter(() => currentToken);

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  token: string | null;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (t) {
          currentToken = t;
          setToken(t);
        }
        if (u) {
          try {
            setUser(JSON.parse(u));
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (newToken: string, newUser: User) => {
    currentToken = newToken;
    setToken(newToken);
    setUser(newUser);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
  }, []);

  const signOut = useCallback(async () => {
    currentToken = null;
    setToken(null);
    setUser(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
      AsyncStorage.removeItem(VIEW_MODE_KEY),
      AsyncStorage.removeItem(SELECTED_RESTAURANT_KEY),
    ]);
  }, []);

  // Global handler: any 401/403 from the API auto-signs the user out so the
  // AuthGate can redirect them to the login screen instead of leaving them
  // stranded with a stale token.
  const signOutRef = useRef(signOut);
  signOutRef.current = signOut;
  useEffect(() => {
    setOnUnauthorized((status) => {
      if (status === 401) {
        void signOutRef.current();
      }
    });
    return () => setOnUnauthorized(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ loading, token, user, signIn, signOut, setUser }),
    [loading, token, user, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
