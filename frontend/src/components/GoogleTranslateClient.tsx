// "use client";

import { useEffect } from "react";

declare global {
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
}

export default function GoogleTranslateClient() {
  useEffect(() => {
    window.googleTranslateElementInit = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: "en", autoDisplay: false },
          "google_translate_element"
        );
      }
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    window.changeLanguage = function (langCode: string) {
      const selectElement = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;

      const applyChange = () => {
        if (selectElement && langCode) {
          selectElement.value = langCode;
          selectElement.dispatchEvent(new Event("change", { bubbles: true }));
        }
      };

      if (selectElement) applyChange();
      else setTimeout(applyChange, 500);
    };

    window.resetTranslation = function () {
      const selectElement = document.querySelector(
        ".goog-te-combo"
      ) as HTMLSelectElement | null;

      if (selectElement) {
        selectElement.value = "";
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
        selectElement.click();
      }

      document.documentElement.classList.remove(
        "translated-ltr",
        "translated-rtl",
        "translated-lr",
        "translated-rl"
      );

      // Clear Google Translate cookies
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name =
          eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();

        if (name.includes("googtrans")) {
          document.cookie =
            name +
            "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

          document.cookie =
            name +
            `=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        }
      });

      // Clear localStorage keys
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.includes("googtrans") || key.includes("google.translate")) {
            localStorage.removeItem(key);
          }
        });
      } catch {}

      return true;
    };
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}
