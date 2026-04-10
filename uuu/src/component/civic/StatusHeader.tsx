import { Mic, Settings, CheckCircle, Rocket } from "lucide-react";

export type AppPhase = "idle" | "listening" | "processing" | "result" | "success";

const PHASE_CONFIG: Record<AppPhase, { icon: React.ReactNode; label: string; color: string }> = {
  idle: { icon: <Mic className="w-4 h-4" />, label: "Ready", color: "bg-muted text-muted-foreground" },
  listening: { icon: <Mic className="w-4 h-4 animate-pulse" />, label: "Listening...", color: "bg-accent/10 text-accent" },
  processing: { icon: <Settings className="w-4 h-4 animate-spin-slow" />, label: "Processing...", color: "bg-warning/10 text-warning" },
  result: { icon: <CheckCircle className="w-4 h-4" />, label: "Review", color: "bg-success/10 text-success" },
  success: { icon: <Rocket className="w-4 h-4" />, label: "Submitted", color: "bg-success/10 text-success" },
};

interface StatusHeaderProps {
  phase: AppPhase;
  actionLabel?: string;
}

export function StatusHeader({ phase, actionLabel }: StatusHeaderProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <header className="w-full px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center shadow-sm border border-border">
          <span className="text-lg">🇧🇩</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">NagrikAI</h1>
      </div>

      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span>{actionLabel && phase === "result" ? actionLabel : config.label}</span>
      </div>
    </header>
  );
}
