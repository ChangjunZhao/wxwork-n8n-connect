"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import type { ConnectionPagination } from "@/lib/types";

interface ConnectionPaginationProps {
  pagination: ConnectionPagination;
  onPageChange: (page: number) => void;
}

export function ConnectionPagination({ pagination, onPageChange }: ConnectionPaginationProps) {
  const { page, totalPages, hasNextPage, hasPreviousPage, total, limit } = pagination;

  // 计算显示的页码范围
  const getPageNumbers = () => {
    const delta = 2; // 当前页前后显示的页数
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pageNumbers = getPageNumbers();
  const startItem = total > 0 ? (page - 1) * limit + 1 : 0;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      {/* 显示当前范围信息 - 始终显示 */}
      <div className="text-sm text-muted-foreground">
        {total > 0 ? (
          <>显示第 {startItem} - {endItem} 条，共 {total} 条记录</>
        ) : (
          <>暂无记录</>
        )}
      </div>

      {/* 分页控件 - 只有多页时才显示 */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-1">
          {/* 第一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={!hasPreviousPage}
            className="h-8 w-8"
            title="第一页"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* 上一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPreviousPage}
            className="h-8 w-8"
            title="上一页"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* 页码 */}
          <div className="flex items-center space-x-1">
            {pageNumbers.map((pageNum, index) => {
              if (pageNum === '...') {
                return (
                  <span key={`dots-${index}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                );
              }

              const pageNumber = pageNum as number;
              const isCurrentPage = pageNumber === page;

              return (
                <Button
                  key={pageNumber}
                  variant={isCurrentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="h-8 w-8"
                  disabled={isCurrentPage}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          {/* 下一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            className="h-8 w-8"
            title="下一页"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* 最后一页 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={!hasNextPage}
            className="h-8 w-8"
            title="最后一页"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 