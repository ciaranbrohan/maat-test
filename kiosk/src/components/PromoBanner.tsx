import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing, Radius } from '../theme';

export default function PromoBanner() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>T45 x MAAT Store</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#C0392B',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xl,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
  },
});
