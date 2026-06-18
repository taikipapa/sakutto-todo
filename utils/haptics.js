import * as Haptics from 'expo-haptics';

export const longPressHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

export const completeHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

export const lightHaptic = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
