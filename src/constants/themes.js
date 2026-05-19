// Catálogo de temas. Adicionar um tema novo = adicionar um entry aqui
// + um snippet em ThemeDecorations para a decoração visual (opcional).

export const THEMES = {
  romantic: {
    id: 'romantic',
    name: 'Romântico',
    description: 'Tons rosados, suaves e apaixonados.',
    emoji: '💖',
    decoration: 'hearts',
    ornament: '❀',
    vars: {
      '--letter-bg':
        'radial-gradient(ellipse at top, #ffe4ec 0%, #fff1f5 40%, #ffd6e8 100%)',
      '--letter-surface': '#ffffff',
      '--letter-surface-soft': '#fff7fa',
      '--letter-ink': '#3a1d2a',
      '--letter-ink-soft': '#7a5060',
      '--letter-accent': '#e11d74',
      '--letter-accent-soft': '#f9a8d4',
      '--letter-accent-glow': 'rgba(225, 29, 116, 0.35)',
      '--letter-border': 'rgba(225, 29, 116, 0.18)',
      '--letter-shadow':
        '0 30px 60px -20px rgba(225, 29, 116, 0.35), 0 18px 30px -18px rgba(0, 0, 0, 0.15)',
      '--letter-heading-font': 'var(--font-playfair), Georgia, serif',
      '--letter-body-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-rule': '❀',
      '--letter-wax-color': '#e11d74',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, branco, foco total na mensagem.',
    emoji: '🤍',
    decoration: 'none',
    ornament: '·',
    vars: {
      '--letter-bg':
        'linear-gradient(180deg, #fafafa 0%, #f4f4f5 70%, #ececec 100%)',
      '--letter-surface': '#ffffff',
      '--letter-surface-soft': '#fafafa',
      '--letter-ink': '#0a0a0a',
      '--letter-ink-soft': '#52525b',
      '--letter-accent': '#18181b',
      '--letter-accent-soft': '#d4d4d8',
      '--letter-accent-glow': 'rgba(0, 0, 0, 0.12)',
      '--letter-border': 'rgba(0,0,0,0.08)',
      '--letter-shadow':
        '0 20px 50px -20px rgba(0, 0, 0, 0.15), 0 8px 20px -10px rgba(0, 0, 0, 0.08)',
      '--letter-heading-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-body-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-rule': '—',
      '--letter-wax-color': '#18181b',
    },
  },
  vintage: {
    id: 'vintage',
    name: 'Vintage',
    description: 'Papel envelhecido, tons sépia, nostalgia pura.',
    emoji: '📜',
    decoration: 'paper',
    ornament: '✦',
    vars: {
      '--letter-bg':
        'radial-gradient(ellipse at center, #f3e9d2 0%, #e8d9b8 80%, #d4c19a 100%)',
      '--letter-surface': '#fbf3df',
      '--letter-surface-soft': '#f3e9d2',
      '--letter-ink': '#3b2a16',
      '--letter-ink-soft': '#7a5c39',
      '--letter-accent': '#9a6b2f',
      '--letter-accent-soft': '#d6b07a',
      '--letter-accent-glow': 'rgba(154, 107, 47, 0.25)',
      '--letter-border': 'rgba(122, 92, 57, 0.35)',
      '--letter-shadow':
        '0 30px 60px -25px rgba(75, 50, 20, 0.45), inset 0 0 60px rgba(122, 92, 57, 0.08)',
      '--letter-heading-font': '"Playfair Display", Georgia, serif',
      '--letter-body-font': '"Playfair Display", Georgia, serif',
      '--letter-rule': '✦',
      '--letter-wax-color': '#9a6b2f',
    },
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Misterioso, elegante, com brilho noturno.',
    emoji: '🌙',
    decoration: 'stars',
    ornament: '✧',
    vars: {
      '--letter-bg':
        'radial-gradient(ellipse at top, #2a2160 0%, #16162b 50%, #0b0b14 100%)',
      '--letter-surface': '#1a1a36',
      '--letter-surface-soft': '#22224a',
      '--letter-ink': '#f4f4f5',
      '--letter-ink-soft': '#a1a1aa',
      '--letter-accent': '#fbbf24',
      '--letter-accent-soft': '#c4b5fd',
      '--letter-accent-glow': 'rgba(251, 191, 36, 0.4)',
      '--letter-border': 'rgba(196, 181, 253, 0.25)',
      '--letter-shadow':
        '0 30px 80px -20px rgba(124, 58, 237, 0.4), 0 0 60px rgba(196, 181, 253, 0.1)',
      '--letter-heading-font': 'var(--font-playfair), Georgia, serif',
      '--letter-body-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-rule': '✧',
      '--letter-wax-color': '#fbbf24',
    },
  },
  anime: {
    id: 'anime',
    name: 'Anime',
    description: 'Pastéis vibrantes, kawaii e cheio de vida.',
    emoji: '🌸',
    decoration: 'sakura',
    ornament: '✿',
    vars: {
      '--letter-bg':
        'linear-gradient(135deg, #ffe4f1 0%, #fce7f3 30%, #e0e7ff 70%, #ddd6fe 100%)',
      '--letter-surface': '#ffffff',
      '--letter-surface-soft': '#fdf2ff',
      '--letter-ink': '#1e1b4b',
      '--letter-ink-soft': '#6d28d9',
      '--letter-accent': '#ec4899',
      '--letter-accent-soft': '#fbcfe8',
      '--letter-accent-glow': 'rgba(236, 72, 153, 0.4)',
      '--letter-border': 'rgba(236, 72, 153, 0.3)',
      '--letter-shadow':
        '0 30px 70px -20px rgba(236, 72, 153, 0.35), 0 0 50px rgba(168, 85, 247, 0.2)',
      '--letter-heading-font': 'var(--font-playfair), Georgia, serif',
      '--letter-body-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-rule': '✿',
      '--letter-wax-color': '#ec4899',
    },
  },
  birthday: {
    id: 'birthday',
    name: 'Aniversário',
    description: 'Festivo, colorido, com clima de celebração.',
    emoji: '🎉',
    decoration: 'confetti',
    ornament: '✦',
    vars: {
      '--letter-bg':
        'linear-gradient(135deg, #fef9c3 0%, #fde68a 35%, #fca5a5 70%, #fb7185 100%)',
      '--letter-surface': '#ffffff',
      '--letter-surface-soft': '#fffbeb',
      '--letter-ink': '#451a03',
      '--letter-ink-soft': '#92400e',
      '--letter-accent': '#dc2626',
      '--letter-accent-soft': '#fecaca',
      '--letter-accent-glow': 'rgba(220, 38, 38, 0.4)',
      '--letter-border': 'rgba(220, 38, 38, 0.3)',
      '--letter-shadow':
        '0 30px 70px -20px rgba(220, 38, 38, 0.35), 0 0 50px rgba(251, 191, 36, 0.25)',
      '--letter-heading-font': 'var(--font-playfair), Georgia, serif',
      '--letter-body-font': 'var(--font-inter), system-ui, sans-serif',
      '--letter-rule': '✦',
      '--letter-wax-color': '#dc2626',
    },
  },
}

export const THEME_LIST = Object.values(THEMES)
export const THEME_IDS = Object.keys(THEMES)

export function getTheme(id) {
  return THEMES[id] || THEMES.romantic
}
