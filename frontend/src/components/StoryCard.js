import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BookOpen, Headphones } from "lucide-react-native";
import { colors, shadow } from "../theme";

export default function StoryCard({ story, onPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <BookOpen size={20} color={colors.primary} />
        {story.audioUrl ? <Headphones size={19} color={colors.accent} /> : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        Age {story.childAge} · {story.genre} · {story.setting}
      </Text>
      <Text style={styles.preview} numberOfLines={3}>
        {story.textContent}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    ...shadow
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800"
  },
  meta: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: "700"
  },
  preview: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  }
});

