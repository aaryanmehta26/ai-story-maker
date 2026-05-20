import { HttpError } from "../utils/httpError.js";
import { config } from "../config.js";
import { generateSpeechBuffer, generateStoryText } from "./openaiService.js";
import { saveAudioBuffer } from "./storageService.js";
import { StoryRepository } from "./storyRepository.js";

const audioJobs = new Map();

function deriveTitle(storyText, fallbackTopic) {
  const firstLine = storyText
    .split("\n")
    .find((line) => line.trim())
    ?.trim();
  const title = firstLine?.replace(/^#+\s*/, "").replace(/^Title:\s*/i, "");
  return title && title.length <= 120
    ? title
    : `A Story About ${fallbackTopic}`;
}

export class StoryService {
  constructor(repository = new StoryRepository()) {
    this.repository = repository;
  }

  async generateAndSave(storyInput) {
    const textContent = await generateStoryText(storyInput);
    const title = deriveTitle(textContent, storyInput.topic);
    const savedStory = await this.repository.create({
      title,
      childAge: storyInput.childAge,
      topic: storyInput.topic,
      moral: storyInput.moral,
      characters: storyInput.characters,
      genre: storyInput.genre,
      setting: storyInput.setting,
      authorStyle: storyInput.authorStyle,
      storyFormat: storyInput.storyFormat,
      textContent,
      audioUrl: null,
    });

    return savedStory;
  }

  async listStories() {
    return this.repository.list();
  }

  async getStory(storyId) {
    const story = await this.repository.get(storyId);
    if (!story) {
      throw new HttpError(404, "Story not found.");
    }
    return story;
  }

  async deleteStory(storyId) {
    const deleted = await this.repository.delete(storyId);
    if (!deleted) {
      throw new HttpError(404, "Story not found.");
    }
  }

  async requestAudioGeneration(storyId) {
    const story = await this.getStory(storyId);

    if (story.audioUrl) {
      const audioUrl = normalizeLocalAudioUrl(story.audioUrl);
      const updatedStory =
        audioUrl === story.audioUrl
          ? story
          : await this.repository.update(storyId, { audioUrl });

      return { story: updatedStory, audioStatus: "ready" };
    }

    if (!audioJobs.has(storyId)) {
      const job = this.generateAudio(storyId)
        .catch((error) => {
          console.error(`Audio generation failed for story ${storyId}:`, error);
        })
        .finally(() => {
          audioJobs.delete(storyId);
        });

      audioJobs.set(storyId, job);
    }

    return { story, audioStatus: "processing" };
  }

  async generateAudio(storyId) {
    const story = await this.getStory(storyId);

    if (story.audioUrl) {
      const audioUrl = normalizeLocalAudioUrl(story.audioUrl);
      if (audioUrl !== story.audioUrl) {
        return this.repository.update(storyId, { audioUrl });
      }
      return story;
    }

    const audioBuffer = await generateSpeechBuffer(story.textContent);
    const audioUrl = await saveAudioBuffer(storyId, audioBuffer);
    const updatedStory = await this.repository.update(storyId, { audioUrl });

    if (!updatedStory) {
      throw new HttpError(404, "Story not found.");
    }

    return updatedStory;
  }
}

function normalizeLocalAudioUrl(audioUrl) {
  return audioUrl.replace(
    /^http:\/\/(localhost|127\.0\.0\.1):4000/,
    config.apiBaseUrl,
  );
}
