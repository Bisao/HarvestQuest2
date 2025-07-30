import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Player, Resource, StorageItem, InventoryItem } from "@shared/types";

interface ConsumptionSystemProps {
  player: Player;
  resources: Resource[];
  inventoryItems: InventoryItem[];
  storageItems: StorageItem[];
}

interface ConsumableItem {
  id: string;
  name: string;
  emoji: string;
  type: 'food' | 'drink';
  hungerRestore: number;
  thirstRestore: number;
  quantity: number;
  location: 'inventory' | 'storage';
}

export default function ConsumptionSystem({ 
  player, 
  resources, 
  inventoryItems, 
  storageItems 
}: ConsumptionSystemProps) {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ConsumableItem | null>(null);
  const [consumeModalOpen, setConsumeModalOpen] = useState(false);

  // Food and drink resource IDs (based on the resources we saw)
  const CONSUMABLE_RESOURCES = {
    // Drinks
    'res-a1c9e5f7-3b8d-4e03-9a14-2c8e6f9b7dee': { // Suco de Frutas
      type: 'drink' as const,
      hungerRestore: 5,
      thirstRestore: 15
    },
    'res-8bd33b18-a241-4859-ae9f-870fab5673d0': { // Água Fresca
      type: 'drink' as const,
      hungerRestore: 0,
      thirstRestore: 20
    },
    
    // Foods
    'res-c9e5a1f7-8d3b-4e02-9a13-6c2e8f7b5def': { // Cogumelos Assados
      type: 'food' as const,
      hungerRestore: 15,
      thirstRestore: 0
    },
    'res-e5a1c9f7-3d8b-4e01-9a12-8c6e2f9b7de0': { // Peixe Grelhado
      type: 'food' as const,
      hungerRestore: 25,
      thirstRestore: 0
    },
    'res-a1f7e5c9-8b3d-4e00-9a11-2c8e6f5b9df1': { // Carne Assada
      type: 'food' as const,
      hungerRestore: 30,
      thirstRestore: 0
    },
    'res-f7e5a1c9-3d8b-4e99-9a10-6c2e8f9b7df2': { // Ensopado de Carne
      type: 'food' as const,
      hungerRestore: 40,
      thirstRestore: 5
    }
  };

  const consumeMutation = useMutation({
    mutationFn: async ({ 
      itemId, 
      location, 
      hungerRestore, 
      thirstRestore 
    }: {
      itemId: string;
      location: 'inventory' | 'storage';
      hungerRestore: number;
      thirstRestore: number;
    }) => {
      const response = await apiRequest("POST", `/api/player/${player.id}/consume`, {
        itemId,
        location,
        hungerRestore,
        thirstRestore
      });
      if (!response.ok) throw new Error("Failed to consume item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player/Player1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory", player.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
      setConsumeModalOpen(false);
      setSelectedItem(null);
      toast({
        title: "Item consumido",
        description: "Item consumido com sucesso. Status atualizado.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao consumir item.",
        variant: "destructive",
      });
    },
  });

  // Get all consumable items from inventory and storage
  const getConsumableItems = (): ConsumableItem[] => {
    const items: ConsumableItem[] = [];

    // Check inventory items
    inventoryItems.forEach(invItem => {
      const resource = resources.find(r => r.id === invItem.resourceId);
      const consumableData = CONSUMABLE_RESOURCES[invItem.resourceId as keyof typeof CONSUMABLE_RESOURCES];
      
      if (resource && consumableData) {
        items.push({
          id: invItem.resourceId,
          name: resource.name,
          emoji: resource.emoji,
          type: consumableData.type,
          hungerRestore: consumableData.hungerRestore,
          thirstRestore: consumableData.thirstRestore,
          quantity: invItem.quantity,
          location: 'inventory'
        });
      }
    });

    // Check storage items
    storageItems.forEach(storageItem => {
      if (storageItem.itemType !== 'resource') return;
      
      const resource = resources.find(r => r.id === storageItem.resourceId);
      const consumableData = CONSUMABLE_RESOURCES[storageItem.resourceId as keyof typeof CONSUMABLE_RESOURCES];
      
      if (resource && consumableData) {
        items.push({
          id: storageItem.resourceId,
          name: resource.name,
          emoji: resource.emoji,
          type: consumableData.type,
          hungerRestore: consumableData.hungerRestore,
          thirstRestore: consumableData.thirstRestore,
          quantity: storageItem.quantity,
          location: 'storage'
        });
      }
    });

    return items;
  };

  const consumableItems = getConsumableItems();
  const foodItems = consumableItems.filter(item => item.type === 'food');
  const drinkItems = consumableItems.filter(item => item.type === 'drink');

  const handleConsume = (item: ConsumableItem) => {
    consumeMutation.mutate({
      itemId: item.id,
      location: item.location,
      hungerRestore: item.hungerRestore,
      thirstRestore: item.thirstRestore
    });
  };

  const ItemCard = ({ item }: { item: ConsumableItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.emoji}</span>
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <div className="flex gap-2 text-sm text-gray-600">
                <span>Qtd: {item.quantity}</span>
                <Badge variant="outline" className="text-xs">
                  {item.location === 'inventory' ? 'Inventário' : 'Armazém'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-2">
              {item.hungerRestore > 0 && (
                <div className="flex items-center gap-1">
                  <span>🍖</span>
                  <span>+{item.hungerRestore}</span>
                </div>
              )}
              {item.thirstRestore > 0 && (
                <div className="flex items-center gap-1">
                  <span>💧</span>
                  <span>+{item.thirstRestore}</span>
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={() => handleConsume(item)}
              disabled={consumeMutation.isPending}
            >
              Consumir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Player Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Status do Jogador</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">🍖 Fome</span>
                <span className="text-sm">{player.hunger}/{player.maxHunger}</span>
              </div>
              <Progress 
                value={(player.hunger / player.maxHunger) * 100} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">💧 Sede</span>
                <span className="text-sm">{player.thirst}/{player.maxThirst}</span>
              </div>
              <Progress 
                value={(player.thirst / player.maxThirst) * 100} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🍖</span>
            <span>Comida Disponível</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {foodItems.length > 0 ? (
            <div className="space-y-3">
              {foodItems.map((item, index) => (
                <ItemCard key={`${item.id}-${item.location}-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma comida disponível</p>
              <p className="text-sm mt-2">Crie comida no sistema de crafting ou colete recursos alimentares.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drink Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💧</span>
            <span>Bebida Disponível</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drinkItems.length > 0 ? (
            <div className="space-y-3">
              {drinkItems.map((item, index) => (
                <ItemCard key={`${item.id}-${item.location}-${index}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma bebida disponível</p>
              <p className="text-sm mt-2">Colete água fresca ou crie bebidas no sistema de crafting.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}