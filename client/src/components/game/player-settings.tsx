
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import TimeSpeedControl from './time-speed-control';
import { useSaveGame } from "@/hooks/use-save-game";
import type { Player, HungerDegradationMode } from "@shared/types";
import type { GameTime } from "@shared/types/time-types";
import { Settings, Archive, Home, Clock, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import LoadingScreen from "./loading-screen";

interface PlayerSettingsProps {
  player: Player;
  isOpen: boolean;
  onClose: () => void;
  isBlocked?: boolean;
}

export default function PlayerSettings({ player, isOpen, onClose, isBlocked = false }: PlayerSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [autoStorage, setAutoStorage] = useState(player.autoStorage);
  const [autoCompleteQuests, setAutoCompleteQuests] = useState(player.autoCompleteQuests ?? true);
  const [hungerDegradationMode, setHungerDegradationMode] = useState(player.hungerDegradationMode || 'automatic');
  const [isNavigatingToMenu, setIsNavigatingToMenu] = useState(false);
  const [autoConsume, setAutoConsume] = useState(player.autoConsume ?? false);
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<GameTime['timeOfDay']>('dawn');
  const [devModeUnlockAnimals, setDevModeUnlockAnimals] = useState(false);
  const [forceCreatureEncounters, setForceCreatureEncounters] = useState(false);

  const saveGame = useSaveGame();

  // Mutation para forçar encontros com criaturas
  const forceEncountersMutation = useMutation({
    mutationFn: async (force: boolean) => {
      const response = await fetch('/api/developer/force-creature-encounters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, force }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle creature encounters');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: forceCreatureEncounters ? "Encontros Forçados Ativados" : "Encontros Normais Restaurados",
        description: forceCreatureEncounters ? "100% de chance de encontrar criaturas nas expedições!" : "Chance normal de encontros restaurada",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Alterar Encontros",
        description: error.message || "Não foi possível alterar a configuração de encontros",
        variant: "destructive",
      });
      // Reverter o estado local em caso de erro
      setForceCreatureEncounters(!forceCreatureEncounters);
    },
  });

  // Mutation para modo desenvolvedor - desbloquear todos os animais
  const devModeUnlockMutation = useMutation({
    mutationFn: async (unlock: boolean) => {
      const response = await fetch('/api/developer/unlock-animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: player.id, unlock }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to toggle dev mode');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: devModeUnlockAnimals ? "Animais Desbloqueados" : "Modo Normal Ativado",
        description: devModeUnlockAnimals ? "Todos os animais foram desbloqueados para teste!" : "Modo normal restaurado",
      });
      // Invalidar queries relacionadas ao bestiário
      queryClient.invalidateQueries({ queryKey: ['animalRegistry'] });
      queryClient.invalidateQueries({ queryKey: ['/api/player', player.username] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no Modo Desenvolvedor",
        description: error.message || "Não foi possível alterar o modo desenvolvedor",
        variant: "destructive",
      });
      // Reverter o estado local em caso de erro
      setDevModeUnlockAnimals(!devModeUnlockAnimals);
    },
  });

  // Mutation para alterar o tempo do dia
  const changeTimeMutation = useMutation({
    mutationFn: async (timeOfDay: GameTime['timeOfDay']) => {
      const response = await fetch('/api/time/set-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeOfDay }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change time');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Tempo Alterado",
        description: `O tempo foi alterado para ${getTimeOfDayLabel(selectedTimeOfDay)}!`,
      });
      // Invalidar queries relacionadas ao tempo
      queryClient.invalidateQueries({ queryKey: ['gameTime'] });
      queryClient.invalidateQueries({ queryKey: ['temperature'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Alterar Tempo",
        description: error.message || "Não foi possível alterar o tempo",
        variant: "destructive",
      });
    },
  });

  // Função para obter label do período do dia
  const getTimeOfDayLabel = (timeOfDay: GameTime['timeOfDay']) => {
    switch (timeOfDay) {
      case 'dawn': return 'Amanhecer (06:00)';
      case 'morning': return 'Manhã (09:00)';
      case 'afternoon': return 'Tarde (14:00)';
      case 'evening': return 'Entardecer (18:00)';
      case 'night': return 'Noite (21:00)';
      case 'midnight': return 'Meia-noite (00:00)';
      default: return 'Desconhecido';
    }
  };

  // Função para obter ícone do período do dia
  const getTimeOfDayIcon = (timeOfDay: GameTime['timeOfDay']) => {
    switch (timeOfDay) {
      case 'dawn': return '🌅';
      case 'morning': return '☀️';
      case 'afternoon': return '🌞';
      case 'evening': return '🌇';
      case 'night': return '🌙';
      case 'midnight': return '🌚';
      default: return '🕐';
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: { autoStorage?: boolean; autoCompleteQuests?: boolean; hungerDegradationMode?: HungerDegradationMode; autoConsume?: boolean }) => {
      const response = await fetch(`/api/player/${player.id}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações Salvas",
        description: "Suas preferências foram atualizadas com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/player", player.username] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar as configurações",
        variant: "destructive",
      });
    },
  });

  const handleDevModeToggle = (checked: boolean) => {
    setDevModeUnlockAnimals(checked);
    devModeUnlockMutation.mutate(checked);
  };

  const handleForceEncountersToggle = (checked: boolean) => {
    setForceCreatureEncounters(checked);
    forceEncountersMutation.mutate(checked);
  };

  const handleSaveSettings = () => {
    if (isBlocked) {
      toast({
        title: "Ação Bloqueada",
        description: "Você não pode alterar configurações no momento",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({
      autoStorage,
      autoCompleteQuests,
      hungerDegradationMode,
      autoConsume,
    });
  };

  const handleBackToMainMenu = async () => {
    setIsNavigatingToMenu(true);

    try {
      // Save the game first
      await saveGame.mutateAsync(player.id);

      // Wait a bit for user to see the save confirmation
      setTimeout(() => {
        setLocation('/');
      }, 1000);
    } catch (error) {
      setIsNavigatingToMenu(false);
      // Error toast is handled by the useSaveGame hook
    }
  };

  if (!isOpen) return null;

  // Show loading screen when navigating to main menu
  if (isNavigatingToMenu) {
    return <LoadingScreen message="Salvando e voltando ao menu..." subMessage="Aguarde um momento" />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Configurações do Jogador</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Auto Storage Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Archive className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-800">Armazenamento Automático</p>
                  <p className="text-sm text-gray-600">Itens coletados vão direto para o armazém</p>
                </div>
              </div>
              <Switch
                checked={autoStorage}
                onCheckedChange={setAutoStorage}
                disabled={isBlocked}
              />
            </div>

            {/* Auto Complete Quests Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📋</span>
                <div>
                  <p className="font-medium text-gray-800">Completar Missões Automaticamente</p>
                  <p className="text-sm text-gray-600">Missões são completadas automaticamente quando objetivos são atingidos</p>
                </div>
              </div>
              <Switch
                checked={autoCompleteQuests}
                onCheckedChange={setAutoCompleteQuests}
                disabled={isBlocked}
              />
            </div>

            {/* Auto Consume Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🍖</span>
                <div>
                  <p className="font-medium text-gray-800">Auto-consumir Itens</p>
                  <p className="text-sm text-gray-600">Consumir automaticamente comida e bebida equipadas quando fome/sede estiverem baixas (15%) até atingir 75%</p>
                </div>
              </div>
              <Switch
                checked={autoConsume}
                onCheckedChange={setAutoConsume}
                disabled={isBlocked}
              />
            </div>

            {/* Hunger Degradation Mode Setting */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-lg">🍖</span>
                <div>
                  <p className="font-medium text-gray-800">Modo de Degradação de Fome/Sede</p>
                  <p className="text-sm text-gray-600">Controla a velocidade de perda de fome e sede (tempo alterado para 18 minutos)</p>
                </div>
              </div>
              <Select value={hungerDegradationMode} onValueChange={(value: HungerDegradationMode) => setHungerDegradationMode(value)} disabled={isBlocked}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">🤖 Automático (baseado em atividades)</SelectItem>
                  <SelectItem value="slow">🐌 Lento (50% mais devagar)</SelectItem>
                  <SelectItem value="normal">⚖️ Normal (taxa padrão)</SelectItem>
                  <SelectItem value="fast">⚡ Rápido (50% mais rápido)</SelectItem>
                  <SelectItem value="disabled">🚫 Desabilitado (sem degradação)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Control Setting */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-800">Controle de Tempo</p>
                  <p className="text-sm text-gray-600">Altere o período do dia no jogo</p>
                </div>
              </div>
              <div className="space-y-3">
                <Select value={selectedTimeOfDay} onValueChange={(value: GameTime['timeOfDay']) => setSelectedTimeOfDay(value)} disabled={isBlocked}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dawn">🌅 Amanhecer (06:00)</SelectItem>
                    <SelectItem value="morning">☀️ Manhã (09:00)</SelectItem>
                    <SelectItem value="afternoon">🌞 Tarde (14:00)</SelectItem>
                    <SelectItem value="evening">🌇 Entardecer (18:00)</SelectItem>
                    <SelectItem value="night">🌙 Noite (21:00)</SelectItem>
                    <SelectItem value="midnight">🌚 Meia-noite (00:00)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => changeTimeMutation.mutate(selectedTimeOfDay)}
                  disabled={changeTimeMutation.isPending || isBlocked}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {changeTimeMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Alterando Tempo...
                    </>
                  ) : (
                    <>
                      {getTimeOfDayIcon(selectedTimeOfDay)}
                      <span className="ml-2">Alterar para {getTimeOfDayLabel(selectedTimeOfDay)}</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Velocidade do Tempo</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Quanto tempo real para 24 horas do jogo
                </p>
                <TimeSpeedControl />
              </div>
            </div>

            {/* Developer Mode Section */}
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-lg">🧪</span>
                <div>
                  <p className="font-medium text-red-800">Modo Desenvolvedor</p>
                  <p className="text-sm text-red-600">Ferramentas de teste e debug</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🔓</span>
                    <div>
                      <p className="font-medium text-gray-800">Desbloquear Todos os Animais</p>
                      <p className="text-sm text-gray-600">Para testes: mostra todos os animais como descobertos no bestiário</p>
                    </div>
                  </div>
                  <Switch
                    checked={devModeUnlockAnimals}
                    onCheckedChange={handleDevModeToggle}
                    disabled={isBlocked || devModeUnlockMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🐾</span>
                    <div>
                      <p className="font-medium text-gray-800">Forçar Encontros com Criaturas</p>
                      <p className="text-sm text-gray-600">100% de chance de encontrar criaturas durante expedições</p>
                    </div>
                  </div>
                  <Switch
                    checked={forceCreatureEncounters}
                    onCheckedChange={handleForceEncountersToggle}
                    disabled={isBlocked || forceEncountersMutation.isPending}
                  />
                </div>
              </div>
              
              {(devModeUnlockMutation.isPending || forceEncountersMutation.isPending) && (
                <div className="mt-2 text-sm text-red-600 flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Aplicando alterações...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button 
            variant="outline" 
            onClick={handleBackToMainMenu}
            disabled={isNavigatingToMenu || saveGame.isPending}
            className="flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>{isNavigatingToMenu ? "Salvando..." : "Menu Principal"}</span>
          </Button>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveSettings}
              disabled={updateSettingsMutation.isPending || isBlocked}
            >
              {updateSettingsMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
