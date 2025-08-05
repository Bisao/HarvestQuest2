import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useGameContext } from '@/contexts/GameContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { SoundButton } from '@/components/ui/sound-button';
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
  Zap,
  ChevronDown,
  ChevronRight,
  Brain
} from 'lucide-react';
// Import all tab components
import UnifiedInventorySystem from './unified-inventory-system';
import EnhancedStorageTab from './enhanced-storage-tab';
import EnhancedBiomesTab from './enhanced-biomes-tab';
import UnifiedWorkshops from './unified-workshops';
import CampTab from './camp-tab';
import AnimalRegistryTab from './animal-registry-tab';
import StatusTab from './status-tab';
import SkillsTab from './skills-tab';
import QuestsTab from './quests-tab';
import PlayerSettings from './player-settings';
import ExpeditionPanel from './expedition-panel';
import NewInventoryInterface from '@/components/game/new-inventory-interface';

// Import modals
import { NewExpeditionModal } from './new-expedition-modal';
import { OfflineActivityReportDialog } from './offline-activity-report';
import AIAssistant from '@/components/ai/ai-assistant';

import type { Player, Biome, Resource, Equipment, Recipe } from '@shared/types';

// Define ActiveExpedition type locally since it's not in shared types
interface ActiveExpedition {
  id: string;
  biome: string;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed';
}
import './modern-game-layout.css';

// Tipos para as categorias da sidebar
interface SidebarCategory {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  subTabs: SidebarTab[];
  isExpanded?: boolean;
  count?: number;
}

interface SidebarTab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  hasNotification?: boolean;
  isDisabled?: boolean;
}

// Configuração das categorias da sidebar
const createSidebarCategories = (player: Player, activeExpedition: ActiveExpedition | null): SidebarCategory[] => [
  {
    id: 'acampamento',
    label: 'Acampamento',
    icon: Home,
    color: 'text-indigo-600',
    count: 3,
    subTabs: [
      {
        id: 'camp',
        label: 'Acampamento',
        icon: Home,
        color: 'text-indigo-600',
        description: 'Base, melhorias e construções'
      },
      {
        id: 'workshops',
        label: 'Oficinas',
        icon: Hammer,
        color: 'text-orange-600',
        description: 'Processar materiais e criar itens'
      },
      {
        id: 'storage',
        label: 'Armazém',
        icon: Package,
        color: 'text-purple-600',
        description: 'Armazenamento expandido de itens'
      }
    ]
  },
  {
    id: 'jogador',
    label: 'Jogador',
    icon: User,
    color: 'text-blue-600',
    count: 3,
    subTabs: [
      {
        id: 'status',
        label: 'Status',
        icon: User,
        color: 'text-blue-600',
        description: 'Estatísticas e informações do jogador'
      },
      {
        id: 'inventory',
        label: 'Inventário',
        icon: Backpack,
        color: 'text-green-600',
        description: 'Itens carregados e equipamentos'
      },
      {
        id: 'skills',
        label: 'Habilidades',
        icon: Zap,
        color: 'text-purple-600',
        description: 'Progressão e habilidades do jogador'
      }
    ]
  },
  {
    id: 'exploracao',
    label: 'Exploração',
    icon: TreePine,
    color: 'text-emerald-600',
    count: 2,
    subTabs: [
      {
        id: 'biomes',
        label: 'Expedições',
        icon: TreePine,
        color: 'text-emerald-600',
        description: 'Explorar biomas e coletar recursos',
        hasNotification: !!activeExpedition
      },
      {
        id: 'animals',
        label: 'Bestiário',
        icon: BookOpen,
        color: 'text-amber-600',
        description: 'Registro de animais descobertos'
      }
    ]
  },
  {
    id: 'missoes',
    label: 'Missões',
    icon: Star,
    color: 'text-yellow-600',
    count: 1,
    subTabs: [
      {
        id: 'quests',
        label: 'Missões',
        icon: Star,
        color: 'text-yellow-600',
        description: 'Objetivos, tarefas e recompensas'
      }
    ]
  },
  {
    id: 'sistema',
    label: 'Sistema',
    icon: Settings,
    color: 'text-gray-600',
    count: 2,
    subTabs: [
      {
        id: 'ai-assistant',
        label: 'Assistente IA',
        icon: Brain,
        color: 'text-blue-600',
        description: 'Recomendações estratégicas inteligentes'
      },
      {
        id: 'settings',
        label: 'Configurações',
        icon: Settings,
        color: 'text-gray-600',
        description: 'Opções do jogo e preferências'
      }
    ]
  }
];

