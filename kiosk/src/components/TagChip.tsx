import { Text, View, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

interface TagChipProps {
  label: string;
}

export default function TagChip({ label }: TagChipProps) {
  const bg = Colors.tags[label] ?? Colors.surface;
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  label: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
  },
});
