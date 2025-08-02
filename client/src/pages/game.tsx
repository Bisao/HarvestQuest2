import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import GameHeader from "@/components/game/game-header";
import BiomesTab from "@/components/game/biomes-tab-new";
import QuestsTab from "@/components/game/quests-tab";
import ModernGameLayout from "@/components/game/modern-game-layout";
import LoadingScreen from "@/components/game/loading-screen";
import { OfflineActivityReportDialog } from "@/components/game/offline-activity-report";
import { OfflineConfigModal } from "@/components/game/offline-config-modal";
import { Settings, Home, Zap, AlertTriangle } from "lucide-react";

import ExpeditionPanel, { type ActiveExpedition } from "@/components/game/expedition-panel";
import type { Player, Biome, Resource, Equipment, Recipe, InventoryItem, OfflineActivityReport } from "@shared/types";
import { useQuestStatus } from "@/hooks/use-quest-status";
import { useGamePolling } from '@/hooks/useGamePolling';
import { useToast } from "@/hooks/use-toast";

export default function Game() {
  const [activeTab, setActiveTab] = useState("biomes");
  const [activeExpedition, setActiveExpedition] = useState<ActiveExpedition | null>(null);
  const [location, setLocation] = useLocation();
  const [offlineReport, setOfflineReport] = useState<OfflineActivityReport | null>(null);
  const [showOfflineReport, setShowOfflineReport] = useState(false);
  const [showOfflineConfig, setShowOfflineConfig] = useState(false);
    const [authWarning, setAuthWarning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get player from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const playerUsername = urlParams.get('player') || '';

  // If no player found, redirect to main menu
  if (!playerUsername) {
    setLocation('/');
    return null;
  }

    // Check authentication status
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            setAuthWarning(true);
        }
    }, []);

  // ID Validation on game startup
  useEffect(() => {
    if (playerUsername) {
      // Import and run client-side validation
      import('@/utils/id-validation-client').then(({ validateClientGameStartup }) => {
        const isValid = validateClientGameStartup(playerUsername);
        if (!isValid) {
          console.warn('⚠️  Game ID validation issues detected, but continuing with game load');
        }
      }).catch(error => {
        console.warn('⚠️  Could not load ID validation:', error);
      });
    }
  }, [playerUsername]);

  // Data queries
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery<Player>({
    queryKey: [`/api/player/${playerUsername}`],
    queryFn: async () => {
      const response = await fetch(`/api/player/${encodeURIComponent(playerUsername)}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Player not found, redirect to main menu
          setLocation('/');
          throw new Error('Player not found');
        }
        throw new Error('Failed to fetch player');
      }
      const playerData = await response.json();
      return playerData;
    },
    retry: 1,
    enabled: !!playerUsername,
  });

  // Real-time updates via polling
  const { isConnected } = useGamePolling({ 
    playerId: player?.id || null,
    enabled: !!player?.id 
  });

  // Marca jogador como online quando entra no jogo
  const markOnlineMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const response = await fetch(`/api/player/${playerId}/mark-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to mark online');
      return response.json();
    }
  });

  // Verifica atividade offline quando jogador carrega
  useEffect(() => {
    if (!player?.id) return;

    const checkOfflineActivity = async () => {
      try {
        const response = await fetch(`/api/player/${player.id}/offline-activity`);
        if (!response.ok) return;

        const data = await response.json();

        if (data.hasOfflineActivity && data.report) {
          setOfflineReport(data.report);
          setShowOfflineReport(true);

          // Atualiza os dados do jogador para refletir as mudanças
          queryClient.invalidateQueries({ queryKey: [`/api/player/${playerUsername}`] });
          queryClient.invalidateQueries({ queryKey: ["/api/inventory", player.id] });
          queryClient.invalidateQueries({ queryKey: ["/api/storage", player.id] });
        }
      } catch (error) {
        console.error('Failed to check offline activity:', error);
      }
    };

    checkOfflineActivity();
  }, [player?.id, queryClient, playerUsername]);

  // Marca jogador como online quando sai
  useEffect(() => {
    if (!player?.id) return;

    const markOnline = () => {
      markOnlineMutation.mutate(player.id);
    };

    // Marca como online ao entrar
    markOnline();

    // Marca como online ao sair/fechar
    const handleBeforeUnload = () => {
      markOnlineMutation.mutate(player.id);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      markOnline();
    };
  }, [player?.id]);

  // Setup window function for offline config
  useEffect(() => {
    (window as any).openOfflineConfig = () => setShowOfflineConfig(true);
    return () => {
      delete (window as any).openOfflineConfig;
    };
  }, []);

  const { data: biomes = [] } = useQuery<Biome[]>({
    queryKey: ["/api/biomes"],
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment"],
  });

  const { data: recipes = [] } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const { data: inventoryItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory", player?.id],
    enabled: !!player?.id,
  });

  const { hasCompletableQuests } = useQuestStatus(player?.id || "");

  // Loading state
  if (playerLoading) {
    return <LoadingScreen message="Carregando Jogo..." subMessage={`Preparando aventura para ${playerUsername}`} />;
  }

  // Error state
  if (playerError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar jogador</h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar os dados do jogador "{playerUsername}".
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Erro: {playerError.message}
          </p>
          <button 
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Menu Principal
          </button>
        </div>
      </div>
    );
  }

  // No player found
  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Jogador não encontrado</h2>
          <p className="text-gray-600 mb-6">
            O jogador "{playerUsername}" não foi encontrado.
          </p>
          <button 
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Menu Principal
          </button>
        </div>
      </div>
    );
  }

    // Show auth warning if not authenticated
    if (authWarning) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                    <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Sessão Expirada</h2>
                    <p className="text-gray-600 mb-4">
                        Sua sessão de login expirou. Por favor, faça login novamente para continuar jogando.
                    </p>
                    <button
                        onClick={() => setLocation('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                    >
                        Voltar ao Menu Principal
                    </button>
                </div>
            </div>
        );
    }

  // Handle expedition start from BiomesTab
  const handleExpeditionStart = (expeditionData: any) => {
    const newExpedition: ActiveExpedition = {
      id: expeditionData.id,
      biomeId: expeditionData.biomeId,
      progress: 0,
      selectedResources: expeditionData.selectedResources,
      startTime: Date.now(),
      estimatedDuration: expeditionData.estimatedDuration || 60000, // 1 minute default
      collectedResources: {},
    };
    setActiveExpedition(newExpedition);
  };

  // Handle expedition completion
  const handleExpeditionComplete = (shouldKeepActive = false) => {
    if (!shouldKeepActive) {
      setActiveExpedition(null);
    }
  };

  // Use the new modern layout
  return (
    <ModernGameLayout
      player={player}
      biomes={biomes}
      resources={resources}
      equipment={equipment}
      recipes={recipes}
      activeExpedition={activeExpedition}
      setActiveExpedition={setActiveExpedition}
      authWarning={authWarning}
      isBlocked={false}
    />
  );
}