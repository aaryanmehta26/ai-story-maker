import express from "express";
import { StoryService } from "../services/storyService.js";
import { validateStoryInput } from "../validation/storySchemas.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

export const storiesRouter = express.Router();
const storyService = new StoryService();

storiesRouter.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const validation = validateStoryInput(req.body);
    if (!validation.success) {
      throw new HttpError(400, "Invalid story details.", validation.errors);
    }

    const story = await storyService.generateAndSave(validation.data);
    res.status(201).json({ story });
  })
);

// List all stories (GET)
storiesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const stories = await storyService.listStories();
    res.json({ stories });
  })
);

storiesRouter.get(
  "/:storyId",
  asyncHandler(async (req, res) => {
    const story = await storyService.getStory(req.params.storyId);
    res.json({ story });
  })
);

storiesRouter.delete(
  "/:storyId",
  asyncHandler(async (req, res) => {
    await storyService.deleteStory(req.params.storyId);
    res.status(204).send();
  })
);

storiesRouter.post(
  "/:storyId/audio",
  asyncHandler(async (req, res) => {
    const { story, audioStatus } = await storyService.requestAudioGeneration(req.params.storyId);
    res.status(audioStatus === "ready" ? 200 : 202).json({ story, audioStatus });
  })
);
