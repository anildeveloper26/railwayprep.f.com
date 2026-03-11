import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

type Language = "en" | "hi";

interface LanguageContextValue {
  lang: Language;
  toggle: () => void;
  isHindi: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggle: () => {},
  isHindi: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    return (localStorage.getItem("rrb_lang") as Language) ?? "en";
  });
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (language: Language) =>
      authApi.updateProfile({ preferredLanguage: language } as Parameters<typeof authApi.updateProfile>[0]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rrb_lang", lang);
    }
  }, [lang]);

  const toggle = () => {
    const next: Language = lang === "en" ? "hi" : "en";
    setLang(next);
    updateMutation.mutate(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggle, isHindi: lang === "hi" }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
