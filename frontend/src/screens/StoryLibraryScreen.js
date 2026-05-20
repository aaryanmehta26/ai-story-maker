import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Sparkles } from "lucide-react-native";
import { api } from "../api/client";
import PrimaryButton from "../components/PrimaryButton";
import StoryCard from "../components/StoryCard";
import { colors, spacing } from "../theme";

export default function StoryLibraryScreen({ navigation }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listStories();
      setStories(data.stories || []);
    } catch (error) {
      Alert.alert("Could not load stories", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item.storyId}
        contentContainerStyle={stories.length ? styles.list : styles.emptyWrap}
        renderItem={({ item }) => (
          <StoryCard
            story={item}
            onPress={() =>
              navigation.navigate("StoryDetail", { storyId: item.storyId })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No saved stories yet</Text>
            <Text style={styles.emptyText}>
              Generated stories will appear here automatically.
            </Text>
            <PrimaryButton
              label="Create First Story"
              icon={Sparkles}
              onPress={() => navigation.navigate("CreateStory")}
            />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  emptyWrap: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  empty: {
    gap: spacing.md,
    alignItems: "stretch",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
