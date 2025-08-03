
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameData } from '@/hooks/useGamePolling';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Backpack,
  Package,
  TreePine,
  Compass,
  Settings,
  Home,
  Hammer,
  MapPin,
  Star,
  Heart,
  Droplets,
  Coins,
  Moon,
  Shield,
  Sword,
  Zap,
  BookOpen
} from 'lucide-react';

// Import all tab components
import EnhancedInventory from './enhanced-inventory';
import EnhancedStorageTab from './enhanced-storage-tab';
import EnhancedBiomesTab from './enhanced-biomes-tab';
import UnifiedWorkshops from './unified-workshops';
import CampTab from './camp-tab';
import AnimalRegistryTab from './animal-registry-tab';
import StatusTab from './status-tab';
import QuestsTab from './quests-tab';
import PlayerSettings from './player-settings';
import ExpeditionPanel from './expedition-panel';

// Import modals
import ModernExpeditionModal from './modern-expedition-modal';
import { OfflineActivityReportDialog } from './offline-activity-report';

import type { Player, Biome, Resource, Equipment, Recipe, ActiveExpedition } from '@shared/types';
import './modern-game-layout.css';

interface ModernGameLayoutProps {
  player: Player;
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  recipes: Recipe[];
  activeExpedition: ActiveExpedition | null;
  setActiveExpedition: (expedition: ActiveExpedition | null) => void;
  authWarning?: boolean;
  isBlocked?: boolean;
}

// Configuração das abas - extraída para constante
const GAME_TABS = [
  { 
    id: 'status', 
    label: 'Status', 
    icon: Heart, 
    color: 'text-red-600',
    description: 'Estatísticas do jogador'
  },
  { 
    id: 'inventory', 
    label: 'Inventário', 
    icon: Backpack, 
    color: 'text-blue-600',
    description: 'Itens carregados'
  },
  { 
    id: 'storage', 
    label: 'Armazém', 
    icon: Package, 
    color: 'text-green-600',
    description: 'Itens armazenados'
  },
  { 
    id: 'biomes', 
    label: 'Expedições', 
    icon: TreePine, 
    color: 'text-emerald-600',
    description: 'Explorar biomas'
  },
  { 
    id: 'workshops', 
    label: 'Oficinas', 
    icon: Hammer, 
    color: 'text-orange-600',
    description: 'Processar materiais'
  },
  { 
    id: 'camp', 
    label: 'Acampamento', 
    icon: Home, 
    color: 'text-purple-600',
    description: 'Base e melhorias'
  },
  { 
    id: 'animals', 
    label: 'Bestiário', 
    icon: BookOpen, 
    color: 'text-amber-600',
    description: 'Registro de animais descobertos'
  },
  { 
    id: 'quests', 
    label: 'Missões', 
    icon: Star, 
    color: 'text-yellow-600',
    description: 'Objetivos e recompensas'
  },
  { 
    id: 'settings', 
    label: 'Configurações', 
    icon: Settings, 
    color: 'text-gray-600',
    description: 'Opções do jogo'
  }
] as const;

// Componente para barra de status reutilizável
interface StatusBarProps {
  label: string;
  current: number;
  max: number;
  color: string;
  icon?: string;
}

