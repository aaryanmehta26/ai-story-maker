import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

export default function Field({ label, value, onChangeText, placeholder, keyboardType = "default", multiline = false }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#98A2B3"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 16
  },
  multiline: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: "top"
  }
});

