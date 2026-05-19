"use client";

import * as React from "react";
import { useLocale, I18nProvider } from "@react-aria/i18n";
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

export function Providers({
  children,
  themeProps = { attribute: "class", defaultTheme: "light" },
}: ProvidersProps) {
  const { locale, direction } = useLocale();

  return (
    <NextThemesProvider {...themeProps}>
      <I18nProvider locale={locale}>
        <div dir={direction} lang={locale}>
          {children}
        </div>
      </I18nProvider>
    </NextThemesProvider>
  );
}
