"use client";

import React from "react";
import { Button } from "@merlynn/ui";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps): React.JSX.Element {
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  /** Build the set of page numbers to display: first, last, and 2 around current. */
  function getPageNumbers(): number[] {
    const pages = new Set<number>();
    pages.add(1);
    pages.add(totalPages);
    for (let i = page - 2; i <= page + 2; i++) {
      if (i >= 1 && i <= totalPages) pages.add(i);
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <span className="text-sm text-slate-400">
        Showing {from}-{to} of {total}
      </span>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border-slate-700 text-slate-300 disabled:opacity-40"
        >
          Previous
        </Button>

        {pageNumbers.map((p, idx) => {
          const prev = pageNumbers[idx - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;

          return (
            <span key={p} className="flex items-center">
              {showEllipsis && <span className="px-1 text-slate-500">&hellip;</span>}
              <Button
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                className={
                  p === page ? "bg-blue-600 text-white" : "border-slate-700 text-slate-300"
                }
              >
                {p}
              </Button>
            </span>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border-slate-700 text-slate-300 disabled:opacity-40"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
