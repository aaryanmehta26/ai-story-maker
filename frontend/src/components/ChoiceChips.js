import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export default function ChoiceChips({ label, value, options, onChange }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.grid}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              style={[styles.chip, active && styles.activeChip]}
              onPress={() => onChange(option)}
            >
              <Text style={[styles.chipText, active && styles.activeText]}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    justifyContent: "center"
  },
  activeChip: {
    backgroundColor: colors.blue,
    borderColor: colors.blue
  },
  chipText: {
    color: colors.text,
    fontWeight: "600"
  },
  activeText: {
    color: "#FFFFFF"
  }
});

