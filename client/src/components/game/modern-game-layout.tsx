
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameData } from '@/hooks/useGamePolling';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Backpack,
  Package,
  TreePine,
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
  BookOpen,
  User,
  Zap
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

// Tipos para as abas
interface GameTab {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: 'core' | 'inventory' | 'exploration' | 'crafting' | 'social' | 'system';
  priority: number;
  hasNotification?: boolean;
  isDisabled?: boolean;
}

// Configuração das abas organizadas por categoria e prioridade
const createGameTabs = (player: Player, activeExpedition: ActiveExpedition | null): GameTab[] => [
  // CORE - Tabs essenciais
  {
    id: 'status',
    label: 'Status',
    shortLabel: 'Status',
    icon: User,
    color: 'text-blue-600',
    description: 'Estatísticas e informações do jogador',
    category: 'core',
    priority: 1
  },
  
  // INVENTORY - Gestão de itens
  {
    id: 'inventory',
    label: 'Inventário',
    shortLabel: 'Inv.',
    icon: Backpack,
    color: 'text-green-600',
    description: 'Itens carregados e equipamentos',
    category: 'inventory',
    priority: 2,
    hasNotification: (player?.inventory?.length || 0) > 20
  },
  {
    id: 'storage',
    label: 'Armazém',
    shortLabel: 'Arm.',
    icon: Package,
    color: 'text-purple-600',
    description: 'Armazenamento expandido de itens',
    category: 'inventory',
    priority: 3
  },

  // EXPLORATION - Exploração e expedições
  {
    id: 'biomes',
    label: 'Expedições',
    shortLabel: 'Exp.',
    icon: TreePine,
    color: 'text-emerald-600',
    description: 'Explorar biomas e coletar recursos',
    category: 'exploration',
    priority: 4,
    hasNotification: !!activeExpedition
  },
  {
    id: 'animals',
    label: 'Bestiário',
    shortLabel: 'Best.',
    icon: BookOpen,
    color: 'text-amber-600',
    description: 'Registro de animais descobertos',
    category: 'exploration',
    priority: 5,
    hasNotification: (player?.discoveredAnimals?.length || 0) > 0
  },

  // CRAFTING - Criação e processamento
  {
    id: 'workshops',
    label: 'Oficinas',
    shortLabel: 'Of.',
    icon: Hammer,
    color: 'text-orange-600',
    description: 'Processar materiais e criar itens',
    category: 'crafting',
    priority: 6
  },
  {
    id: 'camp',
    label: 'Acampamento',
    shortLabel: 'Camp.',
    icon: Home,
    color: 'text-indigo-600',
    description: 'Base, melhorias e construções',
    category: 'crafting',
    priority: 7
  },

  // SOCIAL - Missões e objetivos
  {
    id: 'quests',
    label: 'Missões',
    shortLabel: 'Miss.',
    icon: Star,
    color: 'text-yellow-600',
    description: 'Objetivos, tarefas e recompensas',
    category: 'social',
    priority: 8,
    hasNotification: (player?.quests?.filter(q => q.status === 'available')?.length || 0) > 0
  },

  // SYSTEM - Configurações
  {
    id: 'settings',
    label: 'Configurações',
    shortLabel: 'Conf.',
    icon: Settings,
    color: 'text-gray-600',
    description: 'Opções do jogo e preferências',
    category: 'system',
    priority: 9
  }
];

// Componente para categorias de abas
interface TabCategoryProps {
  category: string;
  tabs: GameTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobile: boolean;
}

