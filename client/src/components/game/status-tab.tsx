import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Player } from "@shared/types";

interface StatusTabProps {
  player: Player;
}

export default function StatusTab({ player }: StatusTabProps) {
  const getProgressColor = (current: number, max: number, type: 'health' | 'energy' | 'warning') => {
    const percentage = (current / max) * 100;
    
    if (type === 'warning') {
      if (percentage <= 20) return "bg-red-500";
      if (percentage <= 50) return "bg-orange-500";
      return "bg-green-500";
    }
    
    if (type === 'health') {
      if (percentage >= 80) return "bg-green-500";
      if (percentage >= 50) return "bg-yellow-500";
      return "bg-red-500";
    }
    
    return "bg-blue-500";
  };

  const stats = [
    {
      title: "Nível",
      value: player.level,
      max: null,
      emoji: "⭐",
      description: `XP: ${player.experience}`,
      color: "bg-purple-500"
    },
    {
      title: "Fome",
      value: player.hunger,
      max: 100,
      emoji: "🍖",
      description: `${player.hunger}/100`,
      color: getProgressColor(player.hunger, 100, 'warning')
    },
    {
      title: "Sede",
      value: player.thirst,
      max: 100,
      emoji: "💧",
      description: `${player.thirst}/100`,
      color: getProgressColor(player.thirst, 100, 'warning')
    },
  ];

  const inventoryStats = [
    {
      title: "Capacidade do Inventário",
      value: player.currentInventoryWeight,
      max: player.maxInventoryWeight,
      emoji: "🎒",
      description: `${player.currentInventoryWeight}/${player.maxInventoryWeight} kg`,
      color: getProgressColor(player.currentInventoryWeight, player.maxInventoryWeight, 'warning')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Status do Jogador</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{stat.emoji}</span>
                    <span className="font-medium">{stat.title}</span>
                  </div>
                  <Badge variant="secondary">
                    {stat.description}
                  </Badge>
                </div>
                
                {stat.max && (
                  <Progress 
                    value={(stat.value / stat.max) * 100} 
                    className="w-full h-2"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📦</span>
            <span>Capacidade</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryStats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{stat.emoji}</span>
                    <span className="font-medium">{stat.title}</span>
                  </div>
                  <Badge variant="secondary">
                    {stat.description}
                  </Badge>
                </div>
                
                <Progress 
                  value={(stat.value / stat.max) * 100} 
                  className="w-full h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>ℹ️</span>
            <span>Informações Adicionais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Nome</div>
              <div>{player.username}</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">ID</div>
              <div className="font-mono text-xs">{player.id.slice(0, 8)}...</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Nível</div>
              <div className="flex items-center space-x-1">
                <span>{player.level}</span>
                <span className="text-muted-foreground">({player.experience} XP)</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-muted-foreground">Status</div>
              <Badge variant="outline" className="text-xs">
                {player.hunger >= 20 && player.thirst >= 20 ? "Saudável" : "Necessita cuidados"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}