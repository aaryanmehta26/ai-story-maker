import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { Headphones, Pencil, RefreshCcw } from "lucide-react-native";
import { api } from "../api/client";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

export default function StoryPreviewScreen({ navigation, route }) {
  const [story, setStory] = useState(route.params?.story);
  const [audioLoading, setAudioLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const inputs = route.params?.inputs;

  async function generateAudio({ navigateWhenReady = true } = {}) {
    setAudioLoading(true);
    try {
      const { story: updatedStory } = await api.generateAudio(story.storyId);
      const storyWithAudio = updatedStory.audioUrl
        ? updatedStory
        : await api.waitForAudio(story.storyId);
      setStory(storyWithAudio);
      if (navigateWhenReady) {
        navigation.navigate("AudioPlayer", { story: storyWithAudio });
      }
    } catch (error) {
      Alert.alert("Could not create audio", error.message);
    } finally {
      setAudioLoading(false);
    }
  }

  async function regenerate() {
    if (!inputs) {
      return;
    }

    setRegenerating(true);
    try {
      const { story: newStory } = await api.generateStory({ ...inputs, generateAudioNow: false });
      setStory(newStory);
      navigation.setParams({ story: newStory });
    } catch (error) {
      Alert.alert("Could not regenerate story", error.message);
    } finally {
      setRegenerating(false);
    }
  }

  if (!story) {
    return null;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.meta}>
          Age {story.childAge} · {story.genre} · {story.setting}
        </Text>
        <Text style={styles.story}>{story.textContent}</Text>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={story.audioUrl ? "Play Audio" : "Make Audio"}
          icon={Headphones}
          onPress={story.audioUrl ? () => navigation.navigate("AudioPlayer", { story }) : generateAudio}
          loading={audioLoading}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <PrimaryButton
              label="Regenerate"
              icon={RefreshCcw}
              variant="secondary"
              onPress={regenerate}
              loading={regenerating}
              disabled={!inputs}
            />
          </View>
          <View style={styles.half}>
            <PrimaryButton
              label="Edit"
              icon={Pencil}
              variant="secondary"
              onPress={() => navigation.navigate("CreateStory", { initialValues: inputs || story })}
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
  content: {
    padding: spacing.lg,
    paddingBottom: 170
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
    marginTop: 8,
    marginBottom: 18
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
