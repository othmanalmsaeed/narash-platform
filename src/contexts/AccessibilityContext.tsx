import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type FontSize = "small" | "medium" | "large" | "xlarge";
type LineSpacing = "normal" | "wide" | "xwide";
type LetterSpacing = "normal" | "wide";

type AccessibilityContextType = {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (v: boolean) => void;
  lineSpacing: LineSpacing;
  setLineSpacing: (v: LineSpacing) => void;
  letterSpacing: LetterSpacing;
  setLetterSpacing: (v: LetterSpacing) => void;
  focusMode: boolean;
  setFocusMode: (v: boolean) => void;
  resetAll: () => void;
};

const fontSizeMap: Record<FontSize, string> = {
  small: "14px",
  medium: "16px",
  large: "18px",
  xlarge: "22px",
};

const STORAGE_KEY = "wbl-accessibility";

type StoredSettings = {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  lineSpacing: LineSpacing;
  letterSpacing: LetterSpacing;
  focusMode: boolean;
};

const defaults: StoredSettings = {
  fontSize: "medium",
  highContrast: false,
  reduceMotion: false,
  lineSpacing: "normal",
  letterSpacing: "normal",
  focusMode: false,
};

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
    // migrate old key
    const oldFont = localStorage.getItem("wbl-font-size") as FontSize | null;
    if (oldFont) return { ...defaults, fontSize: oldFont };
  } catch {}
  return defaults;
}

function saveSettings(s: StoredSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoredSettings>(loadSettings);

  const update = (patch: Partial<StoredSettings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });

  // Apply all classes/styles to <html>
  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = fontSizeMap[settings.fontSize];
    el.classList.toggle("high-contrast", settings.highContrast);
    el.classList.toggle("reduce-motion", settings.reduceMotion);
    el.classList.toggle("line-spacing-wide", settings.lineSpacing === "wide");
    el.classList.toggle("line-spacing-xwide", settings.lineSpacing === "xwide");
    el.classList.toggle("letter-spacing-wide", settings.letterSpacing === "wide");
    el.classList.toggle("focus-enhanced", settings.focusMode);
  }, [settings]);

  const ctx: AccessibilityContextType = {
    fontSize: settings.fontSize,
    setFontSize: (v) => update({ fontSize: v }),
    highContrast: settings.highContrast,
    setHighContrast: (v) => update({ highContrast: v }),
    reduceMotion: settings.reduceMotion,
    setReduceMotion: (v) => update({ reduceMotion: v }),
    lineSpacing: settings.lineSpacing,
    setLineSpacing: (v) => update({ lineSpacing: v }),
    letterSpacing: settings.letterSpacing,
    setLetterSpacing: (v) => update({ letterSpacing: v }),
    focusMode: settings.focusMode,
    setFocusMode: (v) => update({ focusMode: v }),
    resetAll: () => {
      setSettings(defaults);
      saveSettings(defaults);
    },
  };

  return (
    <AccessibilityContext.Provider value={ctx}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}

export const fontSizeLabels: Record<FontSize, string> = {
  small: "صغير",
  medium: "متوسط",
  large: "كبير",
  xlarge: "كبير جدًا",
};

export const lineSpacingLabels: Record<LineSpacing, string> = {
  normal: "عادي",
  wide: "واسع",
  xwide: "واسع جدًا",
};

export const letterSpacingLabels: Record<LetterSpacing, string> = {
  normal: "عادي",
  wide: "واسع",
};
