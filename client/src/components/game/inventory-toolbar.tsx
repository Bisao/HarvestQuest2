
/**
 * INVENTORY TOOLBAR COMPONENT
 * Provides filtering, sorting, and action controls for inventory
 */

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Filter, SortAsc, SortDesc, X } from 'lucide-react';

interface InventoryToolbarProps {
  filters: {
    search: string;
    type: 'all' | 'resource' | 'equipment';
    rarity: 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    consumableOnly: boolean;
  };
  sorting: {
    field: 'name' | 'quantity' | 'weight' | 'value' | 'type';
    order: 'asc' | 'desc';
  };
  stats: {
    totalCount: number;
    filteredCount: number;
    hasActiveFilters: boolean;
  };
  onFiltersChange: (filters: any) => void;
  onSortingChange: (field: string) => void;
  onClearFilters: () => void;
  onBulkActions?: {
    onStoreAll?: () => void;
    onOrganize?: () => void;
    onAutoEquip?: () => void;
  };
}

export default function InventoryToolbar({
  filters,
  sorting,
  stats,
  onFiltersChange,
  onSortingChange,
  onClearFilters,
  onBulkActions
}: InventoryToolbarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ search: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ type: value });
  };

  const handleRarityChange = (value: string) => {
    onFiltersChange({ rarity: value });
  };

  const handleConsumableToggle = (checked: boolean) => {
    onFiltersChange({ consumableOnly: checked });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        {/* Main toolbar */}
        <div className="flex flex-col gap-4">
          {/* Search and quick filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="🔍 Buscar itens..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>

            <Select value={filters.type} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="resource">Recursos</SelectItem>
                <SelectItem value="equipment">Equipamentos</SelectItem>
              </SelectContent>
            </Select>

            <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  Filtros
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${filtersExpanded ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
            </Collapsible>

            {stats.hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Expanded filters */}
          <Collapsible open={filtersExpanded} onOpenChange={setFiltersExpanded}>
            <CollapsibleContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="rarity-filter" className="text-sm font-medium">Raridade</Label>
                  <Select value={filters.rarity} onValueChange={handleRarityChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Raridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="common">Comum</SelectItem>
                      <SelectItem value="uncommon">Incomum</SelectItem>
                      <SelectItem value="rare">Raro</SelectItem>
                      <SelectItem value="epic">Épico</SelectItem>
                      <SelectItem value="legendary">Lendário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="consumable-only"
                    checked={filters.consumableOnly}
                    onCheckedChange={handleConsumableToggle}
                  />
                  <Label htmlFor="consumable-only" className="text-sm">
                    Apenas consumíveis
                  </Label>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Ordenar por:</Label>
                  <div className="flex gap-1">
                    {['name', 'quantity', 'weight', 'value', 'type'].map((field) => (
                      <Button
                        key={field}
                        variant={sorting.field === field ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSortingChange(field)}
                        className="capitalize"
                      >
                        {field === 'name' && 'Nome'}
                        {field === 'quantity' && 'Qtd'}
                        {field === 'weight' && 'Peso'}
                        {field === 'value' && 'Valor'}
                        {field === 'type' && 'Tipo'}
                        {sorting.field === field && (
                          sorting.order === 'asc' ? 
                            <SortAsc className="w-3 h-3 ml-1" /> : 
                            <SortDesc className="w-3 h-3 ml-1" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Stats and bulk actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {stats.filteredCount} de {stats.totalCount} itens
              </Badge>
              {stats.hasActiveFilters && (
                <Badge variant="outline">
                  Filtros ativos
                </Badge>
              )}
            </div>

            {onBulkActions && (
              <div className="flex items-center gap-2">
                {onBulkActions.onStoreAll && (
                  <Button variant="outline" size="sm" onClick={onBulkActions.onStoreAll}>
                    📦 Guardar Tudo
                  </Button>
                )}
                {onBulkActions.onOrganize && (
                  <Button variant="outline" size="sm" onClick={onBulkActions.onOrganize}>
                    🔄 Organizar
                  </Button>
                )}
                {onBulkActions.onAutoEquip && (
                  <Button variant="outline" size="sm" onClick={onBulkActions.onAutoEquip}>
                    ⚔️ Auto-Equipar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
