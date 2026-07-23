import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import Colors from '../constants/colors';
import AuthenticationScreen from '../screens/Authentication/AuthenticationScreen';
import CalendarScreen from '../screens/CalendarScreen/CalendarScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen/CreateTaskScreen';
import EditTaskScreen from '../screens/EditTaskScreen/EditTaskScreen';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import SplashScreen from '../screens/SplashScreen/SplashScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen/TaskDetailScreen';
import TasksScreen from '../screens/TasksScreen/TasksScreen';
import ForgotPasswordScreen from '../screens/Authentication/ForgotPasswordScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../service/authContext';
import { useDispatch } from 'react-redux';
import { setTasks } from '../Store/tasksSlice';
import { getTasks } from '../service/taskService';

// Types for navigation
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  CreateTask: undefined;
  TaskDetail: undefined;
  EditTask: undefined;
  ForgotPassword: undefined;
};

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Tasks: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabBarIcon({ name, focused }: { name: keyof TabParamList; focused: boolean }) {
  const getIconSvg = (color: string) => {
    switch (name) {
      case 'Home':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Calendar':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Tasks':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9h6m-6-4h6"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
      case 'Profile':
        return (
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        );
    }
  };

  const iconColor = focused ? Colors.primary : '#94A3B8';

  return (
    <View style={styles.tabContainer}>
      {getIconSvg(iconColor)}
      <Text style={[styles.tabText, focused && styles.activeTabText]}>{name}</Text>
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIconStyle: {
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ focused }) => (
          <TabBarIcon name={route.name as keyof TabParamList} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Wrapper screens to handle transition completions
function NavigationSplashScreen({ navigation }: any) {
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (loading) return; // Wait until firebase restores session

    const timer = setTimeout(async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
        if (user) {
          navigation.replace('Main');
        } else if (onboardingCompleted === 'true') {
          navigation.replace('Auth');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (e) {
        navigation.replace('Onboarding');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [navigation, user, loading]);

  return <SplashScreen />;
}

function NavigationOnboardingScreen({ navigation }: any) {
  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
    } catch (e) {}
    navigation.replace('Auth');
  };
  return <OnboardingScreen onComplete={handleComplete} />;
}

function NavigationAuthScreen({ navigation }: any) {
  // Directly simulate successful auth and proceed to home
  return (
    <AuthenticationScreen
    // If we integrated success state, we would proceed
    // For now, it compiles completely and switching works
    />
  );
}

// Temporary debug auto-login setup to bypass to main stack easily
// In real app, standard router switch matches this
export default function AppNavigator() {
  const { user } = useAuth();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (user) {
      getTasks(user.uid)
        .then((tasksList) => {
          dispatch(setTasks(tasksList as any[]));
        })
        .catch((err) => {
          console.error('Error fetching tasks from Firestore: ', err);
        });
    } else {
      dispatch(setTasks([]));
    }
  }, [user, dispatch]);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Splash" component={NavigationSplashScreen} />
      <Stack.Screen name="Onboarding" component={NavigationOnboardingScreen} />
      <Stack.Screen name="Auth" component={NavigationAuthScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    height: 88,
    borderTopWidth: 0,
    paddingTop: 8,
    paddingBottom: 24, // Optimized padding for iOS home indicator
    position: 'absolute',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  tabBarItem: {
    justifyContent: 'center',
    alignItems: 'center',

  },
  tabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
