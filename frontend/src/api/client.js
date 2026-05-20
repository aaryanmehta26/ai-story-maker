const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:4000";
const API_BASE_URL = configuredApiBaseUrl;

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;

  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error(`Network request failed while calling ${url}`);
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.message || "Something went wrong.";
    const error = new Error(message);
    error.details = data?.error?.details;
    throw error;
  }

  return data;
}

export const api = {
  generateStory: (payload) =>
    request("/api/stories/generate", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  listStories: () => request("/api/stories"),
  getStory: (storyId) => request(`/api/stories/${storyId}`),
  deleteStory: (storyId) =>
    request(`/api/stories/${storyId}`, {
      method: "DELETE"
    }),
  generateAudio: (storyId) =>
    request(`/api/stories/${storyId}/audio`, {
      method: "POST"
    }),
  waitForAudio: async (storyId, { attempts = 45, intervalMs = 2000 } = {}) => {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const { story } = await request(`/api/stories/${storyId}`);
      if (story.audioUrl) {
        return story;
      }
      await sleep(intervalMs);
    }

    throw new Error("Audio is still being generated. Please try again in a moment.");
  }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
