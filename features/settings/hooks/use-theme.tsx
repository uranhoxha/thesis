"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = "green" | "red" | "blue" | "yellow";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>("green");

  useEffect(() => {
    // Read theme from localStorage on mount
    const savedTheme = localStorage.getItem("app-theme") as ThemeType;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // Remove all old theme classes
    root.classList.remove("theme-red", "theme-blue", "theme-yellow");

    // Add new theme class if it's not the default green
    if (theme !== "green") {
      root.classList.add(`theme-${theme}`);
    }

    // Save choice to localStorage
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
