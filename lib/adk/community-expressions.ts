// Community expressions and authentic language
export const COMMUNITY_EXPRESSIONS = {
  greetings: [
    "Shalom Shalom",
    "Mashalomcha",
    "Baruch Yah"
  ],
  farewells: [
    "Yah Khai!",
    "HalleluYah",
    "Shalom Ubracha"
  ],
  acknowledgments: [
    "Todaraba",
    "Baruch Yah",
    "Kol HaKavod"
  ],
  encouragements: [
    "B'Hatzlacha",
    "Kol Tov",
    "Chazak V'Ematz",
    "B'ezrat Yah"
  ]
};

// Helper function to add community expressions
export function addCommunityExpression(text: string, type: 'greeting' | 'farewell' | 'acknowledgment' | 'encouragement' | 'random'): string {
  const expressions = {
    greeting: COMMUNITY_EXPRESSIONS.greetings,
    farewell: COMMUNITY_EXPRESSIONS.farewells,
    acknowledgment: COMMUNITY_EXPRESSIONS.acknowledgments,
    encouragement: COMMUNITY_EXPRESSIONS.encouragements,
    random: [
      ...COMMUNITY_EXPRESSIONS.greetings,
      ...COMMUNITY_EXPRESSIONS.farewells,
      ...COMMUNITY_EXPRESSIONS.acknowledgments,
      ...COMMUNITY_EXPRESSIONS.encouragements
    ]
  };
  
  const selectedExpressions = expressions[type];
  const expression = selectedExpressions[Math.floor(Math.random() * selectedExpressions.length)];
  
  // Randomly decide where to place the expression (20% chance)
  if (Math.random() < 0.2) {
    if (type === 'greeting' || Math.random() < 0.5) {
      return `${expression}! ${text}`;
    } else {
      return `${text} ${expression}!`;
    }
  }
  
  return text;
}