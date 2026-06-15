import { Text, View, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '../theme';

const PALETTE: Record<string, { bg: string; text: string }> = {
  KIDS: { bg: '#C4B5FD', text: '#5B21B6' },
  YOGA: { bg: '#BAE6FD', text: '#0369A1' },
  MMA:  { bg: '#FED7AA', text: '#C2410C' },
  BJJ:  { bg: '#BBF7D0', text: '#15803D' },
};

const DEFAULT = { bg: '#E2E8F0', text: '#4A5568' };

interface TagChipProps {
  label: string;
}

export default function TagChip({ label }: TagChipProps) {
  const colors = PALETTE[label] ?? DEFAULT;
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginRight: Spacing.xs,
    marginBottom: Spacing.md,
  },
  label: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.size.xs,
  },
});
