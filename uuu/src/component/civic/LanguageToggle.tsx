interface LanguageToggleProps {
  language: string;
  onChange: (lang: string) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border shadow-sm">
      <button
        onClick={() => onChange("en-US")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          language === "en-US"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange("bn-BD")}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          language === "bn-BD"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
