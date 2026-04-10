import { Check, Pencil, RotateCcw } from "lucide-react";

interface ActionButtonsProps {
  onConfirm: () => void;
  onEdit: () => void;
  loading?: boolean;
}

export function ActionButtons({ onConfirm, onEdit, loading }: ActionButtonsProps) {
  return (
    <div className="flex gap-3 w-full max-w-md animate-fade-up">
      <button
        onClick={onEdit}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl
          bg-card border border-border text-foreground font-medium
          hover:bg-secondary transition-colors disabled:opacity-50"
      >
        <RotateCcw className="w-5 h-5" />
        Try Again
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl
          bg-accent text-accent-foreground font-semibold
          hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
        ) : (
          <Check className="w-5 h-5" />
        )}
        Confirm
      </button>
    </div>
  );
}
