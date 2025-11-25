import { useEffect, useState } from "react";
import { Toaster as Sonner, ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    // Detect system theme
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const listener = () => {
      setTheme(media.matches ? "dark" : "light");
    };

    listener(); // Initial
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
