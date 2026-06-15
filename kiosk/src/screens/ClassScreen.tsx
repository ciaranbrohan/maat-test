import { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatTimeRange } from '../utils/time';
import { RootStackParamList, CheckIn, Member } from '../types';
import TagChip from '../components/TagChip';
import PinModal from '../components/PinModal';
import { api } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Class'>;
type Route = RouteProp<RootStackParamList, 'Class'>;

interface AttendeeRow {
  checkIn: CheckIn;
  member: Member;
}

function MemberAvatar({ name, uri }: { name: string; uri: string }) {
  const [imgError, setImgError] = useState(false);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  if (uri && !imgError) {
    return (
      <Image
        source={{ uri }}
        style={styles.avatar}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function StatusChip({ status }: { status: string }) {
  const bg = status === 'confirmed' ? Colors.success : Colors.border;
  return (
    <View style={[styles.statusChip, { backgroundColor: bg }]}>
      <Text style={styles.statusText}>{status}</Text>
    </View>
  );
}

export default function ClassScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { classId } = route.params;
  const { classes, members, checkIns, removeCheckIn } = useAppStore();
  const [staffUnlocked, setStaffUnlocked] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);

  const gymClass = classes.find((c) => c.id === classId);

  if (!gymClass) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Class not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const classCheckIns = checkIns.filter((ci) => ci.classId === classId);
  const attendees: AttendeeRow[] = classCheckIns
    .map((ci) => {
      const member = members.find((m) => m.id === ci.memberId);
      return member ? { checkIn: ci, member } : null;
    })
    .filter((row): row is AttendeeRow => row !== null);

  const instructorInitials = gymClass.instructorName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const ListHeader = () => (
    <View>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{instructorInitials}</Text>
        </View>
        <Text style={styles.className}>{gymClass.name}</Text>
        <Text style={styles.timeRange}>
          {formatTimeRange(gymClass.time, gymClass.duration)}
        </Text>
        <View style={styles.tags}>
          {gymClass.tags.map((tag) => (
            <TagChip key={tag} label={tag} />
          ))}
        </View>
        <View style={styles.infoFooter}>
          <Text style={styles.infoText}>
            {classCheckIns.length}/{gymClass.capacity} attendees
          </Text>
          <Text style={styles.infoText}>{gymClass.instructorName}</Text>
        </View>
      </View>

      <TouchableOpacity onLongPress={() => setPinVisible(true)} delayLongPress={800}>
        <Text style={styles.sectionTitle}>
          Attendees ({classCheckIns.length}){staffUnlocked ? '  🔓' : ''}
        </Text>
      </TouchableOpacity>

      {attendees.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No check-ins yet</Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <TouchableOpacity
      style={styles.ctaButton}
      onPress={() => navigation.navigate('MemberSearch', { classId })}
    >
      <Text style={styles.ctaText}>Add Check-In</Text>
    </TouchableOpacity>
  );

  const handleDelete = async (checkInId: string) => {
    try {
      await api.deleteCheckIn(checkInId);
    } catch {
      // optimistic-remove regardless; pending check-ins have no server record
    }
    removeCheckIn(checkInId);
  };

  const renderItem = ({ item }: { item: AttendeeRow }) => {
    const time = new Date(item.checkIn.timestamp).toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const fullName = `${item.member.firstName} ${item.member.lastName}`;
    return (
      <View style={styles.attendeeRow}>
        <MemberAvatar name={fullName} uri={item.member.profilePicture} />
        <Text style={styles.memberName}>{fullName}</Text>
        <StatusChip status={item.checkIn.status} />
        <Text style={styles.timestamp}>{time}</Text>
        {staffUnlocked && (
          <TouchableOpacity onPress={() => handleDelete(item.checkIn.id)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={attendees}
        keyExtractor={(item) => item.checkIn.id}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <PinModal
        visible={pinVisible}
        onSuccess={() => { setStaffUnlocked(true); setPinVisible(false); }}
        onDismiss={() => setPinVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.md,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
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
  className: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  timeRange: {
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
  infoFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    gap: Spacing.xs,
  },
  infoText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  memberName: {
    flex: 1,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  statusChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
  },
  timestamp: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  ctaText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.md,
    color: Colors.accentForeground,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
    color: '#fff',
  },
});
