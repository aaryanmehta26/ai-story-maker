import fs from "fs/promises";
import os from "os";
import path from "path";
import { config } from "../config.js";
import { getFirebaseServices } from "../firebase.js";

export async function saveAudioBuffer(storyId, audioBuffer) {
  const { bucket } = getFirebaseServices();
  const fileName = `${storyId}.mp3`;

  if (bucket) {
    const tempPath = path.join(os.tmpdir(), fileName);
    await fs.writeFile(tempPath, audioBuffer);
    const destination = `stories/${storyId}/audio.mp3`;

    await bucket.upload(tempPath, {
      destination,
      metadata: {
        contentType: "audio/mpeg",
        cacheControl: "public, max-age=31536000"
      }
    });

    await fs.unlink(tempPath).catch(() => {});
    const [audioUrl] = await bucket.file(destination).getSignedUrl({
      action: "read",
      expires: "01-01-2035"
    });
    return audioUrl;
  }

  // save locally as of now if Firebase isn't configured
  await fs.mkdir(config.uploadDir, { recursive: true });
  const localPath = path.join(config.uploadDir, fileName);
  await fs.writeFile(localPath, audioBuffer);
  return `${config.apiBaseUrl}/uploads/${fileName}`;
}

