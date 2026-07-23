import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/Navigation/AppNavigator';
import { store } from './src/Store';
import { AuthProvider } from './src/service/authContext';

export default function App() {
    return (
        <Provider store={store}>
            <AuthProvider>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <StatusBar style="dark" />
                        <AppNavigator />
                    </NavigationContainer>
                </SafeAreaProvider>
            </AuthProvider>
        </Provider>
    );
}