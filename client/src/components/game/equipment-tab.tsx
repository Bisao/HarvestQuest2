import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Sword, Hammer } from 'lucide-react';
import type { Player, Equipment } from '@shared/types';

interface EquipmentTabProps {
  player: Player;
  equipment: Equipment[];
}

export default function EquipmentTab({ player, equipment }: EquipmentTabProps) {
  const equipmentSlots = [
    { 
      id: "helmet", 
      name: "Capacete", 
      emoji: "🪖", 
      equipped: player.equippedHelmet 
    },
    { 
      id: "chestplate", 
      name: "Peitoral", 
      emoji: "🥼", 
      equipped: player.equippedChestplate 
    },
    { 
      id: "leggings", 
      name: "Perneiras", 
      emoji: "👖", 
      equipped: player.equippedLeggings 
    },
    { 
      id: "boots", 
      name: "Botas", 
      emoji: "🥾", 
      equipped: player.equippedBoots 
    },
    { 
      id: "weapon", 
      name: "Arma", 
      emoji: "⚔️", 
      equipped: player.equippedWeapon 
    },
    { 
      id: "tool", 
      name: "Ferramenta", 
      emoji: "🔨", 
      equipped: player.equippedTool 
    },
  ];

  const getEquipmentIcon = (slotId: string) => {
    switch (slotId) {
      case 'helmet':
      case 'chestplate':
      case 'leggings':
      case 'boots':
        return Shield;
      case 'weapon':
        return Sword;
      case 'tool':
        return Hammer;
      default:
        return Shield;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {equipmentSlots.map((slot) => {
          const equipped = equipment.find(e => e.id === slot.equipped);
          const Icon = getEquipmentIcon(slot.id);
          
          return (
            <Card key={slot.id} className="p-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                  {equipped ? (
                    <span className="text-2xl">{equipped.emoji}</span>
                  ) : (
                    <Icon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">{slot.name}</h3>
                  {equipped ? (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {equipped.name}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      Vazio
                    </div>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full text-xs"
                  disabled
                >
                  {equipped ? 'Trocar' : 'Equipar'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Equipment Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo dos Equipamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Defesa</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">0</div>
              <div className="text-sm text-gray-600">Ataque</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Eficiência</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Especiais</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}