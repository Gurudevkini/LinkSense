const blockedPatterns = [
  'porn', 'nsfw', 'xhamster', 'redtube', 'pornhub', 'onlyfans',
  'gamble', 'casino', 'betting', 'phish', 'xvideos', 'chaturbate'
];

export const isBlockedDomain = (urlString) => {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    const hostname = url.hostname.toLowerCase();
    
    // Check if hostname contains any of the blocked patterns
    return blockedPatterns.some(pattern => hostname.includes(pattern));
  } catch {
    // If URL parsing fails, check if the raw string contains blocked keywords
    const lowerString = urlString.toLowerCase();
    return blockedPatterns.some(pattern => lowerString.includes(pattern));
  }
};
