// Blocked file extensions - must match server-side list
export const BLOCKED_EXTENSIONS = [
  '.exe',
  '.zip',
  '.rar',
  '.7z',
  '.msi',
  '.apk',
  '.dmg',
  '.iso',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx'
];

// Blocked domain patterns - keywords that are banned in hostnames
export const BLOCKED_DOMAINS = [
  'porn', 'nsfw', 'xhamster', 'redtube', 'pornhub', 'onlyfans',
  'gamble', 'casino', 'betting', 'phish', 'xvideos', 'chaturbate'
];
