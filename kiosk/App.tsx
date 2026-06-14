import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync({
      'Geist-Regular': require('./assets/fonts/Geist-Regular.otf'),
      'Geist-Medium': require('./assets/fonts/Geist-Medium.otf'),
      'Geist-SemiBold': require('./assets/fonts/Geist-SemiBold.otf'),
      'Geist-Bold': require('./assets/fonts/Geist-Bold.otf'),
    }).then(() => {
      setFontsLoaded(true);
      SplashScreen.hideAsync();
    });
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.textSecondary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <RootNavigator />
    </SafeAreaProvider>
  );
}
