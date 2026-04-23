import { useLogin } from "@workspace/api-client-react";
import { Stack } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/lib/auth";
import { useViewMode } from "@/lib/viewMode";

const ALLOWED_ROLES = new Set(["restaurant_owner", "driver", "admin"]);

export default function LoginScreen() {
  const colors = useColors();
  const { signIn } = useAuth();
  const { setMode } = useViewMode();
  const [email, setEmail] = useState("owner@jatek.ma");
  const [password, setPassword] = useState("password123");

  const login = useLogin({
    mutation: {
      onSuccess: async (data) => {
        if (!ALLOWED_ROLES.has(data.user.role)) {
          Alert.alert(
            "Accès refusé",
            "Cette application est réservée aux marchands, livreurs et administrateurs.",
          );
          return;
        }
        if (data.user.role === "restaurant_owner") await setMode("merchant");
        else if (data.user.role === "driver") await setMode("driver");
        // admin keeps previous selected mode (default merchant)
        await signIn(data.token, data.user);
      },
      onError: (err: unknown) => {
        const msg = err instanceof Error ? err.message : "Erreur de connexion";
        Alert.alert("Connexion échouée", msg);
      },
    },
  });

  const submit = () => {
    if (!email.trim() || !password) {
      Alert.alert("Champs manquants", "Email et mot de passe requis.");
      return;
    }
    login.mutate({ data: { email: email.trim(), password } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={[styles.brand, { color: colors.primary }]}>Jatek</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Espace Pro
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Marchands, livreurs et administrateurs
          </Text>

          <View style={{ height: 24 }} />

          <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="vous@exemple.com"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />

          <Text style={[styles.label, { color: colors.foreground }]}>
            Mot de passe
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            style={[
              styles.input,
              {
                color: colors.foreground,
                borderColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          />

          <Pressable
            onPress={submit}
            disabled={login.isPending}
            style={[
              styles.button,
              {
                backgroundColor: colors.primary,
                opacity: login.isPending ? 0.7 : 1,
              },
            ]}
          >
            {login.isPending ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text
                style={[
                  styles.buttonText,
                  { color: colors.primaryForeground },
                ]}
              >
                Se connecter
              </Text>
            )}
          </Pressable>

          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Comptes de démo (mot de passe : password123) :{"\n"}
            owner@jatek.ma · driver@jatek.ma · admin@jatek.ma
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  brand: { fontSize: 36, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  title: { fontSize: 22, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  label: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  hint: {
    marginTop: 24,
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
