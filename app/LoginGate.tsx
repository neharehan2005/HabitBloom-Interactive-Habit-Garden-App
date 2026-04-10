import React from 'react';
import { useSelector } from 'react-redux';
import { Slot } from 'expo-router';
import LoginScreen from './login';

export default function LoginGate() {
  const user = useSelector((state: any) => state.habits?.user);

  // If not logged in, render LoginScreen directly — no router.replace() needed
  if (!user) {
    return <LoginScreen />;
  }

  // If logged in, render whatever route Expo Router wants (the tabs)
  return <Slot />;
}