import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { 
  Book, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Award, 
  Eye,
  Star,
  Calendar,
  Target,
  Heart,
  Sparkles,
  Info
} from 'lucide-react';

// Importar dados reais do registry do servidor
import { ANIMAL_REGISTRY } from '../../../../server/data/animal-registry';
import type { AnimalRegistryEntry } from '../../../../shared/types/animal-registry-types';

const ANIMAL_CATEGORIES = [
  { id: 'all', name: 'Todos', emoji: '🌍', description: 'Todos os animais' },
  { id: 'mammal_small', name: 'Mamíferos Pequenos', emoji: '🐰', description: 'Pequenos mamíferos' },
  { id: 'mammal_medium', name: 'Mamíferos Médios', emoji: '🦌', description: 'Mamíferos de porte médio' },
  { id: 'mammal_large', name: 'Mamíferos Grandes', emoji: '🐻', description: 'Grandes mamíferos' },
  { id: 'bird', name: 'Aves', emoji: '🐦', description: 'Criaturas voadoras com penas' },
  { id: 'fish_freshwater', name: 'Peixes de Água Doce', emoji: '🐟', description: 'Peixes de rios e lagos' },
  { id: 'fish_saltwater', name: 'Peixes de Água Salgada', emoji: '🐠', description: 'Peixes marinhos' },
  { id: 'reptile', name: 'Répteis', emoji: '🦎', description: 'Animais de sangue frio com escamas' },
  { id: 'amphibian', name: 'Anfíbios', emoji: '🐸', description: 'Criaturas que vivem na terra e água' },
  { id: 'insect', name: 'Insetos', emoji: '🦋', description: 'Pequenos artrópodes' },
  { id: 'arthropod', name: 'Artrópodes', emoji: '🦂', description: 'Artrópodes diversos' },
  { id: 'mythical', name: 'Criaturas Míticas', emoji: '🦄', description: 'Seres lendários e mágicos' }
];

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

const getSizeColor = (size: string) => {
  switch (size) {
    case 'tiny': return 'text-xs';
    case 'small': return 'text-sm';
    case 'medium': return 'text-base';
    case 'large': return 'text-lg';
    case 'huge': return 'text-xl';
    default: return 'text-base';
  }
};

interface AnimalRegistryTabProps {
  discoveredAnimals: string[];
  playerId: string;
  onAnimalSelect?: (animal: AnimalRegistryEntry) => void;
}

interface AnimalCardProps {
  animal: AnimalRegistryEntry;
  isDiscovered: boolean;
  onClick: () => void;
}

