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
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AppSettingsContext.Provider value={{ isFullWidth, setIsFullWidth, theme, toggleTheme }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