// Componente para item da sidebar
interface SidebarItemProps {
  category: SidebarCategory;
  isExpanded: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = React.memo(({ 
  category, 
  isExpanded, 
  onToggle, 
  activeTab, 
  onTabChange 
}) => {
  const CategoryIcon = category.icon;
  const isMobile = useIsMobile();

  return (
    <div className="sidebar-category">
      {/* Category Header */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between ${isMobile ? 'p-2' : 'p-3'} hover:bg-gray-100 rounded-lg transition-colors group touch-friendly`}
      >
        <div className="flex items-center space-x-3">
          <CategoryIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${category.color}`} />
          <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium text-gray-700 group-hover:text-gray-900 truncate`}>
            {category.label}
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'} bg-gray-200 text-gray-600 rounded-full`}>
            {category.count}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </button>

      {/* Subcategories */}
      {isExpanded && (
        <div className={`${isMobile ? 'ml-4 mt-1' : 'ml-6 mt-2'} space-y-1`}>
          {category.subTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                disabled={tab.isDisabled}
                className={`
                  relative w-full flex items-center space-x-3 ${isMobile ? 'p-2 min-h-[44px]' : 'p-2'} rounded-lg text-left transition-all touch-friendly
                  ${isActive 
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700" 
                    : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                  }
                  ${tab.isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : tab.color} flex-shrink-0`} />
                <span className={`${isMobile ? 'text-sm' : 'text-sm'} truncate`}>
                  {tab.label}
                </span>
                {tab.hasNotification && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white shadow-sm" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

SidebarItem.displayName = 'SidebarItem';

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
  const isMobile = useIsMobile();

  return (
    <div className={`flex items-center ${isMobile ? 'space-x-1.5' : 'space-x-2'}`}>
      <div className="flex items-center space-x-1 min-w-0">
        {icon && <span className={`${isMobile ? 'text-xs' : 'text-sm'} flex-shrink-0`}>{icon}</span>}
        <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-gray-700 truncate`}>
          {Math.round(current)}/{max}
        </span>
      </div>
      <div className={`${isMobile ? 'w-12' : 'w-16'} bg-gray-200 rounded-full h-1.5 flex-shrink-0`}>
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
      <span className={`text-xs ${player?.equippedHelmet ? 'text-green-600' : 'text-gray-400'}`}>
        {player?.equippedHelmet ? '✓' : '○'}
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

// Componente principal refatorado
export default function ModernGameLayout() {
  const [activeTab, setActiveTab] = useState('camp');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['acampamento']);
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [offlineReportOpen, setOfflineReportOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);


  const { toast } = useToast();

  // Use context instead of props
  const gameState = useGameContext();

  const { player, activeExpedition, setActiveExpedition, resources, equipment, biomes, recipes } = gameState;

  // Local state for auth warning and blocked status
  const authWarning = false; // TODO: implement auth warning logic
  const isBlocked = false; // TODO: implement blocked status logic

  // Memoização das categorias da sidebar
  const sidebarCategories = useMemo(() => 
    player ? createSidebarCategories(player, activeExpedition) : [], 
    [player, activeExpedition]
  );

  // Encontrar aba atual
  const currentTab = useMemo(() => {
    for (const category of sidebarCategories) {
      const tab = category.subTabs.find(tab => tab.id === activeTab);
      if (tab) return tab;
    }
    return sidebarCategories[0]?.subTabs[0];
  }, [activeTab, sidebarCategories]);

  // Handlers com useCallback para performance
  const handleTabChange = useCallback((tabId: string) => {
    if (tabId === 'settings') {
      setSettingsOpen(true);
    } else if (tabId === 'ai-assistant') {
      setAiAssistantOpen(true);
    } else {
      setActiveTab(tabId);
    }
  }, []);

    const toggleSidebar = useCallback(() => {
        setIsSidebarOpen(prev => !prev);
    }, []);

  const handleCategoryToggle = useCallback((categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
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
    if (!player?.lastOnlineTime) return;

    const lastSeenTime = new Date(player.lastOnlineTime).getTime();
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
  }, [player?.lastOnlineTime]);

  // Loading state
  if (gameState.isLoading || !player) {
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

  const TabIcon = currentTab?.icon || User;

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

      {/* Layout Principal */}
      <div className="flex h-screen overflow-hidden">
        {/* Overlay para mobile */}
        {isMobile && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed top-0 left-0 h-full z-50 w-[85vw] max-w-[320px]' : 'w-80'} 
          bg-white border-r border-gray-200 shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          safe-area-top
        `}>
          {/* Player Status Header */}
          <div className={`${isMobile ? 'p-3' : 'p-4'} border-b border-gray-200 bg-gray-50 safe-area-top`}>
            {isMobile && (
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">Menu</h2>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="flex items-center space-x-3 mb-3">
              <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                <span className={`text-white font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {player?.username?.charAt(0) || '?'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-gray-800 truncate`}>
                  {player?.username || 'Carregando...'}
                </h1>
                <div className={`flex items-center space-x-2 ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>
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

            {/* Status Indicators Compactos */}
            <div className={`space-y-${isMobile ? '1.5' : '2'}`}>
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

              <div className={`flex items-center ${isMobile ? 'justify-center' : 'justify-between'} pt-1 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
                <EquipmentIndicators player={player} />

                {player?.autoStorage && (
                  <Badge variant="outline" className={`flex items-center space-x-1 ${isMobile ? 'text-xs px-2 py-1' : 'text-xs'}`}>
                    <Moon className="w-3 h-3" />
                    <span>Offline</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <ScrollArea className={`flex-1 ${isMobile ? 'p-2' : 'p-4'} mobile-scroll`}>
            <div className={`space-y-${isMobile ? '1' : '2'}`}>
              {sidebarCategories.map((category) => (
                <SidebarItem
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategories.includes(category.id)}
                  onToggle={() => handleCategoryToggle(category.id)}
                  activeTab={activeTab}
                  onTabChange={(tabId) => {
                    handleTabChange(tabId);
                    if (isMobile) {
                      setIsSidebarOpen(false);
                    }
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Content Header */}
          <div className={`bg-white border-b border-gray-200 safe-area-top ${isMobile ? 'p-2' : 'p-4'}`}>
            <div className="flex items-center space-x-2 md:space-x-3">
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors touch-friendly flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <div className={`p-2 rounded-lg bg-gray-50 border flex-shrink-0`}>
                <TabIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${currentTab?.color || 'text-gray-600'}`} />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h2 className={`${isMobile ? 'text-base' : 'text-xl'} font-bold text-gray-800 truncate`}>
                  {currentTab?.label || 'Carregando...'}
                </h2>
                {!isMobile && (
                  <p className="text-gray-600 text-sm truncate">
                    {currentTab?.description || 'Preparando conteúdo...'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className={`flex-1 overflow-auto bg-gray-50 ${isMobile ? 'p-2 pb-safe' : 'p-4'} safe-area-bottom mobile-content-spacing`}>
            {activeTab === 'status' && player && (
              <StatusTab 
                player={player}
              />
            )}

            {activeTab === 'inventory' && (
              <NewInventoryInterface
                playerId={player.id}
                resources={resources}
                equipment={equipment}
                player={player}
                isBlocked={isBlocked}
              />
            )}

            {activeTab === 'storage' && (
              <EnhancedStorageTab
                playerId={player.id}
                resources={resources}
                equipment={equipment}
                player={player}
                isBlocked={isBlocked}
              />
            )}

            {activeTab === 'biomes' && (
              <EnhancedBiomesTab
                player={player}
                biomes={biomes}
                resources={resources}
                equipment={equipment}
                onExpeditionStart={handleExpeditionStart}
              />
            )}

            {activeTab === 'camp' && (
              <CampTab
                player={player}
                resources={resources}
                equipment={equipment}
              />
            )}

            {activeTab === 'workshops' && player && (
              <UnifiedWorkshops
                player={player}
                resources={resources}
                isBlocked={isBlocked}
              />
            )}



            {activeTab === 'animals' && (
              <AnimalRegistryTab 
                discoveredAnimals={[]}
                playerId={player.id}
                onAnimalSelect={(animal) => {
                  console.log('Animal selecionado:', animal);
                }}
              />
            )}

            {activeTab === 'skills' && (
              <SkillsTab
                player={player}
              />
            )}

            {activeTab === 'quests' && (
              <QuestsTab
                player={player}
              />
            )}
          </div>
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
      {player && selectedBiome && (
        <NewExpeditionModal
          isOpen={expeditionModalOpen}
          onClose={handleExpeditionModalClose}
          biome={selectedBiome}
          player={player}
        />
      )}

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

      {aiAssistantOpen && player && (
        <AIAssistant
          isOpen={aiAssistantOpen}
          onClose={() => setAiAssistantOpen(false)}
          playerId={player.id}
        />
      )}
    </div>
  );
}

export { ModernGameLayout };