import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "بحث..." }: SearchInputProps) {
  return (
    <div className="relative max-w-sm">
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-9"
      />
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function usePagination<T>(items: T[], pageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
    totalItems: items.length,
  };
}

export function useSearchFilter<T>(items: T[], searchFields: (keyof T)[], query: string): T[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) => {
      const val = item[field];
      return typeof val === "string" && val.toLowerCase().includes(lowerQuery);
    })
  );
}