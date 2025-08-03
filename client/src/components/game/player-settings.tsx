
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings,
  Volume2,
  Bell,
  Eye,
  Palette,
  Save,
  RotateCcw,
  User,
  Gamepad2,
  Shield,
  Info
} from 'lucide-react';
import type { Player } from '@shared/types';

interface PlayerSettingsProps {
  player: Player;
  isBlocked?: boolean;
}

export default function PlayerSettings({ player, isBlocked = false }: PlayerSettingsProps) {
  const [settings, setSettings] = useState({
    // Configurações de Audio
    masterVolume: 75,
    sfxVolume: 80,
    musicVolume: 60,
    ambientVolume: 50,
    
    // Configurações de Interface
    theme: 'auto',
    language: 'pt-BR',
    fontSize: 'medium',
    animations: true,
    reducedMotion: false,
    
    // Configurações de Notificações
    expeditionNotifications: true,
    resourceNotifications: true,
    questNotifications: true,
    offlineNotifications: true,
    
    // Configurações de Jogabilidade
    autoSave: true,
    autoConsume: true,
    quickActions: true,
    confirmActions: true,
    
    // Configurações de Privacidade
    showOnlineStatus: true,
    allowFriendRequests: true,
    shareStatistics: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // Implementar salvamento das configurações
    console.log('Salvando configurações:', settings);
  };

  const handleResetSettings = () => {
    // Reset para configurações padrão
    setSettings({
      masterVolume: 75,
      sfxVolume: 80,
      musicVolume: 60,
      ambientVolume: 50,
      theme: 'auto',
      language: 'pt-BR',
      fontSize: 'medium',
      animations: true,
      reducedMotion: false,
      expeditionNotifications: true,
      resourceNotifications: true,
      questNotifications: true,
      offlineNotifications: true,
      autoSave: true,
      autoConsume: true,
      quickActions: true,
      confirmActions: true,
      showOnlineStatus: true,
      allowFriendRequests: true,
      shareStatistics: false,
    });
  };

  const settingsTabs = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      color: 'text-blue-600'
    },
    {
      id: 'audio',
      label: 'Áudio',
      icon: Volume2,
      color: 'text-green-600'
    },
    {
      id: 'interface',
      label: 'Interface',
      icon: Palette,
      color: 'text-purple-600'
    },
    {
      id: 'notifications',
      label: 'Notificações',
      icon: Bell,
      color: 'text-orange-600'
    },
    {
      id: 'gameplay',
      label: 'Jogabilidade',
      icon: Gamepad2,
      color: 'text-red-600'
    },
    {
      id: 'privacy',
      label: 'Privacidade',
      icon: Shield,
      color: 'text-gray-600'
    }
  ];

  if (isBlocked) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Configurações temporariamente indisponíveis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configurações</h2>
          <p className="text-gray-600">Personalize sua experiência de jogo</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Redefinir
          </Button>
          <Button onClick={handleSaveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="profile" orientation="vertical" className="w-full">
                <TabsList className="grid w-full grid-rows-6 h-auto bg-transparent p-1">
                  {settingsTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="w-full justify-start gap-2 text-left data-[state=active]:bg-primary/10"
                      >
                        <Icon className={`w-4 h-4 ${tab.color}`} />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <Tabs defaultValue="profile" className="h-full">
                {/* Profile Tab */}
                <TabsContent value="profile" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Informações do Jogador</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Nome do Jogador</Label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{player?.name || 'Não definido'}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Nível</Label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">Nível {player?.level || 0}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Moedas</Label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">{player?.coins || 0} moedas</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Tempo de Jogo</Label>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">--:-- horas</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {player?.discoveredAnimals?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Animais Descobertos</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">0</div>
                              <div className="text-sm text-gray-600">Expedições Completas</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-purple-600">0</div>
                              <div className="text-sm text-gray-600">Itens Criados</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Audio Tab */}
                <TabsContent value="audio" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configurações de Áudio</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Volume Geral</Label>
                            <span className="text-sm text-gray-600">{settings.masterVolume}%</span>
                          </div>
                          <Slider
                            value={[settings.masterVolume]}
                            onValueChange={(value) => handleSettingChange('masterVolume', value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Efeitos Sonoros</Label>
                            <span className="text-sm text-gray-600">{settings.sfxVolume}%</span>
                          </div>
                          <Slider
                            value={[settings.sfxVolume]}
                            onValueChange={(value) => handleSettingChange('sfxVolume', value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Música</Label>
                            <span className="text-sm text-gray-600">{settings.musicVolume}%</span>
                          </div>
                          <Slider
                            value={[settings.musicVolume]}
                            onValueChange={(value) => handleSettingChange('musicVolume', value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Sons Ambiente</Label>
                            <span className="text-sm text-gray-600">{settings.ambientVolume}%</span>
                          </div>
                          <Slider
                            value={[settings.ambientVolume]}
                            onValueChange={(value) => handleSettingChange('ambientVolume', value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Interface Tab */}
                <TabsContent value="interface" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configurações de Interface</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Tema</Label>
                          <Select 
                            value={settings.theme} 
                            onValueChange={(value) => handleSettingChange('theme', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="light">Claro</SelectItem>
                              <SelectItem value="dark">Escuro</SelectItem>
                              <SelectItem value="auto">Automático</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Idioma</Label>
                          <Select 
                            value={settings.language} 
                            onValueChange={(value) => handleSettingChange('language', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="es-ES">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Tamanho da Fonte</Label>
                          <Select 
                            value={settings.fontSize} 
                            onValueChange={(value) => handleSettingChange('fontSize', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">Pequena</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="large">Grande</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Animações</Label>
                            <div className="text-sm text-gray-600">Ativar animações da interface</div>
                          </div>
                          <Switch
                            checked={settings.animations}
                            onCheckedChange={(value) => handleSettingChange('animations', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Movimento Reduzido</Label>
                            <div className="text-sm text-gray-600">Reduzir animações para acessibilidade</div>
                          </div>
                          <Switch
                            checked={settings.reducedMotion}
                            onCheckedChange={(value) => handleSettingChange('reducedMotion', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configurações de Notificações</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações de Expedição</Label>
                            <div className="text-sm text-gray-600">Avisos sobre expedições concluídas</div>
                          </div>
                          <Switch
                            checked={settings.expeditionNotifications}
                            onCheckedChange={(value) => handleSettingChange('expeditionNotifications', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações de Recursos</Label>
                            <div className="text-sm text-gray-600">Avisos sobre recursos encontrados</div>
                          </div>
                          <Switch
                            checked={settings.resourceNotifications}
                            onCheckedChange={(value) => handleSettingChange('resourceNotifications', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações de Missões</Label>
                            <div className="text-sm text-gray-600">Avisos sobre missões completas</div>
                          </div>
                          <Switch
                            checked={settings.questNotifications}
                            onCheckedChange={(value) => handleSettingChange('questNotifications', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Atividade Offline</Label>
                            <div className="text-sm text-gray-600">Relatórios de atividade quando ausente</div>
                          </div>
                          <Switch
                            checked={settings.offlineNotifications}
                            onCheckedChange={(value) => handleSettingChange('offlineNotifications', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Gameplay Tab */}
                <TabsContent value="gameplay" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configurações de Jogabilidade</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Salvamento Automático</Label>
                            <div className="text-sm text-gray-600">Salvar progresso automaticamente</div>
                          </div>
                          <Switch
                            checked={settings.autoSave}
                            onCheckedChange={(value) => handleSettingChange('autoSave', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Consumo Automático</Label>
                            <div className="text-sm text-gray-600">Consumir itens automaticamente quando necessário</div>
                          </div>
                          <Switch
                            checked={settings.autoConsume}
                            onCheckedChange={(value) => handleSettingChange('autoConsume', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Ações Rápidas</Label>
                            <div className="text-sm text-gray-600">Atalhos de teclado e ações rápidas</div>
                          </div>
                          <Switch
                            checked={settings.quickActions}
                            onCheckedChange={(value) => handleSettingChange('quickActions', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Confirmar Ações</Label>
                            <div className="text-sm text-gray-600">Pedir confirmação para ações importantes</div>
                          </div>
                          <Switch
                            checked={settings.confirmActions}
                            onCheckedChange={(value) => handleSettingChange('confirmActions', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy" className="h-full m-0">
                  <ScrollArea className="h-full p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Configurações de Privacidade</h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Status Online</Label>
                            <div className="text-sm text-gray-600">Mostrar quando você está online</div>
                          </div>
                          <Switch
                            checked={settings.showOnlineStatus}
                            onCheckedChange={(value) => handleSettingChange('showOnlineStatus', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Solicitações de Amizade</Label>
                            <div className="text-sm text-gray-600">Permitir receber convites de amizade</div>
                          </div>
                          <Switch
                            checked={settings.allowFriendRequests}
                            onCheckedChange={(value) => handleSettingChange('allowFriendRequests', value)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Compartilhar Estatísticas</Label>
                            <div className="text-sm text-gray-600">Permitir que outros vejam suas estatísticas</div>
                          </div>
                          <Switch
                            checked={settings.shareStatistics}
                            onCheckedChange={(value) => handleSettingChange('shareStatistics', value)}
                          />
                        </div>

                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Suas configurações de privacidade ajudam a controlar como outras pessoas podem interagir com você no jogo.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
