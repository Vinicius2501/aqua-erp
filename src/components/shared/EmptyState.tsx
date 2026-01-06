import { cn } from "@/lib/utils";
import { FileX, Search, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-subtle-fill flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary text-center max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
//TODO: Contexto de Idioma
export function NoResultsState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description={
        searchQuery
          ? `Não encontramos resultados para "${searchQuery}". Tente ajustar os filtros.`
          : "Não há itens que correspondam aos filtros selecionados."
      }
    />
  );
}

export function NoPOsState({ onCreateNew }: { onCreateNew?: () => void }) {
  return (
    <EmptyState
      icon={FileX}
      title="Nenhuma PO encontrada"
      description="Você ainda não possui Purchase Orders. Crie sua primeira PO para começar."
      action={
        onCreateNew
          ? { label: "Criar Nova PO", onClick: onCreateNew }
          : undefined
      }
    />
  );
}
