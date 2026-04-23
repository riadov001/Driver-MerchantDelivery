import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export type MenuFormValues = {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
};

export function emptyForm(): MenuFormValues {
  return {
    name: "",
    description: "",
    price: "",
    category: "Plats",
    imageUrl: "",
    isAvailable: true,
    isPopular: false,
  };
}

export function MenuItemForm({
  initial,
  submitting,
  onSubmit,
  submitLabel,
  onDelete,
  deleting,
}: {
  initial: MenuFormValues;
  submitting: boolean;
  onSubmit: (v: MenuFormValues) => void;
  submitLabel: string;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const colors = useColors();
  const [v, setV] = useState<MenuFormValues>(initial);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      >
        <Field
          label="Nom du plat"
          value={v.name}
          onChangeText={(t) => setV({ ...v, name: t })}
        />
        <Field
          label="Description"
          value={v.description}
          onChangeText={(t) => setV({ ...v, description: t })}
          multiline
        />
        <Field
          label="Catégorie"
          value={v.category}
          onChangeText={(t) => setV({ ...v, category: t })}
        />
        <Field
          label="Prix (DH)"
          value={v.price}
          onChangeText={(t) => setV({ ...v, price: t.replace(",", ".") })}
          keyboardType="decimal-pad"
        />
        <Field
          label="URL de l'image (optionnel)"
          value={v.imageUrl}
          onChangeText={(t) => setV({ ...v, imageUrl: t })}
          autoCapitalize="none"
        />

        <Toggle
          label="Disponible"
          value={v.isAvailable}
          onChange={(b) => setV({ ...v, isAvailable: b })}
        />
        <Toggle
          label="Populaire"
          value={v.isPopular}
          onChange={(b) => setV({ ...v, isPopular: b })}
        />

        <Pressable
          disabled={submitting}
          onPress={() => onSubmit(v)}
          style={[
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text
              style={{
                color: colors.primaryForeground,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {submitLabel}
            </Text>
          )}
        </Pressable>

        {onDelete ? (
          <Pressable
            disabled={deleting}
            onPress={onDelete}
            style={[
              styles.outlineBtn,
              { borderColor: colors.destructive, opacity: deleting ? 0.7 : 1 },
            ]}
          >
            <Text
              style={{ color: colors.destructive, fontFamily: "Inter_600SemiBold" }}
            >
              {deleting ? "Suppression..." : "Supprimer ce plat"}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
  keyboardType?: "default" | "decimal-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  const colors = useColors();
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: colors.foreground, fontSize: 13, marginBottom: 6, fontFamily: "Inter_500Medium" }}>
        {props.label}
      </Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        multiline={props.multiline}
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        placeholderTextColor={colors.mutedForeground}
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.card,
          color: colors.foreground,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: props.multiline ? 10 : 12,
          fontSize: 15,
          minHeight: props.multiline ? 80 : undefined,
          textAlignVertical: props.multiline ? "top" : "center",
          fontFamily: "Inter_400Regular",
        }}
      />
    </View>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: colors.foreground, fontFamily: "Inter_500Medium" }}>
        {label}
      </Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.border }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
});
