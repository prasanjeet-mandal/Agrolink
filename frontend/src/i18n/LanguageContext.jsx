import * as React from 'react';
import { translate } from './dict';

const LanguageContext = React.createContext(null);
const STORAGE_KEY = 'agrolink_lang';

export function LanguageProvider({ children }) {
  const [lang, setLang] = React.useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // storage may be unavailable; still switch language for the session
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo(
    () => ({ lang, setLang, t: (key) => translate(lang, key) }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}