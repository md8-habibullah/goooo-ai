import { Mic, MicOff } from "lucide-react";

interface MicButtonProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
}

export function MicButton({ isListening, onStart, onStop, disabled }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-mic-ring" />
            <div className="absolute inset-0 rounded-full bg-accent/10 animate-mic-ring" style={{ animationDelay: "0.5s" }} />
          </>
        )}

        <button
          onClick={isListening ? onStop : onStart}
          disabled={disabled}
          className={`
            relative z-10 w-28 h-28 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-lg
            ${isListening
              ? "bg-accent text-accent-foreground animate-mic-pulse shadow-accent/30"
              : "bg-card text-primary hover:bg-secondary border-2 border-border hover:border-accent/50 shadow-md"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}
          `}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          {isListening ? (
            <MicOff className="w-10 h-10" />
          ) : (
            <Mic className="w-10 h-10" />
          )}
        </button>
      </div>

      <p className="text-muted-foreground text-sm font-medium">
        {isListening ? "Tap to stop" : "Tap to speak"}
      </p>
    </div>
  );
}
