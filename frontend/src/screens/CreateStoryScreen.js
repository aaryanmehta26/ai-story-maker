import React, { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";
import { api } from "../api/client";
import ChoiceChips from "../components/ChoiceChips";
import Field from "../components/Field";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing } from "../theme";

const genres = ["Funny", "Adventure", "Fantasy", "Moral", "Comedy", "Light spooky"];
const settings = ["Forest", "City", "School", "Space", "Village", "Beach"];
const formats = ["text", "audio", "both"];

const defaults = {
  childAge: "6",
  topic: "",
  moral: "",
  characters: "",
  genre: "Adventure",
  setting: "Forest",
  authorStyle: "",
  storyFormat: "both",
  generateAudioNow: true
};

export default function CreateStoryScreen({ navigation, route }) {
  const initial = route.params?.initialValues || {};
  const [form, setForm] = useState({ ...defaults, ...normalizeInitial(initial) });
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const canSubmit = useMemo(() => {
    return (
      Number(form.childAge) >= 4 &&
      Number(form.childAge) <= 12 &&
      form.topic.trim() &&
      form.moral.trim() &&
      form.characters.trim() &&
      form.setting.trim() &&
      form.genre.trim()
    );
  }, [form]);

  const update = (key, value) =>
    setForm((current) => {
      if (key === "storyFormat") {
        return {
          ...current,
          storyFormat: value,
          generateAudioNow: value !== "text"
        };
      }

      return { ...current, [key]: value };
    });

  async function generate() {
    setLoading(true);
    setLoadingMessage("Writing story...");
    try {
      const payload = {
        ...form,
        childAge: Number(form.childAge),
        generateAudioNow: form.storyFormat !== "text" && form.generateAudioNow
      };
      const { story } = await api.generateStory(payload);
      let completedStory = story;

      if (payload.generateAudioNow) {
        setLoadingMessage("Creating audio...");
        const { story: audioStory } = await api.generateAudio(story.storyId);
        completedStory = audioStory.audioUrl ? audioStory : await api.waitForAudio(story.storyId);
      }

      navigation.navigate("StoryPreview", { story: completedStory, inputs: payload });
    } catch (error) {
      Alert.alert("Could not create story", error.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.title}>Story details</Text>
          <Text style={styles.subtitle}>A few thoughtful choices are enough for a child-safe draft.</Text>
        </View>

        <Field
          label="Child age"
          value={form.childAge}
          keyboardType="number-pad"
          onChangeText={(value) => update("childAge", value.replace(/[^0-9]/g, ""))}
          placeholder="4-12"
        />
        <Field
          label="Story topic"
          value={form.topic}
          onChangeText={(value) => update("topic", value)}
          placeholder="Friendship, confidence, sharing"
        />
        <Field
          label="Lesson or moral"
          value={form.moral}
          onChangeText={(value) => update("moral", value)}
          placeholder="Sharing is caring"
        />
        <Field
          label="Main characters"
          value={form.characters}
          onChangeText={(value) => update("characters", value)}
          placeholder="Maya, a rabbit, and a helpful robot"
          multiline
        />
        <ChoiceChips label="Genre" value={form.genre} options={genres} onChange={(value) => update("genre", value)} />
        <ChoiceChips
          label="Setting"
          value={form.setting}
          options={settings}
          onChange={(value) => update("setting", value)}
        />
        <Field
          label="Favourite author or style"
          value={form.authorStyle}
          onChangeText={(value) => update("authorStyle", value)}
          placeholder="Gentle, funny, magical, poetic"
        />
        <ChoiceChips
          label="Story format"
          value={form.storyFormat}
          options={formats}
          onChange={(value) => update("storyFormat", value)}
        />

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>Create audio now</Text>
            <Text style={styles.toggleHint}>You can also generate audio later from the preview.</Text>
          </View>
          <Switch
            value={form.generateAudioNow}
            onValueChange={(value) => update("generateAudioNow", value)}
            disabled={form.storyFormat === "text"}
            trackColor={{ false: "#D0D5DD", true: colors.softGreen }}
            thumbColor={form.generateAudioNow ? colors.primary : "#FFFFFF"}
          />
        </View>

        <PrimaryButton
          label={loadingMessage || "Generate Story"}
          icon={Sparkles}
          onPress={generate}
          disabled={!canSubmit}
          loading={loading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function normalizeInitial(initial) {
  const normalized = { ...initial };
  if (initial.childAge) {
    normalized.childAge = String(initial.childAge);
  }
  return normalized;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md
  },
  intro: {
    gap: 6,
    marginBottom: 4
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  toggleRow: {
    minHeight: 70,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16
  },
  toggleText: {
    flex: 1,
    gap: 4
  },
  toggleTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15
  },
  toggleHint: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
