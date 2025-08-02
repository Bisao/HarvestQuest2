import React, { useState } from "react";
import EquipmentTab from "@/components/game/equipment-tab";
import StatusTab from "@/components/game/status-tab";
import InventoryTab from "@/components/game/inventory-tab";
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
      {/* Sub-tabs Navigation - Following main tabs style */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all ${
                isActive 
                  ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px" 
                  : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
              }`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{
                tab.id === "equipment" ? "Equip." : 
                tab.id === "status" ? "Status" : 
                "Inv."
              }</span>
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
          <InventoryTab
            playerId={playerId}
            resources={resources}
            currentWeight={player.inventoryWeight}
            maxWeight={player.maxInventoryWeight}
          />
        )}
      </div>
    </div>
  );
}