import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  Image, StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatTimeRange } from '../utils/time';
import { RootStackParamList, CheckIn, Member } from '../types';
import { Ionicons } from '@expo/vector-icons';
import TagChip from '../components/TagChip';
import PinModal from '../components/PinModal';
import { api } from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Class'>;
type Route = RouteProp<RootStackParamList, 'Class'>;

const AUTO_LOCK_MS = 10_000;
const UNDO_WINDOW_MS = 3_000;

interface AttendeeRow {
  checkIn: CheckIn;
  member: Member;
}

interface UndoEntry {
  checkIn: CheckIn;
  member: Member;
  timer: ReturnType<typeof setTimeout>;
}

interface Toast {
  message: string;
  type: 'info' | 'error';
  undoId?: string;
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
  const [toast, setToast] = useState<Toast | null>(null);

  const autoLockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  // Keyed by checkIn.id — used for undo and cleanup on unmount
  const undoMap = useRef<Map<string, UndoEntry>>(new Map());

  const gymClass = classes.find((c) => c.id === classId);

  const resetAutoLock = useCallback(() => {
    if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    autoLockTimer.current = setTimeout(() => {
      setStaffUnlocked(false);
    }, AUTO_LOCK_MS);
  }, []);

  useEffect(() => {
    if (staffUnlocked) {
      resetAutoLock();
    } else {
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    }
    return () => {
      if (autoLockTimer.current) clearTimeout(autoLockTimer.current);
    };
  }, [staffUnlocked, resetAutoLock]);

  // On unmount: cancel undo timers and fire any pending API deletes (items already gone from store)
  useEffect(() => {
    return () => {
      undoMap.current.forEach((entry, id) => {
        clearTimeout(entry.timer);
        api.deleteCheckIn(id).catch(() => {});
      });
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string, type: Toast['type'], undoId?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, undoId });
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(
        () => setToast(null),
      );
    }, undoId ? UNDO_WINDOW_MS : 2000);
  };

  const handleDelete = (row: AttendeeRow) => {
    if (staffUnlocked) resetAutoLock();

    // Remove from store immediately so it can't reappear on remount
    removeCheckIn(row.checkIn.id);

    const timer = setTimeout(async () => {
      undoMap.current.delete(row.checkIn.id);
      try {
        await api.deleteCheckIn(row.checkIn.id);
      } catch {
        // Restore: re-add to store and notify
        useAppStore.getState().addCheckIn(row.checkIn);
        showToast('Failed to remove check-in — restored', 'error');
      }
    }, UNDO_WINDOW_MS);

    undoMap.current.set(row.checkIn.id, { checkIn: row.checkIn, member: row.member, timer });
    showToast('Check-in removed', 'info', row.checkIn.id);
  };

  const handleUndo = (checkInId: string) => {
    const entry = undoMap.current.get(checkInId);
    if (!entry) return;
    clearTimeout(entry.timer);
    undoMap.current.delete(checkInId);
    useAppStore.getState().addCheckIn(entry.checkIn);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
      () => setToast(null),
    );
  };

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
          <TouchableOpacity
            onPress={() => handleDelete(item)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{instructorInitials}</Text>
              </View>
              <View style={styles.infoHeaderText}>
                <Text style={styles.className}>{gymClass.name}</Text>
                <Text style={styles.timeRange}>
                  {formatTimeRange(gymClass.time, gymClass.duration)}
                </Text>
              </View>
            </View>
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
          <TouchableOpacity style={styles.sectionTitleRow} onLongPress={() => setPinVisible(true)} delayLongPress={800}>
            <Text style={styles.sectionTitle}>Attendees ({classCheckIns.length})</Text>
            <Ionicons
              name={staffUnlocked ? 'lock-open-outline' : 'lock-closed-outline'}
              size={16}
              color={staffUnlocked ? Colors.success : Colors.textSecondary}
            />
          </TouchableOpacity>
          {attendees.length === 0 && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No check-ins yet</Text>
            </View>
          )}
        </View>
        <FlatList
          style={styles.list}
          data={attendees}
          keyExtractor={(item) => item.checkIn.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('MemberSearch', { classId })}
        >
          <Text style={styles.ctaText}>Add Check-In</Text>
        </TouchableOpacity>
      </View>

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            { opacity: toastOpacity },
            toast.type === 'error' && styles.toastError,
          ]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
          {toast.undoId && (
            <TouchableOpacity onPress={() => handleUndo(toast.undoId!)}>
              <Text style={styles.toastUndo}>Undo</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      )}

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
  inner: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    paddingBottom: 0,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 96,
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoHeaderText: {
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
  className: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  timeRange: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  infoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
  },
  infoText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  attendeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  separator: {
    height: Spacing.sm,
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
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.background,
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
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
  toast: {
    position: 'absolute',
    bottom: 96,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.textPrimary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toastError: {
    backgroundColor: Colors.error,
  },
  toastText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: '#fff',
    flex: 1,
  },
  toastUndo: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.accent,
    paddingLeft: Spacing.md,
  },
});
