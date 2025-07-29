import React, { useState } from "react";
import EquipmentTab from "@/components/game/equipment-tab";
import StatusTab from "@/components/game/status-tab";
import EnhancedInventory from "@/components/game/enhanced-inventory";
import type { Player, Resource, Equipment } from "@shared/types";

interface EnhancedInventoryWithTabsProps {
  playerId: string;
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  isBlocked: boolean;
}

export default function EnhancedInventoryWithTabs({ 
  playerId, 
  resources, 
  equipment, 
  player, 
  isBlocked 
}: EnhancedInventoryWithTabsProps) {
  const [activeSubTab, setActiveSubTab] = useState("equipment");

  const subTabs = [
    { id: "equipment", label: "Equipamentos", emoji: "⚔️" },
    { id: "status", label: "Status", emoji: "📊" },
    { id: "inventory", label: "Inventário", emoji: "🎒" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="flex border-b border-gray-200">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-all border-b-2 ${
                isActive 
                  ? "border-blue-500 text-blue-600 bg-blue-50" 
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[400px]">
        {activeSubTab === "equipment" && (
          <EquipmentTab
            player={player}
            equipment={equipment}
          />
        )}

        {activeSubTab === "status" && (
          <StatusTab
            player={player}
          />
        )}

        {activeSubTab === "inventory" && (
          <EnhancedInventory
            playerId={playerId}
            resources={resources}
            equipment={equipment}
            player={player}
            isBlocked={isBlocked}
          />
        )}
      </div>
    </div>
  );
}