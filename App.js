import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { Main } from './component/general/sheets';
import { Main } from './component/general/tests';
// import { Main } from './component/capture';

export default function App() {
    return (
          <SafeAreaProvider>
                <StatusBar style= "auto" translucent/>
                <GestureHandlerRootView>
                  <Main/>
                </GestureHandlerRootView>
          </SafeAreaProvider>
    )
}