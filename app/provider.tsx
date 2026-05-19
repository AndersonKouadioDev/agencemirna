"use client";

import * as React from "react";
import { I18nProvider } from "@react-aria/i18n";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ValueObject {
  [themeName: string]: string;
}

interface ThemeProviderProps {
  themes?: string[] | undefined;
  forcedTheme?: string | undefined;
  enableSystem?: boolean | undefined;
  disableTransitionOnChange?: boolean | undefined;
  enableColorScheme?: boolean | undefined;
  storageKey?: string | undefined;
  defaultTheme?: string | undefined;
  attribute?: string | "class" | undefined;
  value?: ValueObject | undefined;
  nonce?: string | undefined;
  children?: React.ReactNode;
}

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

// Site francophone (Côte d'Ivoire) — on force la locale fr-FR pour que
// les composants react-aria (DatePicker, Calendar, etc.) affichent les
// libellés et formats de date en français, indépendamment de la locale
// du navigateur de l'utilisateur.
const LOCALE = "fr-FR";

export function Providers({
  children,
  themeProps = { attribute: "class", defaultTheme: "light" },
}: ProvidersProps) {
  return (
    <NextThemesProvider {...themeProps}>
      <I18nProvider locale={LOCALE}>{children}</I18nProvider>
    </NextThemesProvider>
  );
}
