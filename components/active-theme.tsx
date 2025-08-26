// components/active-theme.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";

// Bu dosyada tema konfigürasyonu ve sağlayıcısı tanımlanır.
// Gerçek tema verileriniz ve mantığınız burada yer almalıdır.

type ThemeConfig = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeConfig | undefined>(undefined);

export const useThemeConfig = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useThemeConfig must be used within an ActiveThemeProvider"
    );
  }
  return context;
};

interface ActiveThemeProviderProps {
  children: ReactNode;
}

export const ActiveThemeProvider = ({ children }: ActiveThemeProviderProps) => {
  const [theme, setTheme] = useState("default");

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
