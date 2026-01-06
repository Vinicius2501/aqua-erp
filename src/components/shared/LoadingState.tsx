import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Carregando...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
  );
}

interface LoadingSkeletonProps {
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, className }: LoadingSkeletonProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Cabeçalho */}
      <div className="flex gap-4 pb-2 border-b border-border">
        <div className="h-4 w-24 skeleton-pulse" />
        <div className="h-4 w-32 skeleton-pulse" />
        <div className="h-4 w-20 skeleton-pulse" />
        <div className="h-4 w-28 skeleton-pulse" />
        <div className="h-4 w-24 skeleton-pulse flex-1" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-border-muted">
          <div className="h-4 w-24 skeleton-pulse" />
          <div className="h-4 w-32 skeleton-pulse" />
          <div className="h-4 w-20 skeleton-pulse" />
          <div className="h-4 w-28 skeleton-pulse" />
          <div className="h-4 w-24 skeleton-pulse flex-1" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("p-6 bg-card rounded-lg border border-border", className)}
    >
      <div className="space-y-4">
        <div className="h-5 w-1/3 skeleton-pulse" />
        <div className="h-8 w-1/2 skeleton-pulse" />
        <div className="h-4 w-2/3 skeleton-pulse" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="h-5 w-40 skeleton-pulse mb-4" />
          <div className="h-64 skeleton-pulse" />
        </div>
        <div className="p-6 bg-card rounded-lg border border-border">
          <div className="h-5 w-40 skeleton-pulse mb-4" />
          <div className="h-64 skeleton-pulse" />
        </div>
      </div>

      {/* Table */}
      <div className="p-6 bg-card rounded-lg border border-border">
        <div className="h-5 w-48 skeleton-pulse mb-4" />
        <TableSkeleton rows={5} />
      </div>
    </div>
  );
}
