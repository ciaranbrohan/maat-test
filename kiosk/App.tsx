import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as KeepAwake from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import NetInfo from '@react-native-community/netinfo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors } from './src/theme';
import { useAppStore } from './src/store/useAppStore';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const { loadPendingCheckIns, flushPendingCheckIns } = useAppStore();

  useEffect(() => {
    KeepAwake.activateKeepAwakeAsync();
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    StatusBar.setHidden(true, 'none');
    loadPendingCheckIns();

    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) flushPendingCheckIns();
    });

    Font.loadAsync({
      'Geist-Regular': require('./assets/fonts/Geist-Regular.otf'),
      'Geist-Medium': require('./assets/fonts/Geist-Medium.otf'),
      'Geist-SemiBold': require('./assets/fonts/Geist-SemiBold.otf'),
      'Geist-Bold': require('./assets/fonts/Geist-Bold.otf'),
    }).then(() => {
      setFontsLoaded(true);
      SplashScreen.hideAsync();
    });

    return () => unsubscribe();
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
