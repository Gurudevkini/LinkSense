import express from "express";
import cors from "cors";
import { nanoid } from "nanoid";
import redis from "./config/redis.js";
import blockedExtensions from "./utils/blockedExtensions.js";
import {
  createUrl,
  findUrlBySlug,
  incrementClicks,
  updateClicksBySlug,
} from "./services/urlService.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "LinkSense Backend",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Helper: Slugify custom keywords to make them URL-friendly
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// Helper: Check for malicious extensions
const hasBlockedExtension = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return blockedExtensions.some((ext) => lowerText.includes(ext));
};

// Helper: URL Validation
const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    if (
      !parsed.hostname.includes(".") ||
      parsed.hostname.startsWith(".") ||
      parsed.hostname.endsWith(".")
    ) return false;
    return true;
  } catch {
    return false;
  }
};

// Helper: Generate alias suggestions if taken
const generateSuggestions = async (alias) => {
  const suffixes = ["-1", "-dev", "2026", "-01"];
  const prefixes = ["my-"];
  const suggestions = [];

  for (const prefix of prefixes) {
    const candidate = `${prefix}${alias}`;
    const existing = await findUrlBySlug(candidate);
    if (!existing) {
      suggestions.push(candidate);
    }
  }

  for (const suffix of suffixes) {
    const candidate = `${alias}${suffix}`;
    const existing = await findUrlBySlug(candidate);
    if (!existing) {
      suggestions.push(candidate);
    }
  }

  let attempts = 0;
  while (suggestions.length < 5 && attempts < 20) {
    attempts++;
    const rand = Math.floor(Math.random() * 100);
    const candidate = `${alias}-${rand}`;
    const existing = await findUrlBySlug(candidate);
    if (!existing && !suggestions.includes(candidate)) {
      suggestions.push(candidate);
    }
  }

  return suggestions.slice(0, 5);
};

// POST /api/check-alias
app.post("/api/check-alias", async (req, res) => {
  try {
    const { alias } = req.body;
    if (!alias) {
      return res.status(200).json({ available: true });
    }

    const cleanAlias = slugify(alias);
    const existing = await findUrlBySlug(cleanAlias);

    if (existing) {
      const suggestions = await generateSuggestions(cleanAlias);
      return res.status(200).json({
        available: false,
        suggestions,
      });
    }

    return res.status(200).json({
      available: true,
    });
  } catch (err) {
    console.error("Check alias error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// POST /api/shorten
app.post("/api/shorten", async (req, res) => {
  try {
    const originalUrl = req.body.originalUrl || req.body.longUrl;
    const customKeyword = req.body.customKeyword || req.body.phrase;

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return res.status(400).json({
        error: "Invalid URL. Only http/https URLs are allowed.",
      });
    }

    if (hasBlockedExtension(originalUrl)) {
      return res.status(400).json({
        error: "URLs pointing to executable or document files are not allowed.",
      });
    }

    const shortId = nanoid(6);
    let phraseSlug = shortId;

    if (customKeyword) {
      const cleanPhrase = slugify(customKeyword);
      if (!cleanPhrase) {
        return res.status(400).json({
          error: "Custom keyword contains no valid characters.",
        });
      }
      
      phraseSlug = cleanPhrase;

      // Check if custom slug is already taken
      const existing = await findUrlBySlug(phraseSlug);
      if (existing) {
        return res.status(400).json({
          error: "That alias is unavailable. Try another alias.",
        });
      }
    }

    const newUrl = await createUrl({
      shortId,
      phraseSlug,
      longUrl: originalUrl,
    });

    res.status(201).json({
      slug: newUrl.phraseSlug,
      shortenedUrl: `http://localhost:5000/${newUrl.phraseSlug}`,
    });
  } catch (err) {
    console.error("Shorten error:", err);
    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

// GET /api/resolve/:slug (Client-side resolution)
app.get("/api/resolve/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    if (redis) {
      const cachedUrl = await redis.get(slug);
      if (cachedUrl) {
        updateClicksBySlug(slug).catch(() => {});
        return res.status(200).json({ longUrl: cachedUrl });
      }
    }

    const url = await findUrlBySlug(slug);
    if (!url) {
      return res.status(404).json({
        error: "Link not found.",
      });
    }

    if (redis) {
      await redis.set(slug, url.longUrl, "EX", 86400).catch(() => {});
    }

    incrementClicks(url).catch(() => {});

    res.status(200).json({ longUrl: url.longUrl });
  } catch (err) {
    console.error("Resolve error:", err);
    res.status(500).json({
      error: "Internal server error.",
    });
  }
});

// GET /:slug (Server-side redirect fallback)
app.get("/:slug", async (req, res, next) => {
  // Pass to other handlers if slug starts with api
  if (req.params.slug.startsWith("api")) {
    return next();
  }

  try {
    const { slug } = req.params;

    if (redis) {
      const cachedUrl = await redis.get(slug);
      if (cachedUrl) {
        updateClicksBySlug(slug).catch(() => {});
        return res.redirect(cachedUrl);
      }
    }

    const url = await findUrlBySlug(slug);
    if (!url) {
      return res.status(404).send("<h1>Link Not Found</h1>");
    }

    if (redis) {
      await redis.set(slug, url.longUrl, "EX", 86400).catch(() => {});
    }

    incrementClicks(url).catch(() => {});
    return res.redirect(url.longUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("<h1>Internal Server Error</h1>");
  }
});

export default app;
