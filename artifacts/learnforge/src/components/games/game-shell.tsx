import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type GameShellProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: React.ReactNode;
};

export function GameShell({ title, subtitle, onBack, children }: GameShellProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          All games
        </Button>
        <div className="text-right">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {subtitle ? (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
