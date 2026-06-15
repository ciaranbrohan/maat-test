import { Text, View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { GymClass, Member } from '../types';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatTimeRange } from '../utils/time';
import TagChip from './TagChip';

interface ClassCardProps {
  gymClass: GymClass;
  attendeeCount: number;
  isNextUp?: boolean;
  stackMembers?: Member[];
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


function AvatarStack({ members }: { members: Member[] }) {
  if (members.length === 0) return null;
  return (
    <View style={styles.avatarStack}>
      {members.map((m, index) => {
        const initials = `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
        return (
          <View key={m.id} style={[styles.stackAvatar, { zIndex: members.length - index, marginLeft: index === 0 ? 0 : -8 }]}>
            {m.profilePicture ? (
              <Image source={{ uri: m.profilePicture }} style={styles.stackAvatarImg} />
            ) : (
              <Text style={styles.stackAvatarText}>{initials}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function CapacityChip({ attendeeCount, capacity }: { attendeeCount: number; capacity: number }) {
  const isFull = attendeeCount >= capacity;
  const isNearlyFull = !isFull && attendeeCount / capacity >= 0.8;

  if (!isFull && !isNearlyFull) return null;

  const label = isFull ? 'Full' : `${capacity - attendeeCount} spots left`;
  const bg = isFull ? '#FECACA' : '#FED7AA';
  const color = isFull ? '#991B1B' : '#92400E';

  return (
    <View style={[styles.capacityChip, { backgroundColor: bg }]}>
      <Text style={[styles.capacityChipText, { color }]}>{label}</Text>
    </View>
  );
}

export default function ClassCard({ gymClass, attendeeCount, isNextUp, stackMembers = [], onPress }: ClassCardProps) {
  const timeRange = formatTimeRange(gymClass.time, gymClass.duration);
  const isFull = attendeeCount >= gymClass.capacity;
  const isNearlyFull = !isFull && attendeeCount / gymClass.capacity >= 0.8;
  const hasCapacityAlert = isFull || isNearlyFull;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {isNextUp && !hasCapacityAlert && (
        <View style={styles.nextUpBadge}>
          <Text style={styles.nextUpText}>Next up</Text>
        </View>
      )}
      <View style={styles.header}>
        <InstructorAvatar name={gymClass.instructorName} />
        <View style={styles.headerInfo}>
          <Text style={styles.name} numberOfLines={2}>{gymClass.name}</Text>
          <Text style={styles.time}>{timeRange}</Text>
        </View>
      </View>
      <View style={styles.tags}>
        {gymClass.tags.map((tag) => (
          <TagChip key={tag} label={tag} />
        ))}
      </View>
      <AvatarStack members={stackMembers} />
      <CapacityChip attendeeCount={attendeeCount} capacity={gymClass.capacity} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>{attendeeCount}/{gymClass.capacity} attendees</Text>
        <Text style={styles.footerText} numberOfLines={1}>{gymClass.instructorName}</Text>
      </View>
      <View style={styles.capacityTrack}>
        <View style={[styles.capacityFill, { width: `${Math.min((attendeeCount / gymClass.capacity) * 100, 100)}%` }]} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingRight: 56,
  },
  headerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  name: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  time: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  footerText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  avatarStack: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  stackAvatar: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    borderWidth: 1.5,
    borderColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stackAvatarImg: {
    width: '100%',
    height: '100%',
  },
  stackAvatarText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: 8,
    color: Colors.textPrimary,
  },
  nextUpBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  nextUpText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
    color: Colors.accentForeground,
  },
  capacityChip: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm
  },
  capacityChipText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
  },
  capacityTrack: {
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radius.full,
  },
});
