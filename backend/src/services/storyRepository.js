import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config.js";
import { getFirebaseServices } from "../firebase.js";

const COLLECTION = "stories";

export class StoryRepository {
  constructor() {
    const services = getFirebaseServices();
    this.db = services.db;
    this.mode = services.mode;
    this.filePath = path.join(config.dataDir, "stories.json");
  }

  async ensureLocalFile() {
    await fs.mkdir(config.dataDir, { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]", "utf8");
    }
  }

  async readLocalStories() {
    await this.ensureLocalFile();
    const content = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(content);
  }

  async writeLocalStories(stories) {
    await this.ensureLocalFile();
    await fs.writeFile(this.filePath, JSON.stringify(stories, null, 2), "utf8");
  }

  async create(story) {
    const storyId = randomUUID();
    const createdAt = new Date().toISOString();
    const savedStory = { storyId, ...story, createdAt };

    if (this.db) {
      await this.db.collection(COLLECTION).doc(storyId).set(savedStory);
      return savedStory;
    }

    const stories = await this.readLocalStories();
    // push in the beginning of the array mate
    stories.unshift(savedStory);
    await this.writeLocalStories(stories);
    return savedStory;
  }

  async list() {
    if (this.db) {
      const snapshot = await this.db.collection(COLLECTION).orderBy("createdAt", "desc").get();
      return snapshot.docs.map((doc) => doc.data());
    }

    return this.readLocalStories();
  }

  async get(storyId) {
    if (this.db) {
      const doc = await this.db.collection(COLLECTION).doc(storyId).get();
      return doc.exists ? doc.data() : null;
    }

    const stories = await this.readLocalStories();
    return stories.find((story) => story.storyId === storyId) || null;
  }

  async update(storyId, patch) {
    const updatedAt = new Date().toISOString();
    const update = { ...patch, updatedAt };

    if (this.db) {
      await this.db.collection(COLLECTION).doc(storyId).update(update);
      return this.get(storyId);
    }

    const stories = await this.readLocalStories();
    const index = stories.findIndex((story) => story.storyId === storyId);
    if (index === -1) {
      return null;
    }

    stories[index] = { ...stories[index], ...update };
    await this.writeLocalStories(stories);
    return stories[index];
  }

  async delete(storyId) {
    if (this.db) {
      await this.db.collection(COLLECTION).doc(storyId).delete();
      return true;
    }

    const stories = await this.readLocalStories();
    const nextStories = stories.filter((story) => story.storyId !== storyId);
    await this.writeLocalStories(nextStories);
    return nextStories.length !== stories.length;
  }
}

