import { Shield, HeartPulse, FileText, Info, AlertTriangle, MapPin } from "lucide-react";
import type { IntentResult } from "@/lib/intentProcessor";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Law Enforcement": <Shield className="w-6 h-6" />,
  "Healthcare": <HeartPulse className="w-6 h-6" />,
  "Civic Services": <FileText className="w-6 h-6" />,
  "Information": <Info className="w-6 h-6" />,
  "Emergency": <AlertTriangle className="w-6 h-6" />,
};

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-muted text-muted-foreground border-border",
};

interface ResultCardProps {
  result: IntentResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <div className="w-full max-w-md animate-fade-up">
      {/* Action label */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground">👉 {result.actionLabel}</h2>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-5">
        {/* Category + Intent */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-primary">
            {CATEGORY_ICONS[result.category] || <FileText className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">{result.category}</p>
            <p className="text-lg font-semibold text-foreground capitalize">
              {result.intent.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
          <p className="text-foreground text-sm leading-relaxed">{result.summary}</p>
        </div>

        {/* Location + Priority */}
        <div className="flex gap-3">
          <div className="flex-1 bg-secondary rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Location</span>
            </div>
            <p className="text-foreground font-semibold text-sm">{result.location}</p>
          </div>
          <div className={`flex-1 rounded-xl px-4 py-3 border ${PRIORITY_STYLES[result.priority]}`}>
            <p className="text-xs font-medium uppercase tracking-wider mb-1">Priority</p>
            <p className="font-semibold text-sm capitalize">{result.priority}</p>
          </div>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Confidence</span>
            <span className="text-sm font-bold text-foreground">{confidencePercent}%</span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 bg-accent"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
