import React, { createContext, useState, ReactNode } from 'react';
import { useContext } from 'react';

type Theme = {
  name: string;
  bg: string;
  primary: string;
  motivationBg: string;
  textContrast: string;
  tab: string,
  tabInactive: string
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
    tab: '#344E41',
    tabInactive: '#9BAF9D',
    bg: '#fcf6ed',
    primary: '#fd6f43',
    motivationBg: '#ffffff',
    textContrast: '#B71C1C',

  },

  {
    name: 'Moss',
    tab: '#344E41',
    tabInactive: '#9BAF9D',
    bg: '#F1F5F2',
    primary: '#3A5A40',
    motivationBg: '#FFFFFF',
    textContrast: '#1B2B1E',
  },

  {
    name: 'Nature',
    tab: '#344E41',
    tabInactive: '#9BAF9D',
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