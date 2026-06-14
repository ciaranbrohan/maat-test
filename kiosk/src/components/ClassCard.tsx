import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { GymClass } from '../types';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatTimeRange } from '../utils/time';
import TagChip from './TagChip';

interface ClassCardProps {
  gymClass: GymClass;
  attendeeCount: number;
  onPress: () => void;
}

function InstructorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export default function ClassCard({ gymClass, attendeeCount, onPress }: ClassCardProps) {
  const timeRange = formatTimeRange(gymClass.time, gymClass.duration);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <InstructorAvatar name={gymClass.instructorName} />
      <Text style={styles.name} numberOfLines={2}>{gymClass.name}</Text>
      <Text style={styles.time}>{timeRange}</Text>
      <View style={styles.tags}>
        {gymClass.tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{attendeeCount}/{gymClass.capacity} attendees</Text>
        <Text style={styles.footerText} numberOfLines={1}>{gymClass.instructorName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    margin: Spacing.xs,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
  },
  name: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  time: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
});
