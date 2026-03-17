"use client";

import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@merlynn/ui";

export interface FilterValues {
  search: string;
  riskLevel: string;
  modelName: string;
  dateFrom: string;
  dateTo: string;
}

interface FilterBarProps {
  filters: FilterValues;
  onChange: (filters: FilterValues) => void;
}

export function FilterBar({ filters, onChange }: FilterBarProps): React.JSX.Element {
  const update = (key: keyof FilterValues, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Search */}
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs text-slate-400">Search</label>
        <input
          type="text"
          placeholder="Search supplier or transaction..."
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Risk Level */}
      <div className="min-w-[140px]">
        <label className="mb-1 block text-xs text-slate-400">Risk Level</label>
        <Select value={filters.riskLevel} onValueChange={(v) => update("riskLevel", v)}>
          <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-200">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="HIGH">HIGH</SelectItem>
            <SelectItem value="MEDIUM">MEDIUM</SelectItem>
            <SelectItem value="LOW">LOW</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="min-w-[200px]">
        <label className="mb-1 block text-xs text-slate-400">Model</label>
        <Select value={filters.modelName} onValueChange={(v) => update("modelName", v)}>
          <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-200">
            <SelectValue placeholder="All Models" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Models</SelectItem>
            <SelectItem value="Fraud Analyst — Carl">Fraud Analyst — Carl</SelectItem>
            <SelectItem value="Cyber Risk">Cyber Risk</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date From */}
      <div className="min-w-[150px]">
        <label className="mb-1 block text-xs text-slate-400">From</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update("dateFrom", e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Date To */}
      <div className="min-w-[150px]">
        <label className="mb-1 block text-xs text-slate-400">To</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update("dateTo", e.target.value)}
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    </div>
  );
}
