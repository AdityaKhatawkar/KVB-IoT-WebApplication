"use client";

import { useEffect } from "react";

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

    // Expose translate function globally for navbar to use
    window.changeLanguage = function (langCode) {
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement && langCode) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // Wait for Google Translate to load
        setTimeout(() => {
          const selectElement = document.querySelector(".goog-te-combo");
          if (selectElement && langCode) {
            selectElement.value = langCode;
            selectElement.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }, 500);
      }
    };

    // Expose reset function to return to original language
    window.resetTranslation = function () {
      const selectElement = document.querySelector(".goog-te-combo");
      
      if (selectElement) {
        // Set to empty string (original language)
        selectElement.value = "";
        selectElement.dispatchEvent(new Event("change", { bubbles: true }));
        
        // Also trigger a click event
        selectElement.click();
      }
      
      // Remove translation classes
      document.documentElement.classList.remove(
        "translated-ltr",
        "translated-rtl",
        "translated-lr",
        "translated-rl"
      );
      
      // Clear Google Translate cookies
      const cookies = document.cookie.split(";");
      cookies.forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        if (name.includes("googtrans")) {
          // Clear cookie for current path and root path
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
        }
      });
      
      // Clear localStorage entries related to Google Translate
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.includes("googtrans") || key.includes("google.translate")) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        // Ignore localStorage errors
      }
      
      return true;
    };
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}