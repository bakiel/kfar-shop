// Phonetic pronunciation guide for better AI voice output
export const PRONUNCIATION_GUIDE = {
  KFAR: {
    phonetic: "Kifar", // Sounds like "key-far" 
    alternate: "K'far",
    hebrew: "כפר",
    meaning: "village"
  },
  // Add more words as needed
  hummus: {
    phonetic: "hoo-moos",
    hebrew: "חומוס"
  },
  tahini: {
    phonetic: "tah-hee-nee",
    hebrew: "טחינה"
  },
  falafel: {
    phonetic: "fah-lah-fel",
    hebrew: "פלאפל"
  }
};

// Apply phonetic pronunciation to text
export function applyPhoneticPronunciation(text: string): string {
  let result = text;
  
  // Replace KFAR/Kfar with phonetic version
  result = result
    .replace(/\bKFAR\b/gi, PRONUNCIATION_GUIDE.KFAR.phonetic)
    .replace(/\bKfar\b/g, PRONUNCIATION_GUIDE.KFAR.phonetic);
  
  // Add more replacements as needed
  
  return result;
}