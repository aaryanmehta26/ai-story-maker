# AI Story Making App MVP

This repo contains a working MVP scaffold for a child-safe AI story maker:

- `frontend/` - Expo React Native mobile app
- `backend/` - Node.js + Express API
- Firestore/Storage support when Firebase credentials are configured
- Local JSON/audio fallback for quick development
- OpenAI story generation, moderation, and text-to-speech

## Features

- Guided story creation form for child age, topic, moral, characters, genre, setting, style, and format
- AI-generated child-safe story text
- OpenAI moderation before and after generation
- Optional AI audio narration
- Saved story library
- Story detail, replay, regenerate, edit, and delete flows

## Backend Setup

Use Node.js 20 or newer.

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Set `OPENAI_API_KEY` in `backend/.env`.

By default, stories are saved to `backend/data/stories.json` and audio files are saved to `backend/uploads/`. To use Firebase instead, set:

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

You can also use `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json`.

## Frontend Setup

Use Node.js 20 or newer.

```bash
cd frontend
cp .env.example .env
npm install
npm run start
```

If testing on a physical phone, set `EXPO_PUBLIC_API_BASE_URL` to your computer's LAN address, for example:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.20:4000
```

If Expo Go says the project requires a newer version of Expo Go, update Expo Go from the App Store/Play Store and restart Metro with a clean cache:

```bash
cd frontend
npm run start -- --clear
```

## API Routes

- `POST /api/stories/generate`
- `GET /api/stories`
- `GET /api/stories/:storyId`
- `DELETE /api/stories/:storyId`
- `POST /api/stories/:storyId/audio`

## OpenAI Defaults

The backend uses:

- `OPENAI_STORY_MODEL=gpt-5.2`
- `OPENAI_TTS_MODEL=gpt-4o-mini-tts`
- `OPENAI_TTS_VOICE=coral`
- `omni-moderation-latest` for safety checks

You can change these in `backend/.env` if your account uses a different available model.

## Notes

- Authentication is intentionally excluded for MVP scope.
- TTS playback is disclosed in the app as AI-generated narration.
- Audio generation can be done during story creation or later from preview/detail screens.
