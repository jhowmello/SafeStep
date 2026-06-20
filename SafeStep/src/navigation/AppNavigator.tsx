import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { RootStackParamList } from '../types';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import OrdensServicoScreen from '../screens/OrdensServicoScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import ResultadoScreen from '../screens/ResultadoScreen';
import PerfilScreen from '../screens/PerfilScreen';
import CriarOrdemScreen from '../screens/CriarOrdemScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#F5A623',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { paddingBottom: 6, height: 58 },
        headerStyle: { backgroundColor: '#F5A623' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen
        name="Ordens"
        component={OrdensServicoScreen}
        options={{
          title: 'Ordens de Serviço',
          tabBarLabel: 'Ordens',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          title: 'Meu Perfil',
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👷</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Checklist"
          component={ChecklistScreen}
          options={{
            title: 'Checklist de Segurança',
            headerStyle: { backgroundColor: '#F5A623' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <Stack.Screen
          name="Resultado"
          component={ResultadoScreen}
          options={{
            title: 'Resultado',
            headerStyle: { backgroundColor: '#F5A623' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="CriarOrdem"
          component={CriarOrdemScreen}
          options={{
            title: 'Nova Ordem de Serviço',
            headerStyle: { backgroundColor: '#F5A623' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
