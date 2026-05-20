import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

export const config = {
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  apiBaseUrl: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
  dataDir: process.env.DATA_DIR || path.join(backendRoot, "data"),
  uploadDir: process.env.UPLOAD_DIR || path.join(backendRoot, "uploads"),
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    storyModel: process.env.OPENAI_STORY_MODEL || "gpt-4o-mini",
    ttsModel: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
    ttsVoice: process.env.OPENAI_TTS_VOICE || "coral"
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
};
