import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

export default function HeroBanner() {
  return (
    <ImageBackground
      source={require('../../assets/hero-banner.jpg')}
      style={styles.container}
      imageStyle={styles.image}
    >
      <View style={styles.overlay}>
        <View style={styles.chip}>
          <Text style={styles.chipLabel}>SEMINAR</Text>
        </View>
        <Text style={styles.title}>Gordon Ryan Seminar</Text>
        <Text style={styles.subtitle}>Train with one of the best ever.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    backgroundColor: '#1A1A1A',
  },
  image: {
    borderRadius: Radius.md,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: Spacing.md,
    justifyContent: 'flex-end',
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  chipLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.size.xs,
    color: Colors.background,
    letterSpacing: 1,
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: Typography.size.xxl,
    color: Colors.background,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.md,
    color: 'rgba(255,255,255,0.8)',
  },
});
