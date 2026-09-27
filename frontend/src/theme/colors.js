export const colors = {
  // Backgrounds
  background: '#0B0F19',
  surface: '#151D2F',
  surfaceElevated: '#1E293B',
  surfaceHighlight: '#293548',

  // Primary brand
  primary: '#6366F1',
  primaryHover: '#4F46E5',
  primaryLight: '#818CF8',
  primaryGlow: 'rgba(99, 102, 241, 0.25)',

  // Secondary & Accents
  accent: '#A855F7',
  cyan: '#06B6D4',
  emerald: '#10B981',

  // Message bubbles
  senderBubble: '#6366F1',
  senderText: '#FFFFFF',
  senderTime: 'rgba(255, 255, 255, 0.75)',

  receiverBubble: '#1E293B',
  receiverText: '#F1F5F9',
  receiverTime: '#94A3B8',

  // Text
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textLight: '#E2E8F0',

  // Status
  online: '#10B981',
  offline: '#64748B',
  typing: '#38BDF8',
  danger: '#EF4444',
  warning: '#F59E0B',

  // Borders & Dividers
  border: '#2A364F',
  borderLight: '#3B4863',

  // Status receipts
  readTick: '#38BDF8',
  sentTick: 'rgba(255, 255, 255, 0.65)',
};

export const avatarColors = [
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#F43F5E', // Rose
];

export const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColors.length;
  return avatarColors[index];
};
