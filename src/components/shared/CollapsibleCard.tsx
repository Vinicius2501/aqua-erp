import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  /** Título exibido no header */
  title: string;
  /** Descrição opcional abaixo do título */
  description?: string;
  /** Ícone opcional no header */
  icon?: React.ReactNode;
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Estado inicial (aberto por padrão) */
  defaultOpen?: boolean;
  /** Chave para persistência em localStorage. Se fornecida, o estado será persistido */
  storageKey?: string;
  /** Slot opcional à direita do header para ações/badges */
  rightSlot?: React.ReactNode;
  /** Classes adicionais para o Card */
  className?: string;
  /** Classes adicionais para o CardContent */
  contentClassName?: string;
}

/**
 * Card com funcionalidade de recolher/expandir.
 * Persiste estado em localStorage quando storageKey é fornecido.
 * Acessível com suporte a teclado e aria-expanded.
 */
export function CollapsibleCard({
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  storageKey,
  rightSlot,
  className,
  contentClassName,
}: CollapsibleCardProps) {
  // Recupera estado inicial do localStorage se storageKey for fornecido
  const getInitialState = (): boolean => {
    if (!storageKey) return defaultOpen;
    try {
      const stored = localStorage.getItem(`collapsible-card-${storageKey}`);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignora erros de parsing
    }
    return defaultOpen;
  };

  const [isOpen, setIsOpen] = React.useState(getInitialState);

  // Persiste estado no localStorage quando muda
  React.useEffect(() => {
    if (storageKey) {
      try {
        localStorage.setItem(
          `collapsible-card-${storageKey}`,
          JSON.stringify(isOpen)
        );
      } catch {
        // Ignora erros de storage
      }
    }
  }, [isOpen, storageKey]);

  const contentId = React.useId();

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200",
        isOpen
          ? "pt-0"
          : " shadow-none hover:bg-muted/30 hover:border-muted-foreground/20",
        className
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="px-0 pt-0">
          <CollapsibleTrigger
            className={cn(
              "flex w-full justify-between",
              "text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isOpen
                ? "pt-1 pb-1 px-4 hover:bg-muted/50 rounded-lg items-start"
                : "h-0.5 px-4 items-center"
            )}
            aria-expanded={isOpen}
            aria-controls={contentId}
          >
            <div
              className={cn(
                "flex items-center min-w-0 flex-1",
                isOpen ? "gap-3" : "gap-2"
              )}
            >
              {icon && (
                <div
                  className={cn(
                    "shrink-0 transition-all duration-200",
                    "p-2 rounded-lg bg-primary/10 text-primary"
                  )}
                >
                  {icon}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2
                  className={cn(
                    "font-medium truncate transition-all duration-200",
                    isOpen
                      ? "text-lg text-foreground"
                      : "text-sm text-muted-foreground"
                  )}
                >
                  {title}
                </h2>
                {description && isOpen && (
                  <p className="text-sm text-muted-foreground truncate">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div
              className={cn(
                "flex items-center shrink-0",
                isOpen && "self-center"
              )}
            >
              {rightSlot}
              <ChevronDown
                className={cn(
                  "transition-transform duration-200",
                  isOpen
                    ? "h-4 w-4 -rotate-180 text-primary"
                    : "h-4 w-4 rotate-0 text-muted-foreground"
                )}
                aria-hidden="true"
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent
          id={contentId}
          className={cn(
            "overflow-hidden transition-all duration-200 ease-in-out",
            "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
          )}
        >
          <CardContent className={cn("pt-2 pb-4 px-4", contentClassName)}>
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default CollapsibleCard;