const TabCategory: React.FC<TabCategoryProps> = React.memo(({ 
  category, 
  tabs, 
  activeTab, 
  onTabChange, 
  isMobile 
}) => {
  const categoryColors = {
    core: 'border-blue-200 bg-blue-50',
    inventory: 'border-green-200 bg-green-50',
    exploration: 'border-emerald-200 bg-emerald-50',
    crafting: 'border-orange-200 bg-orange-50',
    social: 'border-yellow-200 bg-yellow-50',
    system: 'border-gray-200 bg-gray-50'
  };

  const categoryLabels = {
    core: '👤 Jogador',
    inventory: '🎒 Inventário',
    exploration: '🌍 Exploração',
    crafting: '🔨 Criação',
    social: '⭐ Missões',
    system: '⚙️ Sistema'
  };

  if (tabs.length === 0) return null;

  return (
    <div className={`rounded-lg border p-2 ${categoryColors[category as keyof typeof categoryColors]}`}>
      {!isMobile && (
        <div className="text-xs font-medium text-gray-600 mb-2 px-2">
          {categoryLabels[category as keyof typeof categoryLabels]}
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              onClick={() => onTabChange(tab.id)}
              disabled={tab.isDisabled}
              className={`
                relative flex items-center justify-center space-x-1 px-2 py-2 rounded-md 
                font-medium transition-all text-xs min-w-0
                ${isActive 
                  ? "bg-white shadow-sm border text-gray-800 ring-2 ring-blue-200" 
                  : "hover:bg-white/60 text-gray-600 hover:text-gray-800"
                }
                ${tab.isDisabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              <Icon className={`w-4 h-4 ${tab.color} flex-shrink-0`} />
              {!isMobile && (
                <span className="truncate">
                  {isMobile ? (tab.shortLabel || tab.label) : tab.label}
                </span>
              )}
              {tab.hasNotification && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </TabsTrigger>
          );
        })}
      </div>
    </div>
  );
});

TabCategory.displayName = 'TabCategory';

// Componente para barra de status otimizada
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
        {icon && <span className="text-sm flex-shrink-0">{icon}</span>}
        <span className="text-xs font-medium text-gray-700 truncate">
          {Math.round(current)}/{max}
        </span>
      </div>
      <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
        <div 
          className={`${color} h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

// Componente para indicadores de equipamento
const EquipmentIndicators: React.FC<{ player: Player }> = React.memo(({ player }) => (
  <div className="flex items-center space-x-3">
    <div className="flex items-center space-x-1">
      <Shield className="w-3 h-3 text-blue-500 flex-shrink-0" />
      <span className={`text-xs ${player?.equippedArmor ? 'text-green-600' : 'text-gray-400'}`}>
        {player?.equippedArmor ? '✓' : '○'}
      </span>
    </div>
    <div className="flex items-center space-x-1">
      <Sword className="w-3 h-3 text-red-500 flex-shrink-0" />
      <span className={`text-xs ${player?.equippedWeapon ? 'text-green-600' : 'text-gray-400'}`}>
        {player?.equippedWeapon ? '✓' : '○'}
      </span>
    </div>
    <div className="flex items-center space-x-1">
      <Hammer className="w-3 h-3 text-orange-500 flex-shrink-0" />
      <span className={`text-xs ${player?.equippedTool ? 'text-green-600' : 'text-gray-400'}`}>
        {player?.equippedTool ? '✓' : '○'}
      </span>
    </div>
  </div>
));

EquipmentIndicators.displayName = 'EquipmentIndicators';

// Hook para detectar dispositivos móveis
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return isMobile;
};

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
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Use game data hook for real-time updates
  const { 
    inventory = [], 
    storage = [], 
    isLoading 
  } = useGameData({ playerId: player?.id });

  // Memoização das abas com notificações
  const gameTabs = useMemo(() => 
    createGameTabs(player, activeExpedition).sort((a, b) => a.priority - b.priority), 
    [player, activeExpedition]
  );

  // Agrupamento das abas por categoria
  const tabsByCategory = useMemo(() => {
    const grouped = gameTabs.reduce((acc, tab) => {
      if (!acc[tab.category]) {
        acc[tab.category] = [];
      }
      acc[tab.category].push(tab);
      return acc;
    }, {} as Record<string, GameTab[]>);

    return grouped;
  }, [gameTabs]);

  // Aba atual
  const currentTab = useMemo(() => 
    gameTabs.find(tab => tab.id === activeTab) || gameTabs[0], 
    [activeTab, gameTabs]
  );

  // Handlers com useCallback para performance
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'settings') {
      setSettingsOpen(true);
    } else {
      setActiveTab(tabId);
    }
  }, []);

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
        {/* Player Status Bar - Otimizada e Compacta */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Player Info */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">
                    {player?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                    {player?.name || 'Carregando...'}
                  </h1>
                  <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      <span>Nv.{player?.level || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                      <span>{player?.coins || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicators - Grid responsivo */}
              <div className="flex items-center justify-between sm:justify-end space-x-4">
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
                  icon="💧"
                />

                <EquipmentIndicators player={player} />

                {/* Activity Status */}
                {player?.autoStorage && (
                  <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                    <Moon className="w-3 h-3" />
                    <span className="hidden sm:inline">Offline</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full">
            {/* Tab Navigation - Sistema categorizado */}
            <div className="bg-white border-b border-gray-200">
              <ScrollArea className="w-full">
                <div className="p-2 sm:p-3">
                  <div className="flex flex-col gap-2">
                    {Object.entries(tabsByCategory).map(([category, tabs]) => (
                      <TabCategory
                        key={category}
                        category={category}
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={handleTabChange}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-3 sm:p-4">
                {/* Tab Header */}
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded-lg bg-white shadow-sm border">
                      <TabIcon className={`w-5 h-5 ${currentTab.color}`} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {currentTab.label}
                      </h2>
                      <p className="text-gray-600 text-sm">
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
                    discoveredAnimals={player.discoveredAnimals || []}
                    playerId={player.id}
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

      <PlayerSettings
        player={player}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        isBlocked={isBlocked}
      />
    </div>
  );
}
