import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import { storage } from "./utils/storage";

import ptLogin from "./locales/pt/login.json";
import ptApi from "./locales/pt/api.json";
import ptPages from "./locales/pt/pages.json";
import ptComponents from "./locales/pt/components.json";
import ptModals from "./locales/pt/modals.json";
import ptStores from "./locales/pt/stores.json";
import ptFields from "./locales/pt/fields.json";
import enLogin from "./locales/en/login.json";
import enApi from "./locales/en/api.json";
import enPages from "./locales/en/pages.json";
import enComponents from "./locales/en/components.json";
import enModals from "./locales/en/modals.json";
import enStores from "./locales/en/stores.json";
import enFields from "./locales/en/fields.json";
import esLogin from "./locales/es/login.json";
import esApi from "./locales/es/api.json";
import esPages from "./locales/es/pages.json";
import esComponents from "./locales/es/components.json";
import esModals from "./locales/es/modals.json";
import esStores from "./locales/es/stores.json";
import esFields from "./locales/es/fields.json";
import frLogin from "./locales/fr/login.json";
import frApi from "./locales/fr/api.json";
import frPages from "./locales/fr/pages.json";
import frComponents from "./locales/fr/components.json";
import frModals from "./locales/fr/modals.json";
import frStores from "./locales/fr/stores.json";
import frFields from "./locales/fr/fields.json";
import ptMobile from "./locales/pt/mobile.json";
import enMobile from "./locales/en/mobile.json";
import esMobile from "./locales/es/mobile.json";
import frMobile from "./locales/fr/mobile.json";

export const SUPPORTED_LANGUAGES = ["pt", "en", "fr", "es"] as const;
const LANGUAGE_KEY = "i18nextLng";

const resources = {
  pt: { login: ptLogin, api: ptApi, pages: ptPages, components: ptComponents, modals: ptModals, stores: ptStores, fields: ptFields, mobile: ptMobile },
  en: { login: enLogin, api: enApi, pages: enPages, components: enComponents, modals: enModals, stores: enStores, fields: enFields, mobile: enMobile },
  es: { login: esLogin, api: esApi, pages: esPages, components: esComponents, modals: esModals, stores: esStores, fields: esFields, mobile: esMobile },
  fr: { login: frLogin, api: frApi, pages: frPages, components: frComponents, modals: frModals, stores: frStores, fields: frFields, mobile: frMobile },
};

const detectLanguage = (): string => {
  const stored = storage.getItem(LANGUAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) return stored;
  const device = getLocales()[0]?.languageCode ?? "pt";
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(device) ? device : "pt";
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectLanguage(),
  ns: ["login", "api", "pages", "components", "modals", "stores", "fields", "mobile"],
  fallbackLng: "pt",
  defaultNS: "login",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

i18n.on("languageChanged", (lng) => storage.setItem(LANGUAGE_KEY, lng));

export default i18n;
