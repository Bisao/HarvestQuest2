import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Sword, 
  Shield, 
  Eye, 
  Clock,
  Heart,
  Zap,
  Target,
  Trophy,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import type { CombatEncounter, CombatAction, CombatActionRecord } from '@shared/types/combat-types';
import type { AnimalRegistryEntry } from '@shared/types/animal-registry-types';
import type { Player } from '@shared/types';

interface CombatModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  animal: AnimalRegistryEntry;
  encounter: CombatEncounter | null;
  onAction: (action: CombatAction) => Promise<void>;
}

export function CombatModal({ 
  isOpen, 
  onClose, 
  player, 
  animal, 
  encounter, 
  onAction 
}: CombatModalProps) {
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [combatLog, setCombatLog] = useState<CombatActionRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (encounter) {
      setCombatLog(encounter.actions);
    }
  }, [encounter]);

  const handleAction = async (action: CombatAction) => {
    if (isExecuting || !encounter || encounter.status !== 'active') return;

    setSelectedAction(action);
    setIsExecuting(true);

    try {
      await onAction(action);
      
      // Show success feedback
      const actionMessages = {
        attack: 'Ataque executado!',
        defend: 'Posição defensiva assumida!',
        analyze: 'Animal analisado com sucesso!',
        flee: 'Tentativa de fuga executada!'
      };

      toast({
        title: actionMessages[action],
        description: "Aguarde a reação do animal...",
      });

    } catch (error: any) {
      toast({
        title: "Erro no Combate",
        description: error.message || "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
      setSelectedAction(null);
    }
  };

  const getHealthPercentage = (current: number, max: number) => {
    return Math.max(0, (current / max) * 100);
  };

  const getHealthColor = (percentage: number) => {
    if (percentage > 60) return 'bg-green-500';
    if (percentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'uncommon': return 'bg-green-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!encounter || !animal) return null;

  const playerMaxHealth = player.maxHealth || 100;
  const animalMaxHealth = animal.combat.health;
  const playerHealthPercent = getHealthPercentage(encounter.playerHealth, playerMaxHealth);
  const animalHealthPercent = getHealthPercentage(encounter.animalHealth, animalMaxHealth);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0" aria-describedby="combat-modal-description">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-3xl">⚔️</span>
            <div>
              <div>Encontro de Combate</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Turno {encounter.turn} - {encounter.playerTurn ? 'Sua vez!' : 'Turno do animal'}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div id="combat-modal-description" className="sr-only">
          Modal de combate por turnos com {animal.commonName}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Combat Arena */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Animal Display */}
              <Card className="relative">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center items-center gap-4 mb-4">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-6xl">{animal.emoji}</span>
                      </div>
                      <Badge className={`absolute -top-2 -right-2 ${getRarityColor(animal.rarity)} text-white`}>
                        {animal.rarity}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{animal.commonName}</CardTitle>
                  <p className="text-sm text-gray-600 italic">{animal.scientificName}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Animal Health */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Saúde do Animal</span>
                        <span>{encounter.animalHealth}/{animalMaxHealth}</span>
                      </div>
                      <Progress 
                        value={animalHealthPercent} 
                        className="h-3"
                      />
                    </div>

                    {/* Animal Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">{animal.combat.defense}</div>
                        <div className="text-xs text-red-700">DEFESA</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-lg font-bold text-blue-600">{animal.combat.attacks.length}</div>
                        <div className="text-xs text-blue-700">ATAQUES</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VS Divider */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full text-white font-bold text-xl shadow-lg">
                  VS
                </div>
              </div>

              {/* Player Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {player.username}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Player Health */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Sua Saúde</span>
                        <span>{encounter.playerHealth}/{playerMaxHealth}</span>
                      </div>
                      <Progress 
                        value={playerHealthPercent} 
                        className="h-3"
                      />
                    </div>

                    {/* Player Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-sm font-bold text-blue-600">{player.level}</div>
                        <div className="text-xs text-blue-700">NÍVEL</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-sm font-bold text-green-600">
                          {10 + Math.floor(player.level * 2)}
                        </div>
                        <div className="text-xs text-green-700">ATAQUE</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded">
                        <div className="text-sm font-bold text-purple-600">
                          {5 + Math.floor(player.level * 1.5)}
                        </div>
                        <div className="text-xs text-purple-700">DEFESA</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Combat Actions */}
              {encounter.status === 'active' && encounter.playerTurn && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Escolha sua Ação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={selectedAction === 'attack' ? 'default' : 'outline'}
                        className="h-16 flex flex-col gap-1"
                        onClick={() => handleAction('attack')}
                        disabled={isExecuting}
                      >
                        <Sword className="w-5 h-5" />
                        <span className="text-sm">Atacar</span>
                      </Button>
                      
                      <Button
                        variant={selectedAction === 'defend' ? 'default' : 'outline'}
                        className="h-16 flex flex-col gap-1"
                        onClick={() => handleAction('defend')}
                        disabled={isExecuting}
                      >
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">Defender</span>
                      </Button>
                      
                      <Button
                        variant={selectedAction === 'analyze' ? 'default' : 'outline'}
                        className="h-16 flex flex-col gap-1"
                        onClick={() => handleAction('analyze')}
                        disabled={isExecuting}
                      >
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">Analisar</span>
                      </Button>
                      
                      <Button
                        variant={selectedAction === 'flee' ? 'default' : 'outline'}
                        className="h-16 flex flex-col gap-1"
                        onClick={() => handleAction('flee')}
                        disabled={isExecuting}
                      >
                        <AlertTriangle className="w-5 h-5" />
                        <span className="text-sm">Fugir</span>
                      </Button>
                    </div>

                    {isExecuting && (
                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 animate-spin" />
                          Executando ação...
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Combat Result */}
              {encounter.status !== 'active' && (
                <Card className={`border-2 ${
                  encounter.status === 'victory' || encounter.status === 'analyzed' 
                    ? 'border-green-500 bg-green-50' 
                    : encounter.status === 'defeat' 
                    ? 'border-red-500 bg-red-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {encounter.status === 'victory' && <><Trophy className="w-5 h-5 text-green-600" />Vitória!</>}
                      {encounter.status === 'analyzed' && <><Sparkles className="w-5 h-5 text-blue-600" />Animal Analisado!</>}
                      {encounter.status === 'defeat' && <><AlertTriangle className="w-5 h-5 text-red-600" />Derrota...</>}
                      {encounter.status === 'fled' && <><Target className="w-5 h-5 text-yellow-600" />Fuga Bem-Sucedida!</>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {encounter.status === 'victory' && (
                        <p className="text-green-700">
                          Você derrotou {animal.commonName} e ganhou experiência e recursos!
                        </p>
                      )}
                      {encounter.status === 'analyzed' && (
                        <p className="text-blue-700">
                          Você analisou {animal.commonName} e adicionou ao seu bestiário! Ganhou experiência bônus.
                        </p>
                      )}
                      {encounter.status === 'defeat' && (
                        <p className="text-red-700">
                          {animal.commonName} foi mais forte desta vez. Você perdeu alguns recursos mas sobreviveu.
                        </p>
                      )}
                      {encounter.status === 'fled' && (
                        <p className="text-yellow-700">
                          Você conseguiu fugir com segurança de {animal.commonName}.
                        </p>
                      )}
                      
                      <Button 
                        onClick={onClose}
                        className="w-full mt-4"
                      >
                        Continuar Expedição
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Combat Log */}
          <div className="w-80 border-l bg-gray-50 p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Log de Combate
            </h3>
            
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {combatLog.map((action, index) => (
                  <div 
                    key={index}
                    className={`p-2 rounded text-sm ${
                      action.actor === 'player' 
                        ? 'bg-blue-100 border-l-4 border-blue-500' 
                        : 'bg-red-100 border-l-4 border-red-500'
                    }`}
                  >
                    <div className="font-medium text-xs text-gray-600 mb-1">
                      Turno {action.turn} - {action.actor === 'player' ? 'Você' : animal.commonName}
                    </div>
                    <div>{action.effect}</div>
                    {action.damage && (
                      <div className="text-xs font-medium mt-1">
                        {action.damage} de dano
                      </div>
                    )}
                  </div>
                ))}
                
                {combatLog.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">O combate está começando...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}