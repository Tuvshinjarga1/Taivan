"use client";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  LineChart,
  Activity,
  Settings,
  Utensils,
  Droplet,
} from "react-native-feather";

// Screens
import DashboardScreen from "./screens/DashboardScreen";
import ReportsScreen from "./screens/ReportsScreen";
import FoodAnalyzerScreen from "./screens/FoodAnalyzerScreen";
import GlucoseTrackerScreen from "./screens/GlucoseTrackerScreen";
import SettingsScreen from "./screens/SettingsScreen";
import DiabetesInfoScreen from "./screens/DiabetesInfoScreen";
import DiabetesAssessmentScreen from "./screens/DiabetesAssessmentScreen";
import HealthDataEntryScreen from "./screens/HealthDataEntryScreen";
import GlucoseHistoryScreen from "./screens/GlucoseHistoryScreen";

// Auth screens
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";

// Context providers
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { HealthDataProvider } from "./contexts/HealthDataContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  const { isDiabetic } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Хянах самбар",
          tabBarIcon: ({ color, size }) => (
            <LineChart stroke={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: "Тайлан",
          tabBarIcon: ({ color, size }) => (
            <Activity stroke={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen
        name="FoodAnalyzer"
        component={FoodAnalyzerScreen}
        options={{
          title: "Хоол",
          tabBarIcon: ({ color, size }) => (
            <Utensils stroke={color} width={size} height={size} />
          ),
        }}
      />
      {isDiabetic && (
        <Tab.Screen
          name="GlucoseTracker"
          component={GlucoseTrackerScreen}
          options={{
            title: "Сахар",
            tabBarIcon: ({ color, size }) => (
              <Droplet stroke={color} width={size} height={size} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Тохиргоо",
          tabBarIcon: ({ color, size }) => (
            <Settings stroke={color} width={size} height={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="DiabetesInfo" component={DiabetesInfoScreen} />
            <Stack.Screen
              name="DiabetesAssessment"
              component={DiabetesAssessmentScreen}
            />
            <Stack.Screen
              name="HealthDataEntry"
              component={HealthDataEntryScreen}
            />
            <Stack.Screen
              name="GlucoseHistory"
              component={GlucoseHistoryScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <HealthDataProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </HealthDataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
