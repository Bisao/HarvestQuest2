
/**
 * INVENTORY GRID COMPONENT
 * Modular grid display for inventory items with enhanced interactions
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { EnhancedInventoryItem, InventoryConstraints } from '@shared/types/inventory-types';

interface InventoryGridProps {
  items: EnhancedInventoryItem[];
  constraints: InventoryConstraints;
  selectedItemId?: string;
  onItemClick: (item: EnhancedInventoryItem) => void;
  onItemDoubleClick?: (item: EnhancedInventoryItem) => void;
  onSlotClick?: (slotIndex: number) => void;
  gridSize?: { rows: number; cols: number };
  showEmptySlots?: boolean;
  isBlocked?: boolean;
}

export default function InventoryGrid({
  items,
  constraints,
  selectedItemId,
  onItemClick,
  onItemDoubleClick,
  onSlotClick,
  gridSize = { rows: 4, cols: 9 },
  showEmptySlots = true,
  isBlocked = false
}: InventoryGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  const totalSlots = gridSize.rows * gridSize.cols;

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      uncommon: 'border-green-400 bg-green-50',
      rare: 'border-blue-400 bg-blue-50',
      epic: 'border-purple-400 bg-purple-50',
      legendary: 'border-orange-400 bg-orange-50'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getTypeIcon = (type: string) => {
    return type === 'equipment' ? '⚔️' : '🌿';
  };

  const renderSlot = (slotIndex: number) => {
    const item = items[slotIndex];
    const isSelected = item && item.item.id === selectedItemId;
    const isHovered = hoveredSlot === slotIndex;

    return (
      <TooltipProvider key={slotIndex}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`
                aspect-square border-2 rounded-lg flex items-center justify-center relative
                cursor-pointer transition-all hover:scale-105 group
                ${isSelected ? "border-blue-400 bg-blue-50 shadow-lg" : ""}
                ${item ? 
                  `bg-white border-solid hover:border-blue-300 ${
                    'rarity' in item.itemData ? getRarityColor(item.itemData.rarity) : 'border-gray-300'
                  }` : 
                  "bg-gray-50 border-dashed border-gray-300 hover:border-gray-400"
                }
                ${isBlocked ? "opacity-50 cursor-not-allowed" : ""}
                ${isHovered ? "ring-2 ring-blue-200" : ""}
              `}
              onClick={() => {
                if (isBlocked) return;
                if (item) {
                  onItemClick(item);
                } else if (onSlotClick) {
                  onSlotClick(slotIndex);
                }
              }}
              onDoubleClick={() => {
                if (isBlocked) return;
                if (item && onItemDoubleClick) {
                  onItemDoubleClick(item);
                }
              }}
              onMouseEnter={() => setHoveredSlot(slotIndex)}
              onMouseLeave={() => setHoveredSlot(null)}
            >
              {item ? (
                <>
                  {/* Item Icon */}
                  <span className="text-2xl">{item.itemData.emoji}</span>
                  
                  {/* Quantity Badge */}
                  <span className="absolute bottom-1 right-1 text-xs font-bold bg-gray-900/90 text-white rounded px-1 min-w-[16px] text-center">
                    {item.item.quantity > 999 ? '999+' : item.item.quantity}
                  </span>
                  
                  {/* Rarity Indicator */}
                  {'rarity' in item.itemData && (
                    <div className={`absolute top-1 left-1 w-2 h-2 rounded-full ${
                      item.itemData.rarity === 'common' ? 'bg-gray-500' :
                      item.itemData.rarity === 'uncommon' ? 'bg-green-500' :
                      item.itemData.rarity === 'rare' ? 'bg-blue-500' :
                      item.itemData.rarity === 'epic' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                  )}
                  
                  {/* Type Indicator */}
                  <div className="absolute top-1 right-1 text-xs opacity-70">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  {/* Consumable Indicator */}
                  {item.isConsumable && (
                    <div className="absolute bottom-1 left-1 text-xs">
                      🍽️
                    </div>
                  )}

                  {/* Equipment Indicator */}
                  {item.isEquipment && (
                    <div className="absolute bottom-1 left-1 text-xs">
                      ⚔️
                    </div>
                  )}
                  
                  {/* Hover Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900/90 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {item.itemData.name}
                  </div>
                </>
              ) : showEmptySlots ? (
                <span className="text-gray-300 text-lg">•</span>
              ) : null}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {item ? (
              <div className="max-w-xs">
                <p className="font-semibold">{item.itemData.name}</p>
                <p className="text-sm">Quantidade: {item.item.quantity}</p>
                <p className="text-sm">Peso total: {item.totalWeight.toFixed(1)}g</p>
                <p className="text-sm">Valor total: {item.totalValue} moedas</p>
                {'rarity' in item.itemData && (
                  <Badge variant={
                    item.itemData.rarity === "rare" ? "destructive" : 
                    item.itemData.rarity === "uncommon" ? "secondary" : "outline"
                  } className="text-xs mt-1">
                    {item.itemData.rarity === "common" ? "Comum" : 
                     item.itemData.rarity === "uncommon" ? "Incomum" : 
                     item.itemData.rarity === "rare" ? "Raro" :
                     item.itemData.rarity === "epic" ? "Épico" : "Lendário"}
                  </Badge>
                )}
                {item.isConsumable && (
                  <Badge variant="secondary" className="text-xs mt-1 ml-1">
                    Consumível
                  </Badge>
                )}
                {item.isEquipment && (
                  <Badge variant="outline" className="text-xs mt-1 ml-1">
                    Equipamento
                  </Badge>
                )}
              </div>
            ) : (
              <p>Slot vazio</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      {/* Inventory Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Capacidade do Inventário:</span>
                <span>{constraints.currentWeight.toFixed(1)}kg / {constraints.maxWeight}kg</span>
              </div>
              <Progress 
                value={(constraints.currentWeight / constraints.maxWeight) * 100} 
                className="w-full h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Slots Utilizados:</span>
                <span>{constraints.currentSlots} / {constraints.maxSlots}</span>
              </div>
              <Progress 
                value={(constraints.currentSlots / constraints.maxSlots) * 100} 
                className="w-full h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <div className={`grid grid-cols-6 md:grid-cols-${gridSize.cols} gap-1 md:gap-2`}>
        {Array.from({ length: totalSlots }, (_, i) => renderSlot(i))}
      </div>

      {/* Grid Info */}
      <div className="text-center text-sm text-gray-500">
        {items.length} itens • {gridSize.rows}x{gridSize.cols} slots
      </div>
    </div>
  );
}
