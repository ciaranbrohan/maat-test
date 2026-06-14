import { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { formatDate } from '../utils/time';
import { RootStackParamList, GymClass } from '../types';
import ClassCard from '../components/ClassCard';
import HeroBanner from '../components/HeroBanner';
import PromoBanner from '../components/PromoBanner';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const TODAY_NAME = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { classes, checkIns, loading, error, loadInitialData } = useAppStore();

  useEffect(() => {
    loadInitialData();
  }, []);

  const todaysClasses = classes.filter((c) => c.day === TODAY_NAME);

  const attendeeCount = (classId: string) =>
    checkIns.filter((ci) => ci.classId === classId).length;

  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.dateLabel}>{formatDate(new Date())}</Text>
      <Text style={styles.welcome}>Welcome to 🥋 Aranha</Text>
      <HeroBanner />
      <Text style={styles.sectionTitle}>Today's classes</Text>
      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.textSecondary} />
        </View>
      )}
      {error && !loading && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadInitialData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      {!loading && !error && todaysClasses.length === 0 && (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No classes today</Text>
        </View>
      )}
    </View>
  );

  const ListFooter = () => (
    <View>
      <PromoBanner />
      <View style={styles.tip}>
        <Text style={styles.tipText}>
          📱 Pro tip: Open your MAAT app and bump this device, you will be checked in automatically.
        </Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: GymClass }) => (
    <ClassCard
      gymClass={item}
      attendeeCount={attendeeCount(item.id)}
      onPress={() => navigation.navigate('Class', { classId: item.id })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={loading || error ? [] : todaysClasses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  header: {
    marginBottom: Spacing.sm,
  },
  dateLabel: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  welcome: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
  },
  retryText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  tip: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  tipText: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
