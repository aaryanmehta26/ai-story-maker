import React, { useEffect, useMemo } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Play, RotateCcw } from "lucide-react-native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, spacing, shadow } from "../theme";

export default function AudioPlayerScreen({ route }) {
  const { story } = route.params;
  const source = useMemo(() => (story.audioUrl ? { uri: story.audioUrl } : null), [story.audioUrl]);
  const player = useAudioPlayer(source, 500);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      shouldRouteThroughEarpiece: false
    }).catch((error) => {
      Alert.alert("Could not configure audio", error.message);
    });
  }, [story.audioUrl]);

  function togglePlayback() {
    if (!story.audioUrl || !status.isLoaded) {
      Alert.alert("Audio unavailable", "Generate audio for this story first.");
      return;
    }

    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) {
        player.seekTo(0).then(() => player.play());
        return;
      }
      player.play();
    }
  }

  async function restart() {
    if (!story.audioUrl || !status.isLoaded) {
      return;
    }
    await player.seekTo(0);
    player.play();
  }

  const position = (status.currentTime || 0) * 1000;
  const duration = Math.max(1, (status.duration || 0) * 1000);
  const progressPercent = Math.min(100, Math.max(0, (position / duration) * 100));
  const playing = Boolean(status.playing);
  const ready = Boolean(story.audioUrl && status.isLoaded);

  return (
    <View style={styles.screen}>
      <View style={styles.player}>
        <Text style={styles.kicker}>AI-generated narration</Text>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.time}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.actions}>
          <PrimaryButton
            label={playing ? "Pause" : "Play"}
            icon={playing ? Pause : Play}
            onPress={togglePlayback}
            disabled={!ready}
          />
          <PrimaryButton
            label="Restart"
            icon={RotateCcw}
            variant="secondary"
            onPress={restart}
            disabled={!ready}
          />
        </View>
      </View>
    </View>
  );
}

function formatTime(ms) {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    backgroundColor: colors.background
  },
  player: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow
  },
  kicker: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900"
  },
  time: {
    color: colors.muted,
    fontWeight: "700"
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.softBlue,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary
  },
  actions: {
    gap: 10
  }
});
