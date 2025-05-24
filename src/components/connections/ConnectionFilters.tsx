"use client";

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterParams {
  search: string;
  hasN8nWebhook: string; // 'all' | 'true' | 'false'
  page: number;
  limit: number;
}

interface ConnectionFiltersProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  totalResults?: number;
}

export function ConnectionFilters({ filters, onFiltersChange, totalResults }: ConnectionFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: localSearch,
      page: 1, // 重置到第一页
    });
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (value === '') {
      onFiltersChange({
        ...filters,
        search: '',
        page: 1,
      });
    }
  };

  const handleN8nWebhookFilter = (value: string) => {
    onFiltersChange({
      ...filters,
      hasN8nWebhook: value,
      page: 1,
    });
  };

  const handleLimitChange = (value: string) => {
    onFiltersChange({
      ...filters,
      limit: parseInt(value),
      page: 1,
    });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      hasN8nWebhook: 'all',
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters = filters.search || filters.hasN8nWebhook !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* 搜索框 */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索应用名称、企业ID或应用ID..."
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* n8n Webhook 筛选 */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="webhook-filter" className="text-sm font-medium whitespace-nowrap">
            Webhook状态:
          </Label>
          <Select value={filters.hasN8nWebhook} onValueChange={handleN8nWebhookFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">已配置</SelectItem>
              <SelectItem value="false">未配置</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 每页显示数量 */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="limit-select" className="text-sm font-medium whitespace-nowrap">
            每页:
          </Label>
          <Select value={filters.limit.toString()} onValueChange={handleLimitChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 清除筛选 */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="whitespace-nowrap"
          >
            <X className="mr-1 h-4 w-4" />
            清除筛选
          </Button>
        )}
      </div>

      {/* 活动筛选标签和结果数量 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              <Filter className="mr-1 h-3 w-3" />
              搜索: "{filters.search}"
            </Badge>
          )}
          {filters.hasN8nWebhook !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              <Filter className="mr-1 h-3 w-3" />
              Webhook: {filters.hasN8nWebhook === 'true' ? '已配置' : '未配置'}
            </Badge>
          )}
        </div>

        {totalResults !== undefined && (
          <div className="text-sm text-muted-foreground">
            共找到 {totalResults} 个连接
          </div>
        )}
      </div>
    </div>
  );
} 