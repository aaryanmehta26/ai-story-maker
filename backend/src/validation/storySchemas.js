import { z } from "zod";

const trimString = (max) => z.string().trim().min(1).max(max);

export const storyInputSchema = z.object({
  childAge: z.coerce.number().int().min(4).max(12),
  topic: trimString(120),
  moral: trimString(160),
  characters: trimString(240),
  genre: trimString(80),
  setting: trimString(120),
  authorStyle: z.string().trim().max(120).optional().default(""),
  storyFormat: z.enum(["text", "audio", "both"]).default("both"),
  generateAudioNow: z.boolean().optional()
}).transform((input) => ({
  ...input,
  generateAudioNow: input.generateAudioNow ?? input.storyFormat !== "text"
}));

export function validateStoryInput(input) {
  const result = storyInputSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    };
  }

  return { success: true, data: result.data };
}
