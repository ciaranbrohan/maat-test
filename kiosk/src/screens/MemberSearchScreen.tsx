import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Image, FlatList, TouchableOpacity,
  TextInput, StyleSheet, ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { RootStackParamList, Member } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MemberSearch'>;
type Route = RouteProp<RootStackParamList, 'MemberSearch'>;

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

export default function MemberSearchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { classId } = route.params;
  const { members, checkIns } = useAppStore();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const checkedInMemberIds = useMemo(
    () => new Set(checkIns.filter((ci) => ci.classId === classId).map((ci) => ci.memberId)),
    [checkIns, classId],
  );

  const normalisedMembers = useMemo(
    () => members.map((m) => ({ ...m, lowerName: `${m.firstName} ${m.lastName}`.toLowerCase() })),
    [members],
  );

  const eligibleMembers = useMemo(
    () => normalisedMembers.filter((m) => !checkedInMemberIds.has(m.id)),
    [normalisedMembers, checkedInMemberIds],
  );

  const filteredMembers = useMemo(() => {
    if (!debouncedQuery) return eligibleMembers;
    const q = debouncedQuery.toLowerCase();
    return eligibleMembers.filter((m) => m.lowerName.includes(q));
  }, [eligibleMembers, debouncedQuery]);

  const emptyText =
    eligibleMembers.length === 0 ? 'All members are checked in' : 'No members found';

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Member & { lowerName: string }>) => (
      <TouchableOpacity
        style={styles.memberRow}
        onPress={() => navigation.navigate('CheckIn', { classId, memberId: item.id })}
      >
        <MemberAvatar name={`${item.firstName} ${item.lastName}`} uri={item.profilePicture} />
        <Text style={styles.memberName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    ),
    [classId, navigation],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          placeholderTextColor={Colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoFocus
          clearButtonMode="while-editing"
        />
        <Text style={styles.sectionTitle}>Select a member</Text>
      </View>
      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{emptyText}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.xs,
    color: Colors.textPrimary,
  },
  memberName: {
    flex: 1,
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  chevron: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: Colors.textSecondary,
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
});
