import { store } from '../store/store';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ThemeProvider as AppThemeProvider } from '../components/ThemeContext';
import LoginGate from './LoginGate';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <LoginGate />
        <StatusBar style="auto" />
      </AppThemeProvider>
    </Provider>
  );
}


