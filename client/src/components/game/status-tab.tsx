import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, Zap, Utensils, Droplets, Thermometer, Smile, Bath, Shield } from "lucide-react";
import type { Player } from "@shared/types";

interface StatusTabProps {
  player: Player;
}

export default function StatusTab({ player }: StatusTabProps) {
  const getStatusLevel = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'warning';
    if (percentage >= 20) return 'danger';
    return 'critical';
  };

  const getStatusColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTemperatureStatus = () => {
    if (player.temperature < -30) return { level: 'critical', text: 'Congelando', emoji: '🥶' };
    if (player.temperature < -15) return { level: 'danger', text: 'Muito Frio', emoji: '❄️' };
    if (player.temperature < -5) return { level: 'warning', text: 'Frio', emoji: '🧊' };
    if (player.temperature > 30) return { level: 'critical', text: 'Superaquecimento', emoji: '🔥' };
    if (player.temperature > 15) return { level: 'danger', text: 'Muito Quente', emoji: '🌋' };
    if (player.temperature > 5) return { level: 'warning', text: 'Quente', emoji: '☀️' };
    return { level: 'excellent', text: 'Confortável', emoji: '🌡️' };
  };

  const temperatureStatus = getTemperatureStatus();

  const vitalStats = [
    {
      title: "Vida",
      value: Math.round(player.health),
      max: player.maxHealth,
      icon: Heart,
      level: getStatusLevel(player.health, player.maxHealth)
    },
    {
      title: "Fome",
      value: Math.round(player.hunger),
      max: player.maxHunger,
      icon: Utensils,
      level: getStatusLevel(player.hunger, player.maxHunger)
    },
    {
      title: "Sede",
      value: Math.round(player.thirst),
      max: player.maxThirst,
      icon: Droplets,
      level: getStatusLevel(player.thirst, player.maxThirst)
    }
  ];

  const otherStats = [
    {
      title: "Moral",
      value: Math.round(player.morale),
      max: 100,
      icon: Smile,
      level: getStatusLevel(player.morale, 100)
    },
    {
      title: "Higiene",
      value: Math.round(player.hygiene),
      max: 100,
      icon: Bath,
      level: getStatusLevel(player.hygiene, 100)
    },
    {
      title: "Fadiga",
      value: 100 - Math.round(player.fatigue), // Inverte para mostrar "energia"
      max: 100,
      icon: Zap,
      level: getStatusLevel(100 - player.fatigue, 100)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Informações do Jogador
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">⭐ {player.level}</div>
              <div className="text-sm text-gray-600">Nível</div>
              <div className="text-xs text-purple-600 mt-1">{player.experience} XP</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">🪙 {player.coins}</div>
              <div className="text-sm text-gray-600">Moedas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{Math.round((player.inventoryWeight / player.maxInventoryWeight) * 100)}%</div>
              <div className="text-sm text-gray-600">Inventário</div>
              <div className="text-xs text-green-600 mt-1">{player.inventoryWeight}kg</div>
            </div>
            <div className={`text-center p-3 rounded-lg border ${getStatusColor(temperatureStatus.level)}`}>
              <div className="text-2xl font-bold">{temperatureStatus.emoji} {player.temperature}°</div>
              <div className="text-sm">{temperatureStatus.text}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Vitais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Status Vitais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vitalStats.map((stat, index) => {
              const IconComponent = stat.icon;
              const percentage = (stat.value / stat.max) * 100;
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(stat.level)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{stat.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs opacity-75">/ {stat.max}</div>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3"
                  />
                  <div className="mt-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(percentage)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Status Secundários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-blue-600" />
            Bem-estar e Condição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {otherStats.map((stat, index) => {
              const IconComponent = stat.icon;
              const percentage = (stat.value / stat.max) * 100;
              
              return (
                <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(stat.level)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{stat.title}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-xs opacity-75">/ {stat.max}</div>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3"
                  />
                  <div className="mt-2 text-center">
                    <Badge variant="outline" className="text-xs">
                      {Math.round(percentage)}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Condições Especiais */}
      {(player.diseases?.length > 0 || player.immunities?.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              Condições Especiais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {player.diseases?.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 mb-2">🦠 Doenças Ativas</h4>
                  <div className="flex flex-wrap gap-2">
                    {player.diseases.map((disease, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {player.immunities?.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2">🛡️ Imunidades</h4>
                  <div className="flex flex-wrap gap-2">
                    {player.immunities.map((immunity, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-green-500 text-green-700">
                        {immunity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
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