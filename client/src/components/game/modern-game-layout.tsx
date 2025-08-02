import React, { useState, useEffect } from 'react';
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
  Zap
} from 'lucide-react';

// Import all tab components
import EnhancedInventory from './enhanced-inventory';
import EnhancedStorageTab from './enhanced-storage-tab';
import EnhancedBiomesTab from './enhanced-biomes-tab';
import UnifiedWorkshops from './unified-workshops';
import CampTab from './camp-tab';
import StatusTab from './status-tab';
import QuestsTab from './quests-tab';
import PlayerSettings from './player-settings';
import ExpeditionPanel from './expedition-panel';

// Import modals
import ModernExpeditionModal from './modern-expedition-modal';
import { OfflineActivityReportDialog } from './offline-activity-report';

import type { Player, Biome, Resource, Equipment, Recipe, ActiveExpedition } from '@shared/types';

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

// Tab configuration with icons and colors
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
];

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
  const [offlineConfigOpen, setOfflineConfigOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<any>(null);

  const { toast } = useToast();

  // Use game data hook for real-time updates
  const { 
    inventory = [], 
    storage = [], 
    isLoading 
  } = useGameData({ playerId: player?.id });

  // Handle expedition start from biomes tab
  const handleExpeditionStart = (biome: Biome) => {
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  // Handle expedition modal completion
  const handleExpeditionComplete = (expeditionData: any) => {
    setActiveExpedition(expeditionData);
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
  };

  // Show offline activity report if player has significant offline time
  useEffect(() => {
    if (player && player.lastSeen) {
      const lastSeenTime = new Date(player.lastSeen).getTime();
      const currentTime = Date.now();
      const offlineTime = (currentTime - lastSeenTime) / 1000; // in seconds

      // Show report if offline for more than 30 minutes
      if (offlineTime > 1800) {
        // Mocked offline report for testing
        const mockedReport = {
            resources: [{ name: 'Wood', quantity: 10 }],
            equipment: [{ name: 'Axe', quantity: 1 }],
        };
        setOfflineReport(mockedReport);
        setOfflineReportOpen(true);
      }
    }
  }, [player]);

  // Get current tab info
  const currentTab = GAME_TABS.find(tab => tab.id === activeTab);
  const TabIcon = currentTab?.icon || Heart;

  if (isLoading || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-xl font-semibold text-gray-700 mb-2">Carregando Coletor Adventures...</div>
          <div className="text-gray-500">Preparando sua aventura</div>
        </div>
      </div>
    );
  }

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
        {/* Player Status Bar */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Player Info */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {player?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">{player?.name || 'Carregando...'}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Nível {player?.level || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span>{player?.coins || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex items-center space-x-6">
                {/* Hunger */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">🍖</span>
                    <span className="text-sm font-medium text-gray-700">{Math.round(player?.hunger || 0)}/{player?.maxHunger || 100}</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, ((player?.hunger || 0) / (player?.maxHunger || 100)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Thirst */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">{Math.round(player?.thirst || 0)}/{player?.maxThirst || 100}</span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, ((player?.thirst || 0) / (player?.maxThirst || 100)) * 100))}%` }}
                    />
                  </div>
                </div>

                {/* Equipment Indicators */}
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
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            {/* Tab Navigation */}
            <div className="bg-white border-b border-gray-200">
              <div className="px-6">
                <TabsList className="h-auto p-0 bg-transparent">
                  <div className="flex space-x-1 overflow-x-auto">
                    {GAME_TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap ${
                            activeTab === tab.id
                              ? "bg-white border-t border-l border-r border-gray-300 text-gray-800 -mb-px"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-b border-gray-200"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${tab.color}`} />
                          <span>{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </div>
                </TabsList>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-6">
                {/* Tab Description */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg bg-white shadow-sm border`}>
                      <TabIcon className={`w-5 h-5 ${currentTab?.color || 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{currentTab?.label}</h2>
                      <p className="text-gray-600">{currentTab?.description}</p>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
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
              onComplete={() => setActiveExpedition(null)}
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
        onClose={() => {
          setExpeditionModalOpen(false);
          setSelectedBiome(null);
        }}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        player={player}
        onExpeditionStart={handleExpeditionComplete}
      />

      <OfflineActivityReportDialog
        isOpen={offlineReportOpen}
        onClose={() => setOfflineReportOpen(false)}
        report={offlineReport}
        onConfigureOffline={() => {
          setOfflineReportOpen(false);
          setOfflineConfigOpen(true);
        }}
      />
    </div>
  );
}