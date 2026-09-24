export interface CardTheme {
  background: string
  text: string
  secondaryText: string
  accent: string
  border: string
}

export const themes: Record<string, CardTheme> = {
  github: {
    background: '#0d1117',
    text: '#ffffff',
    secondaryText: '#8b949e',
    accent: '#58a6ff',
    border: '#30363d',
  },

  dark: {
    background: '#111111',
    text: '#ffffff',
    secondaryText: '#a1a1aa',
    accent: '#ffffff',
    border: '#27272a',
  },

  light: {
    background: '#ffffff',
    text: '#111827',
    secondaryText: '#6b7280',
    accent: '#2563eb',
    border: '#e5e7eb',
  },
}