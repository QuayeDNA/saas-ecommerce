import React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../../../design-system/components/button";
import { formatMasked } from "../../../../utils/format";

interface MaskedValueProps {
  value?: string;
  revealed: boolean;
  onToggle: () => void;
}

export const MaskedValue: React.FC<MaskedValueProps> = ({ value, revealed, onToggle }) => (
  <>
    <div className="font-mono text-sm break-all whitespace-pre-wrap max-w-full overflow-auto text-[var(--text-primary)]">
      {revealed ? (value || "Not configured") : formatMasked(value)}
    </div>
    <Button
      size="sm"
      variant="ghost"
      leftIcon={revealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      onClick={onToggle}
      aria-label={revealed ? "Hide value" : "Reveal value"}
    >
      {revealed ? "Hide" : "Reveal"}
    </Button>
  </>
);
