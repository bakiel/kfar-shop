// Updated voice configuration with working ElevenLabs voice IDs
export const ELEVENLABS_VOICES = {
  yaakov: {
    id: 'TX3LPaxmHKxFdv7VOQHJ', // V3 Male voice
    name: 'Akh Yaakov',
    description: 'Deep, calming male voice'
  },
  daniella: {
    id: 'Z3R5wn05IrDiVCyEkUrK', // V3 Female voice
    name: 'Akhot Daniella', 
    description: 'Professional, warm female voice'
  }
};

// Alternative voices if needed
export const ALTERNATIVE_VOICES = {
  male: [
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', accent: 'american' },
    { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', accent: 'american' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', accent: 'british' }
  ],
  female: [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', accent: 'american' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', accent: 'american' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', accent: 'british' }
  ]
};
