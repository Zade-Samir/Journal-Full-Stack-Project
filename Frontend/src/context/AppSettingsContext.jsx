import React, { createContext, useContext, useState, useEffect } from 'react';

const AppSettingsContext = createContext();

export function AppSettingsProvider({ children }) {
  const [isFullWidth, setIsFullWidth] = useState(() => {
    return localStorage.getItem('fullWidth') === 'true';
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return 'dark'; // Default to dark greyish-blue
  });

  useEffect(() => {
    localStorage.setItem('fullWidth', isFullWidth);
  }, [isFullWidth]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    root.classList.remove('dark', 'dim', 'light');
    if (theme !== 'navy') {
      root.classList.add(theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    // Cycles: navy -> dark -> dim -> light -> navy
    setTheme(prev => {
      if (prev === 'navy') return 'dark';
      if (prev === 'dark') return 'dim';
      if (prev === 'dim') return 'light';
      return 'navy';
    });
  };

  return (
    <AppSettingsContext.Provider value={{ isFullWidth, setIsFullWidth, theme, setTheme, toggleTheme }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
