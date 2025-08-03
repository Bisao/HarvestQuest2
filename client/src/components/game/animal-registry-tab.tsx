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

// Importar dados reais do registry
import { ANIMAL_REGISTRY } from '../../../shared/data/animal-registry';
import type { AnimalData } from '../../../shared/data/animal-registry';

const ANIMAL_CATEGORIES = [
  { id: 'all', name: 'Todos', emoji: '🌍', description: 'Todos os animais' },
  { id: 'mammal', name: 'Mamíferos', emoji: '🐾', description: 'Animais de sangue quente com pelos' },
  { id: 'bird', name: 'Aves', emoji: '🐦', description: 'Criaturas voadoras com penas' },
  { id: 'aquatic', name: 'Vida Aquática', emoji: '🐟', description: 'Criaturas que vivem na água' },
  { id: 'insect', name: 'Insetos', emoji: '🦋', description: 'Pequenos artrópodes' },
  { id: 'reptile', name: 'Répteis', emoji: '🦎', description: 'Animais de sangue frio com escamas' },
  { id: 'amphibian', name: 'Anfíbios', emoji: '🐸', description: 'Criaturas que vivem na terra e água' },
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
  onAnimalSelect?: (animal: AnimalData) => void;
}

interface AnimalCardProps {
  animal: AnimalData;
  isDiscovered: boolean;
  onClick: () => void;
}

function AnimalCard({ animal, isDiscovered, onClick }: AnimalCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDiscovered ? 'border-green-200 bg-green-50' : 'border-gray-200 opacity-60'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`${getSizeColor(animal.size)}`}>
              {animal.emoji}
            </span>
            <span className="font-semibold text-sm">
              {isDiscovered ? animal.name : '???'}
            </span>
          </div>
          {isDiscovered && (
            <Badge className={`text-xs ${getRarityColor(animal.rarity)} text-white`}>
              {animal.rarity}
            </Badge>
          )}
        </div>

        {isDiscovered && (
          <div className="space-y-1 text-xs text-gray-600">
            <p className="line-clamp-2">{animal.description}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {animal.habitat.slice(0, 2).map((hab, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {hab}
                </Badge>
              ))}
              {animal.habitat.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{animal.habitat.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {!isDiscovered && (
          <div className="text-xs text-gray-400">
            <p>Descubra este animal explorando!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AnimalDetailModalProps {
  animal: AnimalData | null;
  isOpen: boolean;
  onClose: () => void;
  isDiscovered: boolean;
}

function AnimalDetailModal({ animal, isOpen, onClose, isDiscovered }: AnimalDetailModalProps) {
  if (!animal || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{animal.emoji}</span>
              <div>
                <h2 className="text-xl font-bold">
                  {isDiscovered ? animal.name : 'Animal Desconhecido'}
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
                <p className="text-sm text-gray-600">{animal.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Características</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Tamanho:</strong> {animal.size}</div>
                  <div><strong>Comportamento:</strong> {animal.behavior}</div>
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

              {animal.products && animal.products.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Produtos</h3>
                  <div className="flex flex-wrap gap-1">
                    {animal.products.map((product, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {animal.facts && animal.facts.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Curiosidades</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {animal.facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Estatísticas</h3>
                <div className="text-sm space-y-1">
                  <div>Encontros: {animal.encounterCount}</div>
                  {animal.lastSeen && (
                    <div>Último avistamento: {new Date(animal.lastSeen).toLocaleDateString()}</div>
                  )}
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
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Filtrar animais
  const filteredAnimals = useMemo(() => {
    return ANIMAL_REGISTRY.filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          animal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || animal.category === selectedCategory;
      const matchesRarity = filterRarity === 'all' || animal.rarity === filterRarity;

      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [searchTerm, selectedCategory, filterRarity]);

  // Estatísticas
  const totalAnimals = ANIMAL_REGISTRY.length;
  const discoveredCount = discoveredAnimals.length;
  const discoveryPercentage = Math.round((discoveredCount / totalAnimals) * 100);

  const handleAnimalClick = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnimal(null);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            Bestiário
          </CardTitle>
          <CardDescription>
            Registro completo da fauna descoberta
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

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar animais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {ANIMAL_CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <span className="mr-1">{category.emoji}</span>
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              <select
                value={filterRarity}
                onChange={(e) => setFilterRarity(e.target.value)}
                className="px-3 py-1 border rounded text-sm"
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

      {/* Grid de animais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAnimals.map(animal => (
          <AnimalCard
            key={animal.id}
            animal={animal}
            isDiscovered={discoveredAnimals.includes(animal.id)}
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
        isDiscovered={discoveredAnimals.includes(selectedAnimal?.id || '')}
      />
    </div>
  );
}