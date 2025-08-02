// Enhanced Player Status - Sistema aprimorado de status com doenças
// Integrado com o sistema de skills

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { Player } from '@shared/types';

interface PlayerStatusEnhancedProps {
  player: Player;
}

export function PlayerStatusEnhanced({ player }: PlayerStatusEnhancedProps) {
  const { toast } = useToast();

  // Calculate status colors based on values
  const getStatusColor = (value: number, type: 'normal' | 'temperature' = 'normal') => {
    if (type === 'temperature') {
      if (value < -50 || value > 50) return 'text-red-500';
      if (value < -25 || value > 25) return 'text-orange-500';
      return 'text-green-500';
    }
    
    if (value >= 80) return 'text-green-500';
    if (value >= 50) return 'text-yellow-500';
    if (value >= 25) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTemperatureIcon = (temp: number) => {
    if (temp < -50) return '🥶';
    if (temp < -25) return '❄️';
    if (temp < 0) return '🌡️';
    if (temp < 25) return '😊';
    if (temp < 50) return '🌡️';
    return '🔥';
  };

  const getMoraleIcon = (morale: number) => {
    if (morale >= 80) return '😄';
    if (morale >= 60) return '😊';
    if (morale >= 40) return '😐';
    if (morale >= 20) return '😟';
    return '😢';
  };

  // Enhanced status values from player
  const status = {
    health: player.health,
    maxHealth: player.maxHealth,
    hunger: player.hunger,
    maxHunger: player.maxHunger,
    thirst: player.thirst,
    maxThirst: player.maxThirst,
    temperature: player.temperature,
    fatigue: player.fatigue,
    morale: player.morale,
    hygiene: player.hygiene,
    diseases: player.diseases,
    immunities: player.immunities,
    skillPoints: player.skillPoints
  };

  return (
    <div className="space-y-4">
      {/* Primary Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">❤️</span>
            Status do Jogador
          </CardTitle>
          <CardDescription>
            Monitore sua condição física e mental
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Core Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  ❤️ Vida
                </span>
                <span className={getStatusColor((status.health / status.maxHealth) * 100)}>
                  {status.health}/{status.maxHealth}
                </span>
              </div>
              <Progress 
                value={(status.health / status.maxHealth) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  🍖 Fome
                </span>
                <span className={getStatusColor((status.hunger / status.maxHunger) * 100)}>
                  {status.hunger}/{status.maxHunger}
                </span>
              </div>
              <Progress 
                value={(status.hunger / status.maxHunger) * 100} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  💧 Sede
                </span>
                <span className={getStatusColor((status.thirst / status.maxThirst) * 100)}>
                  {status.thirst}/{status.maxThirst}
                </span>
              </div>
              <Progress 
                value={(status.thirst / status.maxThirst) * 100} 
                className="h-2"
              />
            </div>
          </div>

          <Separator />

          {/* Enhanced Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  {getTemperatureIcon(status.temperature)} Temperatura
                </span>
                <span className={getStatusColor(status.temperature, 'temperature')}>
                  {status.temperature > 0 ? '+' : ''}{status.temperature}°
                </span>
              </div>
              <Progress 
                value={50 + status.temperature / 2} // Convert -100/+100 to 0-100 scale
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  😴 Fadiga
                </span>
                <span className={getStatusColor(100 - status.fatigue)}>
                  {status.fatigue}%
                </span>
              </div>
              <Progress 
                value={status.fatigue} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  {getMoraleIcon(status.morale)} Moral
                </span>
                <span className={getStatusColor(status.morale)}>
                  {status.morale}%
                </span>
              </div>
              <Progress 
                value={status.morale} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  🛁 Higiene
                </span>
                <span className={getStatusColor(status.hygiene)}>
                  {status.hygiene}%
                </span>
              </div>
              <Progress 
                value={status.hygiene} 
                className="h-2"
              />
            </div>
          </div>

          {/* Skill Points Display */}
          {status.skillPoints > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <span className="font-medium">Pontos de Skill Disponíveis</span>
                </div>
                <Badge variant="default" className="text-sm">
                  {status.skillPoints} pontos
                </Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Diseases and Status Effects */}
      {status.diseases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🤒</span>
              Doenças e Condições
            </CardTitle>
            <CardDescription>
              Condições de saúde que afetam seu desempenho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.diseases.map((disease: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{disease.icon}</span>
                    <div>
                      <div className="font-medium">{disease.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Severidade: {disease.severity}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="mb-1">
                      {Math.ceil(disease.duration / 60)}min restante
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {disease.effects.length} efeito(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Immunities */}
      {status.immunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              Imunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {status.immunities.map((immunity: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {immunity}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            Dicas de Sobrevivência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {status.hunger < 30 && (
              <div className="flex items-center gap-2 text-orange-600">
                <span>🍖</span>
                <span>Você está com fome! Coma algo para recuperar energia.</span>
              </div>
            )}
            {status.thirst < 30 && (
              <div className="flex items-center gap-2 text-blue-600">
                <span>💧</span>
                <span>Você está com sede! Beba água para se hidratar.</span>
              </div>
            )}
            {status.fatigue > 70 && (
              <div className="flex items-center gap-2 text-purple-600">
                <span>😴</span>
                <span>Você está cansado. Descanse um pouco para recuperar energia.</span>
              </div>
            )}
            {status.hygiene < 40 && (
              <div className="flex items-center gap-2 text-brown-600">
                <span>🛁</span>
                <span>Sua higiene está baixa. Isso pode causar doenças.</span>
              </div>
            )}
            {status.morale < 30 && (
              <div className="flex items-center gap-2 text-gray-600">
                <span>😢</span>
                <span>Seu moral está baixo. Faça atividades prazerosas para melhorar.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}