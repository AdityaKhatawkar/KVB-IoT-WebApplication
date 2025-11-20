interface Window {
  googleTranslateElementInit?: () => void;
  google?: {
    translate: {
      TranslateElement: new (
        config: { pageLanguage: string; autoDisplay: boolean },
        elementId: string
      ) => void;
    };
  };
  changeLanguage?: (langCode: string) => void;
  resetTranslation?: () => boolean;
}

