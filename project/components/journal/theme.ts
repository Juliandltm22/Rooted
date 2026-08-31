export const journalColors = {
  cream: '#FCF9ED',
  ink: '#37423D',
  mutedText: '#6B716D',
  subtleText: '#918E8E',
  green: '#899878',
  lightGreen: '#DDE7C7',
  midGreen: '#B9CCA4',
  pink: '#D5B9B2',
  lightPink: '#E8D7D2',
  white: '#FFFFFF',
  border: '#E8E6D7',
  error: '#A85454',
} as const;

export const journalCardShadow = {
  shadowColor: journalColors.ink,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.12,
  shadowRadius: 5,
  elevation: 3,
} as const;

