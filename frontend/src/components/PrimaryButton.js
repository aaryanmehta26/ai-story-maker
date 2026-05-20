import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export default function PrimaryButton({
  label,
  icon: Icon,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary"
}) {
  const buttonStyle = [
    styles.button,
    variant === "secondary" && styles.secondary,
    variant === "danger" && styles.danger,
    disabled && styles.disabled
  ];

  const textStyle = [styles.label, variant === "secondary" && styles.secondaryLabel];
  const iconColor = variant === "secondary" ? colors.primary : "#FFFFFF";

  return (
    <Pressable style={buttonStyle} onPress={onPress} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.content}>
          {Icon ? <Icon size={18} color={iconColor} /> : null}
          <Text style={textStyle}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  secondary: {
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.primary
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  },
  secondaryLabel: {
    color: colors.primary
  }
});

