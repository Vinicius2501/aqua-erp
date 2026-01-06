import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

//TODO: Contexto de Idioma
export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center mb-4">
        <AlertTriangle className="h-8 w-2 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-text-secondary text-center max-w-sm mb-4">
        {" "}
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