function AnimalCard({ animal, isDiscovered, onClick }: AnimalCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md touch-manipulation min-h-[120px] ${
        isDiscovered ? 'border-green-200 bg-green-50' : 'border-gray-200 opacity-60'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className={`${getSizeColor(animal.generalInfo.size)} text-lg flex-shrink-0`}>
              {animal.emoji}
            </span>
            <span className="font-semibold text-sm truncate">
              {isDiscovered ? animal.commonName : '???'}
            </span>
          </div>
          {isDiscovered && (
            <Badge className={`text-xs ${getRarityColor(animal.rarity)} text-white flex-shrink-0 ml-2`}>
              {animal.rarity}
            </Badge>
          )}
        </div>

        {isDiscovered && (
          <div className="space-y-2 text-xs text-gray-600">
            <p className="line-clamp-2 leading-relaxed">{animal.generalInfo?.diet || 'Informação não disponível'}</p>
            <div className="flex flex-wrap gap-1">
              {(animal.habitat || []).slice(0, 3).map((hab, idx) => (
                <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0.5">
                  {hab}
                </Badge>
              ))}
              {(animal.habitat || []).length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{(animal.habitat || []).length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {!isDiscovered && (
          <div className="text-xs text-gray-400 py-2">
            <p>Descubra este animal explorando!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnimalDetailModalProps {
  animal: AnimalRegistryEntry | null;
  isOpen: boolean;
  onClose: () => void;
  isDiscovered: boolean;
}

function AnimalDetailModal({ animal, isOpen, onClose }: AnimalDetailModalProps) {
  if (!isOpen || !animal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="p-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-5xl">{animal.emoji}</span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge className={`${getRarityColor(animal.rarity)} shadow-md`}>
                    {animal.rarity.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-1">{animal.commonName}</h2>
                <p className="text-lg text-gray-600 italic mb-2">{animal.scientificName}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {(ANIMAL_CATEGORIES as any)[animal.category] || animal.category}
                  </Badge>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">Nível {animal.requiredLevel}+</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 w-10 h-10 rounded-full"
            >
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              {/* Physical Characteristics */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Award className="w-5 h-5 text-blue-500" />
                  Características Físicas
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Tamanho:</span>
                    <span className="text-gray-900 font-semibold">{animal.generalInfo.size}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Peso:</span>
                    <span className="text-gray-900 font-semibold">{animal.generalInfo.weight}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Expectativa de Vida:</span>
                    <span className="text-gray-900 font-semibold">{animal.generalInfo.lifespan}</span>
                  </div>
                </div>
              </div>

              {/* Habitat & Discovery */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <MapPin className="w-5 h-5 text-green-500" />
                  Habitat & Descoberta
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Habitats:</span>
                    <div className="flex flex-wrap gap-2">
                      {animal.habitat.map((h) => (
                        <Badge key={h} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          {h}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Método:</span>
                    <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                      {animal.discoveryMethod}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Locais de Descoberta:</span>
                    <div className="flex flex-wrap gap-2">
                      {animal.discoveryLocation.map((loc) => (
                        <Badge key={loc} variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Diet & Behavior */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Heart className="w-5 h-5 text-red-500" />
                  Dieta & Comportamento
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Dieta:</span>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{animal.generalInfo.diet}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Comportamentos:</span>
                    <div className="flex flex-wrap gap-2">
                      {animal.generalInfo.behavior.map((behavior, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs bg-orange-50 border-orange-200 text-orange-700">
                          {behavior}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Combat & Gender Info */}
            <div className="space-y-6">
              {/* Combat Statistics */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Target className="w-5 h-5 text-red-500" />
                  Estatísticas de Combate
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <div className="text-2xl font-bold text-red-600">{animal.combat.health}</div>
                      <div className="text-xs text-red-700 font-medium">HP</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{animal.combat.defense}</div>
                      <div className="text-xs text-blue-700 font-medium">DEFESA</div>
                    </div>
                  </div>

                  {/* Attacks */}
                  <div>
                    <span className="font-medium text-gray-700 block mb-2">Ataques:</span>
                    <div className="space-y-2">
                      {animal.combat.attacks.map((attack, idx) => (
                        <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-gray-800">{attack.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="destructive" className="text-xs">
                                {attack.damage} dano
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {attack.type}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">{attack.description}</p>
                          <div className="text-xs text-gray-500 mt-1">
                            Precisão: {attack.accuracy}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Abilities */}
                  {animal.combat.abilities.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-700 block mb-2">Habilidades:</span>
                      <div className="space-y-2">
                        {animal.combat.abilities.map((ability, idx) => (
                          <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-semibold text-purple-800">{ability.name}</span>
                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700">
                                {ability.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-purple-700">{ability.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses & Resistances */}
                  <div className="grid grid-cols-1 gap-3">
                    {animal.combat.weaknesses.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Fraquezas:</span>
                        <div className="flex flex-wrap gap-1">
                          {animal.combat.weaknesses.map((weakness, idx) => (
                            <Badge key={idx} variant="destructive" className="text-xs">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {animal.combat.resistances.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Resistências:</span>
                        <div className="flex flex-wrap gap-1">
                          {animal.combat.resistances.map((resistance, idx) => (
                            <Badge key={idx} className="text-xs bg-green-100 text-green-700 border-green-300">
                              {resistance}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Gender Information */}
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Info className="w-5 h-5 text-purple-500" />
                  Dimorfismo Sexual
                </h3>
                <div className="space-y-4">
                  {/* Male */}
                  <div className="border-l-4 border-blue-400 bg-blue-50 rounded-r-lg p-4">
                    <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">♂</span>
                      {animal.male.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-blue-600">Características:</span>
                        <ul className="list-disc list-inside text-blue-700 mt-1 ml-2">
                          {animal.male.characteristics.map((char, idx) => (
                            <li key={idx}>{char}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <span className="font-medium">Tamanho:</span><br />
                          <span className="text-blue-700">{animal.male.physicalTraits.size}</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="font-medium">Peso:</span><br />
                          <span className="text-blue-700">{animal.male.physicalTraits.weight}</span>
                        </div>
                      </div>
                      {animal.male.reproductiveInfo && (
                        <div className="bg-white p-2 rounded text-xs">
                          <span className="font-medium">Reprodução:</span><br />
                          <span className="text-blue-700">{animal.male.reproductiveInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Female */}
                  <div className="border-l-4 border-pink-400 bg-pink-50 rounded-r-lg p-4">
                    <h4 className="font-bold text-pink-700 mb-2 flex items-center gap-2">
                      <span className="text-lg">♀</span>
                      {animal.female.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-semibold text-pink-600">Características:</span>
                        <ul className="list-disc list-inside text-pink-700 mt-1 ml-2">
                          {animal.female.characteristics.map((char, idx) => (
                            <li key={idx}>{char}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2 rounded">
                          <span className="font-medium">Tamanho:</span><br />
                          <span className="text-pink-700">{animal.female.physicalTraits.size}</span>
                        </div>
                        <div className="bg-white p-2 rounded">
                          <span className="font-medium">Peso:</span><br />
                          <span className="text-pink-700">{animal.female.physicalTraits.weight}</span>
                        </div>
                      </div>
                      {animal.female.reproductiveInfo && (
                        <div className="bg-white p-2 rounded text-xs">
                          <span className="font-medium">Reprodução:</span><br />
                          <span className="text-pink-700">{animal.female.reproductiveInfo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Fun Facts & Drops */}
            <div className="space-y-6">
              {/* Fun Facts */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 shadow-sm border border-yellow-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Curiosidades Fascinantes
                </h3>
                <div className="space-y-3">
                  {animal.generalInfo.funFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                      <span className="text-yellow-500 text-lg mt-0.5 flex-shrink-0">💡</span>
                      <p className="text-sm text-gray-700 leading-relaxed">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drops */}
              {animal.drops.length > 0 && (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                    <Star className="w-5 h-5 text-amber-500" />
                    Itens & Recompensas
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {animal.drops.map((drop, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{drop.emoji}</span>
                            <div>
                              <div className="font-semibold text-gray-800">{drop.itemName}</div>
                              <Badge className={getRarityColor(drop.rarity)} variant="outline">
                                {drop.rarity}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-3">
                            <div className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              <span className="font-medium">{drop.dropRate}%</span> chance
                            </div>
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {drop.minQuantity === drop.maxQuantity 
                                ? `${drop.minQuantity}x` 
                                : `${drop.minQuantity}-${drop.maxQuantity}x`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info Panel */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 shadow-sm border border-indigo-200">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Informações Adicionais
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-gray-700">ID da Espécie:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">{animal.id}</code>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-gray-700">Status:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Descoberto
                    </Badge>
                  </div>
                  {animal.discoveredAt && (
                    <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                      <span className="text-gray-700">Descoberto em:</span>
                      <span className="text-gray-600 text-xs">
                        {new Date(animal.discoveredAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnimalRegistryTab({ discoveredAnimals, playerId }: AnimalRegistryTabProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRegistryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [devModeActive, setDevModeActive] = useState(false);

  // Check if dev mode is active
  useEffect(() => {
    const checkDevMode = async () => {
      try {
        const response = await fetch(`/api/developer/status/${playerId}`);
        if (response.ok) {
          const data = await response.json();
          setDevModeActive(data.devModeActive);
        }
      } catch (error) {
        console.error('Error checking dev mode:', error);
      }
    };

    if (playerId) {
      checkDevMode();
    }
  }, [playerId]);

  // Para teste: alguns animais descobertos
  const mockDiscoveredAnimals = ['animal-rabbit-001', 'animal-smallfish-001'];
  const baseDiscoveredAnimals = discoveredAnimals.length > 0 ? discoveredAnimals : mockDiscoveredAnimals;

  // If dev mode is active, show all animals as discovered
  const actualDiscoveredAnimals = devModeActive 
    ? ANIMAL_REGISTRY.map(animal => animal.id)
    : baseDiscoveredAnimals;

  // Filtrar animais
  const filteredAnimals = useMemo(() => {
    return ANIMAL_REGISTRY.filter(animal => {
      const matchesSearch = (animal.commonName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (animal.generalInfo?.diet || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || animal.category === selectedCategory;
      const matchesRarity = filterRarity === 'all' || animal.rarity === filterRarity;

      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [searchTerm, selectedCategory, filterRarity]);

  // Estatísticas
  const totalAnimals = ANIMAL_REGISTRY.length;
  const discoveredCount = actualDiscoveredAnimals.length;
  const discoveryPercentage = Math.round((discoveredCount / totalAnimals) * 100);

  const handleAnimalClick = (animal: AnimalRegistryEntry) => {
    setSelectedAnimal(animal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnimal(null);
  };

  return (
    <div className="p-2 md:p-4 space-y-3 md:space-y-4 pb-20 md:pb-4">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Bestiário
            {devModeActive && (
              <Badge className="bg-red-500 text-white text-xs ml-2">
                🧪 MODO DEV
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Registro completo da fauna descoberta
            {devModeActive && (
              <span className="text-red-500 block text-xs mt-1">
                ⚠️ Modo desenvolvedor ativo - todos os animais visíveis
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Progresso de Descoberta</span>
              <span>{discoveredCount}/{totalAnimals} ({discoveryPercentage}%)</span>
            </div>
            <Progress value={discoveryPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Filtros Mobile-Friendly */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="space-y-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar animais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* Categorias com scroll horizontal otimizado para mobile */}
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {ANIMAL_CATEGORIES.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="whitespace-nowrap flex-shrink-0 min-w-fit px-3 py-2 text-xs md:text-sm"
                  >
                    <span className="mr-1 text-sm">{category.emoji}</span>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Filtro de raridade mobile-friendly */}
            <div className="flex gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="flex-1 px-3 py-2 border rounded text-sm bg-white min-h-[40px]"
              >
                <option value="all">Todas as Raridades</option>
                <option value="common">Comum</option>
                <option value="uncommon">Incomum</option>
                <option value="rare">Raro</option>
                <option value="epic">Épico</option>
                <option value="legendary">Lendário</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de animais responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {filteredAnimals.map(animal => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            isDiscovered={actualDiscoveredAnimals.includes(animal.id)}
            onClick={() => handleAnimalClick(animal)}
          />
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum animal encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de detalhes */}
      <AnimalDetailModal
        animal={selectedAnimal}        isOpen={showModal}
        onClose={closeModal}
        isDiscovered={actualDiscoveredAnimals.includes(selectedAnimal?.id || '')}
      />
    </div>
  );
}