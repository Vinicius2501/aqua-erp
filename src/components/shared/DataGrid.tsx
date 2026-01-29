import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import { useState } from "react";
import { ErrorState } from "./ErrorState";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { TableSkeleton } from "./LoadingState";
import { NoResultsState } from "./EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  className?: string;
  render?: (item: T) => React.ReactNode;
}

interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  pageSize?: number;
  showPagination?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
}

type SortDirection = "asc" | "desc" | null;

export function DataGrid<T extends { id: string }>({
  data,
  columns,
  loading = false,
  error = false,
  onRetry,
  searchPlaceholder = "Search...",
  onSearch,
  searchValue = "",
  pageSize: initialPageSize = 10,
  showPagination = true,
  onRowClick,
  className,
  defaultSortColumn,
  defaultSortDirection = "asc",
}: DataGridProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortColumn ? defaultSortDirection : null);

  // Ordenação dos dados
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    
    const aValue = (a as Record<string, unknown>)[sortColumn];
    const bValue = (b as Record<string, unknown>)[sortColumn];
    
    // Tratamento para valores nulos/undefined
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === "asc" ? 1 : -1;
    if (bValue == null) return sortDirection === "asc" ? -1 : 1;
    
    // Comparação de strings
    if (typeof aValue === "string" && typeof bValue === "string") {
      const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
      return sortDirection === "asc" ? comparison : -comparison;
    }
    
    // Comparação de números
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    // Comparação de datas (strings ISO)
    if (typeof aValue === "string" && typeof bValue === "string") {
      const aDate = new Date(aValue).getTime();
      const bDate = new Date(bValue).getTime();
      if (!isNaN(aDate) && !isNaN(bDate)) {
        return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
      }
    }
    
    return 0;
  });

  //Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <ArrowUpDown className="h-4 w-4 text-text-secondary" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    return <ArrowDown className="h-4 w-4 text-primary" />;
  };

  if (error) {
    return <ErrorState onRetry={onRetry} />;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {onSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-12"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div>
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={pageSize} />
          </div>
        ) : paginatedData.length === 0 ? (
          <NoResultsState searchQuery={searchValue} />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-subtle-fill/50 hover:bg-subtle-fill/50">
                {columns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      "text-text-secondary font-medium text-xs uppercase tracking-wider",
                      column.sortable && "cursor-pointer select-none",
                      column.className
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow
                  key={item.id}
                  className={cn(
                    "data-grid-row",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((columns) => (
                    <TableCell key={columns.key} className={columns.className}>
                      {columns.render
                        ? columns.render(item)
                        : ((item as Record<string, unknown>)[
                            columns.key
                          ] as React.ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {/* Pagination */}
      {showPagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>Mostrando</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>de {sortedData.length} registros</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-3 text-sm text-text-secondary">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
