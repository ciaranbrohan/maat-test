import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatDate } from '../utils/time';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CheckIn'>;
type Route = RouteProp<RootStackParamList, 'CheckIn'>;

function Avatar({ name }: { name: string }) {
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

export default function CheckInScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { classId, memberId } = route.params;
  const { classes, members, addCheckIn } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const member = members.find((m) => m.id === memberId);
  const gymClass = classes.find((c) => c.id === classId);

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.guardText}>Member not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!gymClass) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.guardText}>Class not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const memberName = `${member.firstName} ${member.lastName}`;

  const handleCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.postCheckIn(memberId, classId);
      addCheckIn(result);
      navigation.navigate('Success', { memberName, className: gymClass.name });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.centre}>
          <Avatar name={memberName} />
          <Text style={styles.memberName}>{memberName}</Text>
          <Text style={styles.date}>{formatDate(new Date())}</Text>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, loading && styles.ctaDisabled]}
          onPress={handleCheckIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.accentForeground} />
          ) : (
            <Text style={styles.ctaText}>Check In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  layout: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  memberName: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  date: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.error,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.md,
    color: Colors.accentForeground,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
});
