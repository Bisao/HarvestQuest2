
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
  Sparkles
} from 'lucide-react';
import { 
  ANIMAL_REGISTRY, 
  ANIMAL_CATEGORIES, 
  getAnimalsByCategory, 
  type AnimalData 
} from '@shared/data/animal-registry';

interface AnimalRegistryTabProps {
  discoveredAnimals: string[];
  playerId: string;
  onAnimalSelect?: (animal: AnimalData) => void;
}

interface AnimalDetailModalProps {
  animal: AnimalData;
  isDiscovered: boolean;
  onClose: () => void;
}

function AnimalDetailModal({ animal, isDiscovered, onClose }: AnimalDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{animal.emoji}</span>
            <div>
              <CardTitle>{isDiscovered ? animal.name : '???'}</CardTitle>
              <CardDescription className="flex items-center space-x-2">
                <Badge variant={animal.rarity === 'common' ? 'default' : 
                             animal.rarity === 'uncommon' ? 'secondary' :
                             animal.rarity === 'rare' ? 'outline' : 'destructive'}>
                  {animal.rarity}
                </Badge>
                <span>•</span>
                <span className="capitalize">{animal.size}</span>
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {/* Descrição */}
              <div>
                <h4 className="font-semibold mb-2">Descrição</h4>
                <p className="text-sm text-gray-600">
                  {isDiscovered ? animal.description : 'Você ainda não descobriu este animal...'}
                </p>
              </div>

              {isDiscovered && (
                <>
                  {/* Comportamento */}
                  <div>
                    <h4 className="font-semibold mb-2">Comportamento</h4>
                    <p className="text-sm text-gray-600">{animal.behavior}</p>
                  </div>

                  {/* Habitat */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Habitat</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {animal.habitat.map((hab) => (
                        <Badge key={hab} variant="outline" className="text-xs">
                          {hab}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Informações de Caça/Domesticação */}
                  {(animal.huntable || animal.tameable) && (
                    <div>
                      <h4 className="font-semibold mb-2">Interações</h4>
                      <div className="space-y-2">
                        {animal.huntable && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Target className="w-4 h-4 text-red-500" />
                            <span>Caçável</span>
                            {animal.requiredTool && (
                              <Badge variant="outline" className="text-xs">
                                Requer: {animal.requiredTool}
                              </Badge>
                            )}
                          </div>
                        )}
                        {animal.tameable && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span>Domesticável</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Produtos */}
                  {animal.products && animal.products.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Recursos</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.products.map((product) => (
                          <Badge key={product} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fatos Interessantes */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Fatos Interessantes</span>
                    </h4>
                    <ul className="space-y-1">
                      {animal.facts.map((fact, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{fact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Estatísticas do Jogador */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Suas Estatísticas</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Encontros:</span>
                        <span className="ml-2 font-medium">{animal.encounterCount}</span>
                      </div>
                      {animal.lastSeen && (
                        <div>
                          <span className="text-gray-600">Último avistamento:</span>
                          <span className="ml-2 font-medium">{animal.lastSeen}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function AnimalCard({ animal, isDiscovered, onClick }: { 
  animal: AnimalData; 
  isDiscovered: boolean; 
  onClick: () => void;
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isDiscovered ? 'border-green-200 bg-green-50/30' : 'border-gray-200 opacity-60'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {isDiscovered ? animal.emoji : '❓'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {isDiscovered ? animal.name : '???'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge 
                variant={isDiscovered ? 'default' : 'secondary'} 
                className="text-xs"
              >
                {animal.rarity}
              </Badge>
              <span className="capitalize">{animal.size}</span>
            </div>
            {isDiscovered && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {animal.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center">
            {isDiscovered ? (
              <Eye className="w-4 h-4 text-green-500" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-xs text-gray-500 mt-1">
              {animal.encounterCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnimalRegistryTab({ discoveredAnimals, playerId, onAnimalSelect }: AnimalRegistryTabProps) {
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  // Buscar estatísticas do jogador
  useEffect(() => {
    if (playerId) {
      fetch(`/api/animals/stats/${playerId}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Error fetching animal stats:', err));
    }
  }, [playerId, discoveredAnimals]);

  // Estatísticas
  const totalAnimals = stats?.totalAnimals || ANIMAL_REGISTRY.length;
  const discoveredCount = stats?.discoveredCount || discoveredAnimals.length;
  const discoveryPercentage = stats?.discoveryPercentage || ((discoveredCount / totalAnimals) * 100);

  // Filtros
  const filteredAnimals = useMemo(() => {
    return ANIMAL_REGISTRY.filter(animal => {
      const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           animal.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || animal.category === selectedCategory;
      const matchesRarity = filterRarity === 'all' || animal.rarity === filterRarity;
      
      return matchesSearch && matchesCategory && matchesRarity;
    });
  }, [searchTerm, selectedCategory, filterRarity]);

  const handleAnimalClick = (animal: AnimalData) => {
    setSelectedAnimal(animal);
    onAnimalSelect?.(animal);
  };

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="w-5 h-5 text-amber-600" />
            <span>Livro de Registro de Animais</span>
          </CardTitle>
          <CardDescription>
            Descubra e aprenda sobre a fauna do mundo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{discoveredCount}</div>
              <div className="text-sm text-gray-600">Descobertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalAnimals}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{discoveryPercentage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Completude</div>
            </div>
          </div>
          <Progress value={discoveryPercentage} className="mt-4" />
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar animais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas as categorias</option>
              {ANIMAL_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>

            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">Todas as raridades</option>
              <option value="common">Comum</option>
              <option value="uncommon">Incomum</option>
              <option value="rare">Raro</option>
              <option value="epic">Épico</option>
              <option value="legendary">Lendário</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de animais em categorias */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">Todos</TabsTrigger>
          {ANIMAL_CATEGORIES.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.emoji}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {filteredAnimals.map(animal => (
                <AnimalCard
                  key={animal.id}
                  animal={animal}
                  isDiscovered={discoveredAnimals.includes(animal.id)}
                  onClick={() => handleAnimalClick(animal)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {ANIMAL_CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="text-center py-4">
              <h3 className="text-lg font-semibold">{category.emoji} {category.name}</h3>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
            <ScrollArea className="h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {getAnimalsByCategory(category.id as any).map(animal => (
                  <AnimalCard
                    key={animal.id}
                    animal={animal}
                    isDiscovered={discoveredAnimals.includes(animal.id)}
                    onClick={() => handleAnimalClick(animal)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal de detalhes */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          isDiscovered={discoveredAnimals.includes(selectedAnimal.id)}
          onClose={() => setSelectedAnimal(null)}
        />
      )}
    </div>
  );
}
