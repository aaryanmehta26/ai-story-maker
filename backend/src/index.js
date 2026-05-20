import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { config } from "./config.js";
import { storiesRouter } from "./routes/stories.js";

const app = express();

app.set("etag", false);
app.use(cors({ origin: config.clientOrigin === "*" ? true : config.clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.resolve(config.uploadDir)));

app.use("/api", (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/stories", storiesRouter);

app.use((req, res) => {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.path}` } });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = status === 500 ? "Something went wrong." : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({
    error: {
      message,
      details: error.details
    }
  });
});

app.listen(config.port, () => {
  console.log(`AI Story backend running on http://localhost:${config.port}`);
});
