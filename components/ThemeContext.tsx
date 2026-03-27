import React, { createContext, useState, ReactNode } from 'react';

type Theme = {
  name: string;
  bg: string;
  primary: string;
  motivationBg: string;
  textContrast: string;
};

type ThemeContextType = {
  selectedTheme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  themes: Theme[];
};

export const ThemeContext = createContext<ThemeContextType | null>(null);

const themes: Theme[] = [
  {
    name: 'Warm',
    tab: '#16724f',
    tabInactive: '#5eaf90',
    bg: '#fcf6ed',
    primary: '#F4511E',
    motivationBg: '#ffffff',
    textContrast: '#B71C1C',
    
  },
  {
    name: 'Calm',
    tab: '#F4511E',
    tabInactive: '#df8469',
    bg: '#eff8fd',
    primary: '#1976D2',
    motivationBg: '#ffffff',
    textContrast: '#0D47A1',
  },
  {
    name: 'Nature',
    tab: '#4187ce',
    tabInactive: '#87a6c5',
    bg: '#f1fdf5',
    primary: '#2E7D32',
    motivationBg: '#ffffff',
    textContrast: '#1B5E20',
  },
];

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[2]);

  return (
    <ThemeContext.Provider value={{ selectedTheme, setSelectedTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};