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
            <span className={`${getSizeColor(animal.size)} text-lg flex-shrink-0`}>
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
            <p className="line-clamp-2 leading-relaxed">{animal.generalInfo.diet}</p>
            <div className="flex flex-wrap gap-1">
              {animal.habitat.slice(0, 3).map((hab, idx) => (
                <Badge key={idx} variant="outline" className="text-xs px-1.5 py-0.5">
                  {hab}
                </Badge>
              ))}
              {animal.habitat.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                  +{animal.habitat.length - 3}
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

function AnimalDetailModal({ animal, isOpen, onClose, isDiscovered }: AnimalDetailModalProps) {
  if (!animal || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto m-2">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{animal.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">
                  {isDiscovered ? animal.commonName : 'Animal Desconhecido'}
                </h2>
                {isDiscovered && (
                  <Badge className={`${getRarityColor(animal.rarity)} text-white`}>
                    {animal.rarity}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
          </div>

          {isDiscovered ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-sm text-gray-600">{animal.generalInfo.diet}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Características</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Tamanho:</strong> {animal.generalInfo.size}</div>
                  <div><strong>Comportamento:</strong> {animal.generalInfo.behavior.join(', ')}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Habitat</h3>
                <div className="flex flex-wrap gap-1">
                  {animal.habitat.map((hab, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {hab}
                    </Badge>
                  ))}
                </div>
              </div>

              {animal.generalInfo.funFacts && animal.generalInfo.funFacts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Curiosidades</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {animal.generalInfo.funFacts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Informações Gerais</h3>
                <div className="text-sm space-y-1">
                  <div>Expectativa de vida: {animal.generalInfo.lifespan}</div>
                  <div>Peso: {animal.generalInfo.weight}</div>
                  <div>Nível necessário: {animal.requiredLevel}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Info className="mx-auto mb-2" size={48} />
              <p>Descubra este animal para ver seus detalhes!</p>
            </div>
          )}
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
      const matchesSearch = animal.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.generalInfo.diet.toLowerCase().includes(searchTerm.toLowerCase());
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
        animal={selectedAnimal}
        isOpen={showModal}
        onClose={closeModal}
        isDiscovered={actualDiscoveredAnimals.includes(selectedAnimal?.id || '')}
      />
    </div>
  );
}