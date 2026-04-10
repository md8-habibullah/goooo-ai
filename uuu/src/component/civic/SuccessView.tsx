import { CheckCircle, ArrowLeft } from "lucide-react";
import type { SavedReport } from "@/lib/intentProcessor";

interface SuccessViewProps {
  report: SavedReport;
  onReset: () => void;
}

export function SuccessView({ report, onReset }: SuccessViewProps) {
  return (
    <div className="w-full max-w-md flex flex-col items-center gap-6 animate-fade-up">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-success" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">Action Completed</h2>
        <p className="text-muted-foreground text-sm">Your report has been submitted successfully</p>
      </div>

      {/* Summary card */}
      <div className="w-full bg-card rounded-2xl border border-border p-5 shadow-sm space-y-3">
        <div className="flex justify-between">
          <span className="text-xs font-medium text-muted-foreground">Report ID</span>
          <span className="text-xs font-mono text-foreground">{report.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-medium text-muted-foreground">Submitted To</span>
          <span className="text-xs text-foreground font-medium">{report.submittedTo}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-medium text-muted-foreground">Category</span>
          <span className="text-xs text-foreground">{report.category}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs font-medium text-muted-foreground">Status</span>
          <span className="text-xs text-success font-semibold capitalize">{report.status}</span>
        </div>
        <hr className="border-border" />
        <p className="text-sm text-foreground">{report.summary}</p>
      </div>

      <button
        onClick={onReset}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border
          text-foreground font-medium hover:bg-secondary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        New Report
      </button>
    </div>
  );
}
