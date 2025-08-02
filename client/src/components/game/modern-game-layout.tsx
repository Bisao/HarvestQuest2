import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Map, 
  Package, 
  Hammer, 
  Scroll,
  Settings,
  Home,
  AlertTriangle,
  Zap
} from 'lucide-react';
import type { Player, Biome, Resource, Equipment, Recipe } from '@shared/types';
import GameHeader from './game-header';
import UnifiedInventory from './unified-inventory';
import UnifiedWorkshops from './unified-workshops';
import EnhancedBiomesTab from './enhanced-biomes-tab';
import QuestsTab from './quests-tab';
import StatusTab from './status-tab';
import PlayerSettings from './player-settings';
import ExpeditionPanel, { type ActiveExpedition } from './expedition-panel';

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

const GAME_TABS = [
  { id: 'exploration', name: 'Exploração', icon: Map, component: 'biomes' },
  { id: 'inventory', name: 'Inventário', icon: Package, component: 'inventory' },
  { id: 'workshops', name: 'Oficinas', icon: Hammer, component: 'workshops' },
  { id: 'quests', name: 'Missões', icon: Scroll, component: 'quests' },
  { id: 'status', name: 'Status', icon: Zap, component: 'status' }
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
  const [activeTab, setActiveTab] = useState('exploration');
  const [showSettings, setShowSettings] = useState(false);

  // Auto-hide auth warning after 10 seconds
  useEffect(() => {
    if (authWarning) {
      const timer = setTimeout(() => {
        // You can add logic here to hide the warning
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [authWarning]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'exploration':
        return (
          <EnhancedBiomesTab
            biomes={biomes}
            resources={resources}
            equipment={equipment}
            player={player}
            onExpeditionStart={setActiveExpedition}
          />
        );
      
      case 'inventory':
        return (
          <UnifiedInventory
            playerId={player.id}
            resources={resources}
            equipment={equipment}
            player={player}
            isBlocked={isBlocked}
          />
        );
      
      case 'workshops':
        return (
          <UnifiedWorkshops
            player={player}
            resources={resources}
            isBlocked={isBlocked}
          />
        );
      
      case 'quests':
        return (
          <QuestsTab
            player={player}
          />
        );
      
      case 'status':
        return (
          <StatusTab
            player={player}
            resources={resources}
            equipment={equipment}
            isBlocked={isBlocked}
          />
        );
      
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">Aba não encontrada</h3>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <GameHeader player={player} />

      {/* Auth Warning */}
      {authWarning && (
        <Alert className="mx-4 mt-4 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Você não está autenticado. Algumas funcionalidades podem não funcionar corretamente.
            <Button 
              variant="link" 
              className="ml-2 p-0 h-auto text-yellow-800 underline"
              onClick={() => window.location.href = '/'}
            >
              Fazer login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-2xl grid-cols-5">
                  {GAME_TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className="flex items-center space-x-1"
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex items-center space-x-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Configurações</span>
                </Button>
              </div>

              {GAME_TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  {renderTabContent()}
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Expedition Panel */}
            {activeExpedition && (
              <ExpeditionPanel
                expedition={activeExpedition}
                onExpeditionComplete={() => setActiveExpedition(null)}
                playerId={player.id}
              />
            )}

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Status Rápido</span>
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Nível:</span>
                    <Badge variant="outline">{player.level}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Experiência:</span>
                    <span>{player.experience % 100}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fome:</span>
                    <span className={player.hunger <= 20 ? 'text-red-600' : 'text-green-600'}>
                      {player.hunger}/{player.maxHunger}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sede:</span>
                    <span className={player.thirst <= 20 ? 'text-red-600' : 'text-green-600'}>
                      {player.thirst}/{player.maxThirst}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('inventory')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Ver Inventário
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('workshops')}
                  >
                    <Hammer className="w-4 h-4 mr-2" />
                    Ir para Oficinas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => window.location.href = '/'}
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Menu Principal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <PlayerSettings
          playerId={player.id}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}