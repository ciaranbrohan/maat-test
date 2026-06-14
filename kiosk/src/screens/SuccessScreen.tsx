import { View, Text } from 'react-native';
import { Colors, Typography } from '../theme';

export default function SuccessScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: Typography.fontFamily.semibold, fontSize: Typography.size.md, color: Colors.textPrimary }}>
        Success!
      </Text>
    </View>
  );
}
