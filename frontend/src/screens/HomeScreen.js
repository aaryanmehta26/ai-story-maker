import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { BookOpen, Library, Sparkles } from "lucide-react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

const heroImage =
  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <ImageBackground source={{ uri: heroImage }} resizeMode="cover" style={styles.hero}>
        <View style={styles.overlay}>
          <View style={styles.brandRow}>
            <BookOpen size={24} color="#FFFFFF" />
            <Text style={styles.brand}>Little Story Maker</Text>
          </View>
          <Text style={styles.title}>Personal bedtime stories in minutes.</Text>
          <Text style={styles.subtitle}>
            Create gentle AI stories for children, then read or listen together.
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.actions}>
        <PrimaryButton
          label="Create a Story"
          icon={Sparkles}
          onPress={() => navigation.navigate("CreateStory")}
        />
        <PrimaryButton
          label="Open Library"
          icon={Library}
          variant="secondary"
          onPress={() => navigation.navigate("StoryLibrary")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  hero: {
    minHeight: "72%",
    justifyContent: "flex-end",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(14, 25, 33, 0.44)",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18
  },
  brand: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 38,
    lineHeight: 44,
    maxWidth: 360
  },
  subtitle: {
    color: "#F2F4F7",
    fontSize: 17,
    lineHeight: 24,
    marginTop: 12,
    maxWidth: 350
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md
  }
});