const StatusBar: React.FC<StatusBarProps> = React.memo(({ label, current, max, color, icon }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1 min-w-0">
        {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
        <span className="text-sm font-medium text-gray-700 truncate">
          {Math.round(current)}/{max}
        </span>
      </div>
      <div className="w-24 bg-gray-200 rounded-full h-2 flex-shrink-0">
        <div 
          className={`${color} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

// Componente para indicadores de equipamento
const EquipmentIndicators: React.FC<{ player: Player }> = React.memo(({ player }) => (
  <div className="flex items-center space-x-2">
    <div className="flex items-center space-x-1">
      <Shield className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-600">
        {player?.equippedArmor ? '✓' : '○'}
      </span>
    </div>
    <div className="flex items-center space-x-1">
      <Sword className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-600">
        {player?.equippedWeapon ? '✓' : '○'}
      </span>
    </div>
    <div className="flex items-center space-x-1">
      <Hammer className="w-4 h-4 text-gray-500" />
      <span className="text-xs text-gray-600">
        {player?.equippedTool ? '✓' : '○'}
      </span>
    </div>
  </div>
));

EquipmentIndicators.displayName = 'EquipmentIndicators';

// Componente principal refatorado
export default function ModernGameLayout({
  player,
  biomes,
  resources,
  equipment,
  recipes,
  activeExpedition,
  setActiveExpedition,
  authWarning = false,
  isBlocked = false
}: ModernGameLayoutProps) {
  const [activeTab, setActiveTab] = useState('status');
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [offlineReportOpen, setOfflineReportOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<any>(null);

  const { toast } = useToast();

  // Use game data hook for real-time updates
  const { 
    inventory = [], 
    storage = [], 
    isLoading 
  } = useGameData({ playerId: player?.id });

  // Memoização da aba atual para evitar re-renders
  const currentTab = useMemo(() => 
    GAME_TABS.find(tab => tab.id === activeTab) || GAME_TABS[0], 
    [activeTab]
  );

  // Handlers com useCallback para performance
  const handleExpeditionStart = useCallback((biome: Biome) => {
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  }, []);

  const handleExpeditionComplete = useCallback((expeditionData: any) => {
    setActiveExpedition(expeditionData);
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
  }, [setActiveExpedition]);

  const handleExpeditionModalClose = useCallback(() => {
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
  }, []);

  const handleOfflineReportClose = useCallback(() => {
    setOfflineReportOpen(false);
  }, []);

  const handleExpeditionComplete2 = useCallback(() => {
    setActiveExpedition(null);
  }, [setActiveExpedition]);

  // Verificação de atividade offline otimizada
  useEffect(() => {
    if (!player?.lastSeen) return;
    
    const lastSeenTime = new Date(player.lastSeen).getTime();
    const currentTime = Date.now();
    const offlineTime = (currentTime - lastSeenTime) / 1000;

    // Show report if offline for more than 30 minutes
    if (offlineTime > 1800) {
      const mockedReport = {
        resources: [{ name: 'Wood', quantity: 10 }],
        equipment: [{ name: 'Axe', quantity: 1 }],
      };
      setOfflineReport(mockedReport);
      setOfflineReportOpen(true);
    }
  }, [player?.lastSeen]);

  // Loading state
  if (isLoading || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">
            Carregando Coletor Adventures...
          </div>
          <div className="text-gray-500">Preparando sua aventura</div>
        </div>
      </div>
    );
  }

  const TabIcon = currentTab.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Auth Warning */}
      {authWarning && (
        <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            ⚠️ Sessão temporária ativa. Considere fazer login para salvar seu progresso.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Container */}
      <div className="flex flex-col h-screen">
        {/* Player Status Bar - Otimizada */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Player Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {player?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold text-gray-800 truncate">
                    {player?.name || 'Carregando...'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span>Nível {player?.level || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                      <span>{player?.coins || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators - Organizados em grid responsivo */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <StatusBar
                  label="Fome"
                  current={player?.hunger || 0}
                  max={player?.maxHunger || 100}
                  color="bg-orange-500"
                  icon="🍖"
                />
                
                <StatusBar
                  label="Sede"
                  current={player?.thirst || 0}
                  max={player?.maxThirst || 100}
                  color="bg-blue-500"
                />

                <EquipmentIndicators player={player} />
              </div>

              {/* Activity Status */}
              {player?.autoStorage && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Moon className="w-3 h-3" />
                  <span>Atividade Offline</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            {/* Tab Navigation - Melhorada para mobile */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-4 sm:px-6">
                <TabsList className="h-auto p-0 bg-transparent w-full">
                  <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                    {GAME_TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className={`flex items-center space-x-2 px-3 sm:px-4 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                            activeTab === tab.id
                              ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${tab.color} flex-shrink-0`} />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-4 sm:p-6">
                {/* Tab Description */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-white shadow-sm border">
                      <TabIcon className={`w-5 h-5 ${currentTab.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {currentTab.label}
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {currentTab.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tab Content Components */}
                <TabsContent value="status" className="mt-0">
                  <StatusTab 
                    player={player} 
                    resources={resources} 
                    equipment={equipment}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="inventory" className="mt-0">
                  <EnhancedInventory
                    playerId={player.id}
                    resources={resources}
                    equipment={equipment}
                    player={player}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="storage" className="mt-0">
                  <EnhancedStorageTab
                    playerId={player.id}
                    resources={resources}
                    equipment={equipment}
                    player={player}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="biomes" className="mt-0">
                  <EnhancedBiomesTab
                    player={player}
                    biomes={biomes}
                    resources={resources}
                    equipment={equipment}
                    onExpeditionStart={handleExpeditionStart}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="workshops" className="mt-0">
                  <UnifiedWorkshops
                    player={player}
                    resources={resources}
                    equipment={equipment}
                    recipes={recipes}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="camp" className="mt-0">
                  <CampTab
                    player={player}
                    resources={resources}
                    equipment={equipment}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="animals" className="mt-0">
                  <AnimalRegistryTab 
                    discoveredAnimals={player?.discoveredAnimals || []}
                    playerId={player?.id || ''}
                    onAnimalSelect={(animal) => {
                      console.log('Animal selecionado:', animal);
                    }}
                  />
                </TabsContent>

                <TabsContent value="quests" className="mt-0">
                  <QuestsTab
                    player={player}
                    isBlocked={isBlocked}
                  />
                </TabsContent>

                <TabsContent value="settings" className="mt-0">
                  <PlayerSettings
                    player={player}
                    isBlocked={isBlocked}
                  />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Expedition Panel (Fixed Position) */}
        {activeExpedition && (
          <div className="fixed bottom-4 right-4 z-50">
            <ExpeditionPanel
              expedition={activeExpedition}
              onComplete={handleExpeditionComplete2}
              onMinimize={() => {}}
              biomes={biomes}
              resources={resources}
              equipment={equipment}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <ModernExpeditionModal
        isOpen={expeditionModalOpen}
        onClose={handleExpeditionModalClose}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        player={player}
        onExpeditionStart={handleExpeditionComplete}
      />

      <OfflineActivityReportDialog
        isOpen={offlineReportOpen}
        onClose={handleOfflineReportClose}
        report={offlineReport}
        onConfigureOffline={() => {
          setOfflineReportOpen(false);
        }}
      />
    </div>
  );
}
