"use client";

import * as React from "react";
// IMPORTANT : importer I18nProvider depuis @heroui/react (et non
// @react-aria/i18n) pour partager la même instance de contexte que les
// composants HeroUI (Calendar, DateRangePicker, etc.). Sinon deux copies
// distinctes du module créent deux contextes séparés et la locale n'est
// pas vue par les composants HeroUI.
import { I18nProvider } from "@heroui/react";

export interface ProvidersProps {
  children: React.ReactNode;
}

// Site francophone (Côte d'Ivoire) : on force la locale fr-FR pour que
// les composants react-aria (DatePicker, Calendar, etc.) affichent les
// libellés et formats de date en français, indépendamment de la locale
// du navigateur de l'utilisateur.
const LOCALE = "fr-FR";

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nProvider locale={LOCALE}>{children}</I18nProvider>
  );
}
