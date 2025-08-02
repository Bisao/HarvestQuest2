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
      color: "bg-purple-500",
      showProgress: false
    },
    {
      title: "Vida",
      value: player.health,
      max: player.maxHealth,
      emoji: "❤️",
      description: `${player.health}/${player.maxHealth}`,
      color: getProgressColor(player.health, player.maxHealth, 'health'),
      showProgress: true
    },
    {
      title: "Fome",
      value: player.hunger,
      max: player.maxHunger,
      emoji: "🍖",
      description: `${player.hunger}/${player.maxHunger}`,
      color: getProgressColor(player.hunger, player.maxHunger, 'warning'),
      showProgress: true
    },
    {
      title: "Sede",
      value: player.thirst,
      max: player.maxThirst,
      emoji: "💧",
      description: `${player.thirst}/${player.maxThirst}`,
      color: getProgressColor(player.thirst, player.maxThirst, 'warning'),
      showProgress: true
    },
    {
      title: "Temperatura",
      value: player.temperature + 50, // Converter para 0-100 scale
      max: 100,
      emoji: player.temperature < -25 ? "🥶" : player.temperature > 25 ? "🔥" : "🌡️",
      description: `${player.temperature > 0 ? '+' : ''}${player.temperature}°`,
      color: getProgressColor(Math.abs(player.temperature), 50, 'warning'),
      showProgress: true
    },
    {
      title: "Fadiga",
      value: 100 - player.fatigue, // Inverter para mostrar energia
      max: 100,
      emoji: "😴",
      description: `${player.fatigue}% cansaço`,
      color: getProgressColor(100 - player.fatigue, 100, 'energy'),
      showProgress: true
    },
    {
      title: "Moral",
      value: player.morale,
      max: 100,
      emoji: player.morale >= 80 ? "😄" : player.morale >= 60 ? "😊" : player.morale >= 40 ? "😐" : player.morale >= 20 ? "😟" : "😢",
      description: `${player.morale}/100`,
      color: getProgressColor(player.morale, 100, 'warning'),
      showProgress: true
    },
    {
      title: "Higiene",
      value: player.hygiene,
      max: 100,
      emoji: "🛁",
      description: `${player.hygiene}/100`,
      color: getProgressColor(player.hygiene, 100, 'warning'),
      showProgress: true
    },
  ];

  // XP progress calculation (assuming level progression)
  const getXPProgress = () => {
    const baseXP = 100; // XP needed for level 1
    const xpForCurrentLevel = baseXP * player.level;
    const xpForNextLevel = baseXP * (player.level + 1);
    const currentLevelXP = player.experience - (baseXP * (player.level - 1));
    const neededXP = xpForNextLevel - (baseXP * player.level);
    
    return Math.min((currentLevelXP / neededXP) * 100, 100);
  };

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
                    <div className="flex flex-col items-center">
                      <span className="text-lg">{stat.emoji}</span>
                      {stat.showProgress && (
                        <div className="w-6 mt-1">
                          <Progress 
                            value={(stat.value / stat.max) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                      {stat.title === "Nível" && (
                        <div className="w-6 mt-1">
                          <Progress 
                            value={getXPProgress()} 
                            className="h-1"
                          />
                        </div>
                      )}
                    </div>
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