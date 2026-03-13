'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  hasMore: boolean;
}

const Pagination = ({ currentPage, onPageChange, loading, hasMore }: PaginationProps) => {
  // We'll show 5 pages at a time.
  // If currentPage is 1, we show [1, 2, 3, 4, 5]
  // If currentPage is 3, we show [1, 2, 3, 4, 5]
  // If currentPage is 5, we show [3, 4, 5, 6, 7]
  
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    
    // Adjust startPage if we are near the end (but we don't know total pages)
    // For now we just show 5 pages starting from max(1, current - 2)
    for (let i = 0; i < 5; i++) {
      pages.push(startPage + i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center space-x-2 pt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={loading || currentPage === 1}
        className="flex items-center justify-center p-2 rounded-lg border border-light-200 dark:border-dark-200 hover:bg-light-200 dark:hover:bg-dark-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} className="text-gray-600 dark:text-gray-400" />
      </button>

      <div className="flex items-center space-x-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading || (!hasMore && page > currentPage)}
            className={cn(
              "flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              currentPage === page
                ? "bg-blue-600 border-blue-600 text-white font-medium"
                : "border-light-200 dark:border-dark-200 hover:bg-light-200 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={loading || !hasMore}
        className="flex items-center justify-center p-2 rounded-lg border border-light-200 dark:border-dark-200 hover:bg-light-200 dark:hover:bg-dark-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next page"
      >
        <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
};

export default Pagination;
