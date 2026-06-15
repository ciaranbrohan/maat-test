import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

const STAFF_PIN = process.env.EXPO_PUBLIC_STAFF_PIN ?? '1234';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

interface PinModalProps {
  visible: boolean;
  onSuccess: () => void;
  onDismiss: () => void;
}

export default function PinModal({ visible, onSuccess, onDismiss }: PinModalProps) {
  const [digits, setDigits] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setDigits('');
    }
  }, [visible]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startLockout = () => {
    const until = Date.now() + LOCKOUT_SECONDS * 1000;
    setLockedUntil(until);
    setCountdown(LOCKOUT_SECONDS);
    countdownRef.current = setInterval(() => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setLockedUntil(null);
        setAttempts(0);
        setCountdown(0);
      } else {
        setCountdown(remaining);
      }
    }, 500);
  };

  useEffect(() => {
    if (digits.length < 4) return;
    if (digits === STAFF_PIN) {
      onSuccess();
      setDigits('');
      setAttempts(0);
    } else {
      Animated.sequence([
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => {
        setDigits('');
        const next = attempts + 1;
        setAttempts(next);
        if (next >= MAX_ATTEMPTS) {
          startLockout();
        }
      });
    }
  }, [digits]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const press = (key: string) => {
    if (isLocked) return;
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1));
    } else if (key && digits.length < 4) {
      setDigits((d) => d + key);
    }
  };

  const attemptsLeft = MAX_ATTEMPTS - attempts;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss}>
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          <Text style={styles.title}>Staff PIN</Text>

          {isLocked ? (
            <View style={styles.lockoutContainer}>
              <Text style={styles.lockoutText}>Too many attempts</Text>
              <Text style={styles.lockoutCountdown}>Try again in {countdown}s</Text>
            </View>
          ) : (
            <>
              <Animated.View style={[styles.dots, { transform: [{ translateX: shake }] }]}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.dot, i < digits.length && styles.dotFilled]} />
                ))}
              </Animated.View>

              {attempts > 0 && (
                <Text style={styles.attemptsWarning}>
                  {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                </Text>
              )}
            </>
          )}

          {KEYS.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((key, c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.key, (!key || isLocked) && styles.keyEmpty]}
                  onPress={() => press(key)}
                  disabled={!key || isLocked}
                >
                  <Text style={[styles.keyText, isLocked && styles.keyTextDisabled]}>{key}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: 280,
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.md,
    color: Colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  dotFilled: {
    backgroundColor: Colors.textPrimary,
    borderColor: Colors.textPrimary,
  },
  attemptsWarning: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.error,
  },
  lockoutContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  lockoutText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.sm,
    color: Colors.error,
  },
  lockoutCountdown: {
    fontFamily: Typography.fontFamily.regular,
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  key: {
    width: 72,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontFamily: Typography.fontFamily.semibold,
    fontSize: Typography.size.lg,
    color: Colors.textPrimary,
  },
  keyTextDisabled: {
    color: Colors.border,
  },
});
