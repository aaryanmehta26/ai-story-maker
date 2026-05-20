import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Headphones, Pencil, Trash2 } from "lucide-react-native";
import { api } from "../api/client";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

export default function StoryDetailScreen({ navigation, route }) {
  const { storyId } = route.params;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadStory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStory(storyId);
      setStory(data.story);
    } catch (error) {
      Alert.alert("Could not load story", error.message);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useFocusEffect(
    useCallback(() => {
      loadStory();
    }, [loadStory])
  );

  async function ensureAudio() {
    if (!story) return;

    if (story.audioUrl) {
      navigation.navigate("AudioPlayer", { story });
      return;
    }

    setAudioLoading(true);
    try {
      const { story: updatedStory } = await api.generateAudio(story.storyId);
      const storyWithAudio = updatedStory.audioUrl
        ? updatedStory
        : await api.waitForAudio(story.storyId);
      setStory(storyWithAudio);
      navigation.navigate("AudioPlayer", { story: storyWithAudio });
    } catch (error) {
      Alert.alert("Could not create audio", error.message);
    } finally {
      setAudioLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert("Delete story?", "This removes the story from your library.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await api.deleteStory(story.storyId);
            navigation.goBack();
          } catch (error) {
            Alert.alert("Could not delete story", error.message);
          } finally {
            setDeleting(false);
          }
        }
      }
    ]);
  }

  if (loading || !story) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.meta}>
          Age {story.childAge} · {story.genre} · {story.setting}
        </Text>
        <View style={styles.facts}>
          <Text style={styles.fact}>Topic: {story.topic}</Text>
          <Text style={styles.fact}>Moral: {story.moral}</Text>
          <Text style={styles.fact}>Characters: {story.characters}</Text>
        </View>
        <Text style={styles.story}>{story.textContent}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={story.audioUrl ? "Play Audio" : "Make Audio"}
          icon={Headphones}
          onPress={ensureAudio}
          loading={audioLoading}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <PrimaryButton
              label="Edit"
              icon={Pencil}
              variant="secondary"
              onPress={() => navigation.navigate("CreateStory", { initialValues: story })}
            />
          </View>
          <View style={styles.half}>
            <PrimaryButton
              label="Delete"
              icon={Trash2}
              variant="danger"
              onPress={confirmDelete}
              loading={deleting}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 172
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900"
  },
  meta: {
    color: colors.blue,
    fontWeight: "700",
    marginTop: 8
  },
  facts: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGold,
    padding: 14,
    gap: 6,
    marginVertical: 18
  },
  fact: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  story: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 28
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background
  },
  row: {
    flexDirection: "row",
    gap: 10
  },
  half: {
    flex: 1
  }
});
