import { Settings } from "lucide-react";

export function ProcessingView() {
  return (
    <div className="flex flex-col items-center gap-6 animate-fade-up">
      <div className="w-20 h-20 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-md">
        <Settings className="w-10 h-10 text-primary animate-spin-slow" />
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">Understanding your request...</h2>
        <p className="text-muted-foreground text-sm">Analyzing intent and context</p>
      </div>
      {/* Animated dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-accent"
            style={{
              animation: "mic-pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
