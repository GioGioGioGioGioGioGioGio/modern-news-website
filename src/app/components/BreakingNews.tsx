import { AlertCircle } from 'lucide-react';

interface BreakingNewsProps {
  text: string;
}

export function BreakingNews({ text }: BreakingNewsProps) {
  return (
    <div className="bg-destructive text-destructive-foreground py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <p className="text-sm font-medium uppercase tracking-wide">Ultima ora:</p>
        <p className="text-sm truncate">{text}</p>
      </div>
    </div>
  );
}
