const BANNED_WORDS = [
  'tục tĩu', 'chửi thề', 'vô văn hóa', 
  // Thêm các từ cần cấm ở đây
  'dm', 'vcl', 'cl', 'đụ', 'đéo', 'cc'
];

export function cleanContent(content: string): string {
  let cleaned = content;
  BANNED_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi');
    cleaned = cleaned.replace(regex, '***');
  });
  return cleaned;
}

export function hasProfanity(content: string): boolean {
  return BANNED_WORDS.some(word => 
    new RegExp(`\\b${word}\\b`, 'i').test(content) || content.toLowerCase().includes(word.toLowerCase())
  );
}
