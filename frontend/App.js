import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './app/screens/LoginScreen';
import Home from './app/screens/Home';
import PetProfile from './app/screens/PetProfile';
import DiaryScreen from './app/screens/DiaryScreen';
import HealthCheckScreen from './app/screens/HealthCheckScreen';
import { getToken } from './utils/auth';
import { setAuthToken } from './services/api';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={Home} options={{ title: "Início" }} />
      <Tab.Screen name="Prontuario" component={PetProfile} options={{ title: "Prontuário" }} />
      <Tab.Screen name="Diario" component={DiaryScreen} options={{ title: "Diário" }} />
      <Tab.Screen name="Saude" component={HealthCheckScreen} options={{ title: "Check-up" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  useEffect(()=>{ (async ()=>{
    const token = await getToken();
    if (token){ setAuthToken(token); setInitialRoute('Home'); } else { setInitialRoute('Login'); }
  })(); }, []);
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Tabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}