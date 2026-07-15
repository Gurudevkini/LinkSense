import Url from "../models/Url.js";

const memoryStore = [];
let useMongo = false;

export const setStorageMode = (mongoEnabled) => {
  useMongo = mongoEnabled;
};

export const createUrl = async ({ shortId, phraseSlug, longUrl }) => {
  if (useMongo) {
    return Url.create({ shortId, phraseSlug, longUrl });
  }

  const newUrl = {
    _id: shortId,
    shortId,
    phraseSlug,
    longUrl,
    clicks: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryStore.push(newUrl);
  return newUrl;
};

export const findUrlBySlug = async (slug) => {
  if (useMongo) {
    return Url.findOne({ $or: [{ shortId: slug }, { phraseSlug: slug }] });
  }

  return memoryStore.find(
    (item) => item.shortId === slug || item.phraseSlug === slug
  );
};

export const incrementClicks = async (url) => {
  if (!url) return;

  if (useMongo) {
    if (typeof url.save === "function") {
      url.clicks += 1;
      return url.save();
    }
    return Url.updateOne(
      { $or: [{ shortId: url.shortId }, { phraseSlug: url.phraseSlug }] },
      { $inc: { clicks: 1 } }
    );
  }

  url.clicks += 1;
  url.updatedAt = new Date();
  return url;
};

export const updateClicksBySlug = async (slug) => {
  if (useMongo) {
    return Url.updateOne(
      { $or: [{ shortId: slug }, { phraseSlug: slug }] },
      { $inc: { clicks: 1 } }
    );
  }

  const url = await findUrlBySlug(slug);
  if (url) {
    url.clicks += 1;
    url.updatedAt = new Date();
  }
  return url;
};
