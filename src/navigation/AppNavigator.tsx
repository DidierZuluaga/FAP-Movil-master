import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, DollarSign, CreditCard, PieChart, User } from 'lucide-react-native';
import { useAuth } from '../hooks/useAuth';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { theme } from '../config/theme';

let MonthlyContributionConfigScreen;

try {
  MonthlyContributionConfigScreen = require('../screens/savings/MonthlyContributionConfigScreen').MonthlyContributionConfigScreen;
} catch { 
  MonthlyContributionConfigScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Text>Configuración de aporte en desarrollo</Text>
  </View>; 
}
// Importar pantallas si existen, sino usar placeholder
let DashboardScreen, SavingsScreen, LoansScreen, ReportsScreen, ProfileScreen, NotificationsScreen;

try {
  DashboardScreen = require('../screens/dashboard/DashboardScreen').DashboardScreen;
} catch { DashboardScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Dashboard en desarrollo</Text></View>; }

try {
  SavingsScreen = require('../screens/savings/SavingsScreen').SavingsScreen;
} catch { SavingsScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Ahorros en desarrollo</Text></View>; }

try {
  LoansScreen = require('../screens/loans/LoansScreen').LoansScreen;
} catch { LoansScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Préstamos en desarrollo</Text></View>; }

try {
  ReportsScreen = require('../screens/reports/ReportsScreen').ReportsScreen;
} catch { ReportsScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Reportes en desarrollo</Text></View>; }

try {
  ProfileScreen = require('../screens/profile/ProfileScreen').ProfileScreen;
} catch { ProfileScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>Perfil en desarrollo</Text></View>; }

try {
  NotificationsScreen = require('../screens/notifications/NotificationsScreen').NotificationsScreen;
} catch { 
  NotificationsScreen = () => <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Text>Notificaciones en desarrollo</Text>
  </View>; 
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: theme.colors.primary[600] }}>
    <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
    <Tab.Screen name="Savings" component={SavingsScreen} options={{ tabBarLabel: 'Ahorros', tabBarIcon: ({ color, size }) => <DollarSign size={size} color={color} /> }} />
    <Tab.Screen name="Loans" component={LoansScreen} options={{ tabBarLabel: 'Préstamos', tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} /> }} />
    <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reportes', tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="MonthlyContributionConfig" component={MonthlyContributionConfigScreen} />
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
};