import OpenAI from "openai";
import { config } from "../config.js";
import { HttpError } from "../utils/httpError.js";

let client = null;

function getOpenAIClient() {
  if (!config.openai.apiKey) {
    throw new HttpError(503, "OPENAI_API_KEY is not configured.");
  }

  if (!client) {
    client = new OpenAI({ apiKey: config.openai.apiKey });
  }

  return client;
}

const blockedInputPatterns = [
  /\b(kill|murder|suicide|self-harm|sex|sexual|drug|weapon|gore|abuse)\b/i,
  /\b(hate|racist|slur|explicit|adult)\b/i,
];

export function assertBasicInputSafety(storyInput) {
  const combined = Object.values(storyInput).join(" ");
  const hasBlockedTerm = blockedInputPatterns.some((pattern) =>
    pattern.test(combined),
  );

  if (hasBlockedTerm) {
    throw new HttpError(
      400,
      "That topic is not suitable for a child-safe story. Please choose a gentle, age-appropriate idea.",
    );
  }
}

export async function moderateTextOrThrow(text) {
  const openai = getOpenAIClient();
  const moderation = await openai.moderations.create({
    model: "omni-moderation-latest", // model to check harmfulness of text
    input: text,
  });

  const result = moderation.results?.[0];
  if (result?.flagged) {
    const categories = Object.entries(result.categories || {})
      .filter(([, flagged]) => Boolean(flagged))
      .map(([category]) => category);

    throw new HttpError(
      400,
      "This request was blocked by safety checks. Please adjust the story details.",
      { categories },
    );
  }
}

function buildPrompt(storyInput) {
  const stylePreference = storyInput.authorStyle
    ? `Style preference: ${storyInput.authorStyle}. Use only broad, age-appropriate traits from this preference. Do not copy or closely imitate a living author's exact voice.`
    : "Style preference: warm, vivid, simple bedtime storytelling.";

  return `
Create a kid-friendly story for a child aged ${storyInput.childAge}.

Topic: ${storyInput.topic}
Moral: ${storyInput.moral}
Characters: ${storyInput.characters}
Genre: ${storyInput.genre}
Setting: ${storyInput.setting}
${stylePreference}

Rules:
- No violence, weapons, gore, cruelty, adult themes, romance, scary trauma, bullying, or inappropriate language.
- Keep it suitable for children aged 4 to 12, tuned specifically to age ${storyInput.childAge}.
- Use simple, clear language and a positive, engaging tone.
- Include a clear beginning, middle, and ending.
- Make the lesson feel natural, not preachy.
- Aim for around 1,100 to 1,400 words so it can be read aloud in roughly 10 minutes.
- Return only the story text, with a title on the first line.
`.trim();
}

export async function generateStoryText(storyInput) {
  assertBasicInputSafety(storyInput);
  await moderateTextOrThrow(JSON.stringify(storyInput));

  const openai = getOpenAIClient();
  const response = await openai.responses.create({
    model: config.openai.storyModel,
    instructions:
      "You write safe, warm, imaginative children's stories for parents to read aloud. You follow child-safety rules strictly.",
    input: buildPrompt(storyInput),
    max_output_tokens: 500,
  });

  const storyText = response.output_text?.trim();
  if (!storyText) {
    throw new HttpError(
      502,
      "The AI did not return a story. Please try again.",
    );
  }

  await moderateTextOrThrow(storyText);
  return storyText;
}

export async function generateSpeechBuffer(text) {
  const openai = getOpenAIClient();
  const chunks = chunkText(text, 3600);
  const audioBuffers = [];

  for (const chunk of chunks) {
    const response = await openai.audio.speech.create({
      model: config.openai.ttsModel,
      voice: config.openai.ttsVoice,
      input: chunk,
      instructions:
        "Narrate like a kind storyteller reading to a child. Warm, expressive, gentle, and clear.",
      response_format: "mp3",
    });

    audioBuffers.push(Buffer.from(await response.arrayBuffer()));
  }

  return Buffer.concat(audioBuffers);
}

function chunkText(text, maxChars) {
  const paragraphs = text.split(/\n\s*\n/g);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      chunks.push(current);
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]+|\S+/g) || [paragraph];
    current = "";
    for (const sentence of sentences) {
      const sentenceNext = current ? `${current} ${sentence}` : sentence;
      if (sentenceNext.length <= maxChars) {
        current = sentenceNext;
      } else {
        if (current) chunks.push(current);
        current = sentence;
      }
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}
