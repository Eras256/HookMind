'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import en from '../dictionaries/en.json';
import es from '../dictionaries/es.json';
import zh from '../dictionaries/zh.json';

type Language = 'en' | 'es' | 'zh';

const dictionaries = { en, es, zh };

interface LanguageContextProps {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof en; // Use 'en' dictionary as the base type for autocomplete
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        // Recover user preference from localStorage
        const saved = localStorage.getItem('app_lang') as Language;
        if (saved && ['en', 'es', 'zh'].includes(saved)) {
            setLanguage(saved);
        }
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('app_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: dictionaries[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
    return context;
};
