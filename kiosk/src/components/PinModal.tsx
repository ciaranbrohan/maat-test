import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, Animated,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';

const STAFF_PIN = '1234';

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
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) setDigits('');
  }, [visible]);

  useEffect(() => {
    if (digits.length < 4) return;
    if (digits === STAFF_PIN) {
      onSuccess();
      setDigits('');
    } else {
      Animated.sequence([
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start(() => setDigits(''));
    }
  }, [digits]);

  const press = (key: string) => {
    if (key === '⌫') {
      setDigits((d) => d.slice(0, -1));
    } else if (key && digits.length < 4) {
      setDigits((d) => d + key);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss}>
        <TouchableOpacity activeOpacity={1} style={styles.card}>
          <Text style={styles.title}>Staff PIN</Text>

          <Animated.View style={[styles.dots, { transform: [{ translateX: shake }] }]}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={[styles.dot, i < digits.length && styles.dotFilled]} />
            ))}
          </Animated.View>

          {KEYS.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((key, c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.key, !key && styles.keyEmpty]}
                  onPress={() => press(key)}
                  disabled={!key}
                >
                  <Text style={styles.keyText}>{key}</Text>
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
});
