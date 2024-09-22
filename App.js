import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from '@react-navigation/native';
import { Main } from './component/general/sheets';
// import { Main } from './component/general/after';
// import { Login } from './component/general/login';
// import { Main } from './component/general/register';
import 'react-native-url-polyfill/auto';

export default function App() {
    return (
          <SafeAreaProvider>
                  <StatusBar style= "auto" translucent/>
                  <NavigationContainer>
                        <GestureHandlerRootView>
                              <Main/>
                        </GestureHandlerRootView>
                  </NavigationContainer>
          </SafeAreaProvider>
    )
}