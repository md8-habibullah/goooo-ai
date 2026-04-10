interface TranscriptBoxProps {
  transcript: string;
  isListening: boolean;
}

export function TranscriptBox({ transcript, isListening }: TranscriptBoxProps) {
  if (!transcript && !isListening) return null;

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${isListening ? "bg-accent animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isListening ? "Live Transcript" : "Your Input"}
          </span>
        </div>
        <p className="text-foreground text-base leading-relaxed min-h-[2rem]">
          {transcript || (
            <span className="text-muted-foreground italic">Listening for your voice...</span>
          )}
        </p>
      </div>
    </div>
  );
}
