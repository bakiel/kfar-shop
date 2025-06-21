// String matching utilities for voice commerce

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
export function stringSimilarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLen);
}

/**
 * Find best match from candidates with confidence score
 */
export function findBestMatch(
  input: string, 
  candidates: string[], 
  threshold = 0.6
): { match: string | null; confidence: number; allMatches: Array<{candidate: string; score: number}> } {
  const scores = candidates.map(candidate => ({
    candidate,
    score: stringSimilarity(input, candidate)
  }));

  scores.sort((a, b) => b.score - a.score);

  const bestMatch = scores[0];
  
  return {
    match: bestMatch && bestMatch.score >= threshold ? bestMatch.candidate : null,
    confidence: bestMatch ? bestMatch.score : 0,
    allMatches: scores.slice(0, 5) // Top 5 matches
  };
}

/**
 * Tokenize and match partial strings
 */
export function partialMatch(input: string, target: string): boolean {
  const inputTokens = input.toLowerCase().split(/\s+/);
  const targetLower = target.toLowerCase();
  
  // Check if all input tokens appear in target
  return inputTokens.every(token => targetLower.includes(token));
}

/**
 * Common voice recognition corrections
 */
export const voiceCorrections: Record<string, string[]> = {
  'seitan': ['satan', 'say tan', 'saitan', 'saytan'],
  'hummus': ['humus', 'homos', 'hummous'],
  'tahini': ['tahina', 'tehina', 'tahiny'],
  'shawarma': ['shwarma', 'schwarma', 'shaverma'],
  'kubbeh': ['kube', 'cuba', 'kubba', 'kibbeh'],
  'schnitzel': ['shnitzel', 'schnitsel', 'snitzel'],
  'falafel': ['felafel', 'flafel', 'falafal'],
  'peoples store': ['people store', 'people\'s store', 'peoples\' store'],
  'gahn delight': ['gun delight', 'gone delight', 'gan delight'],
  'teva deli': ['teva delly', 'teva delhi', 'tiva deli']
};

/**
 * Apply voice corrections to input
 */
export function applyVoiceCorrections(input: string): string {
  let corrected = input.toLowerCase();
  
  for (const [correct, variations] of Object.entries(voiceCorrections)) {
    for (const variation of variations) {
      const regex = new RegExp(`\\b${variation}\\b`, 'gi');
      corrected = corrected.replace(regex, correct);
    }
  }
  
  return corrected;
}