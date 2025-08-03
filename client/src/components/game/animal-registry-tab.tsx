
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
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Star, 
  Eye, 
  MapPin, 
  Calendar,
  Award,
  Filter,
  Heart,
  Info
} from 'lucide-react';
import { useGameState } from '@/hooks/use-game-state';
import type { AnimalRegistryEntry, AnimalCategory } from '@shared/types/animal-registry-types';

// Simulated data - in real app this would come from API
const MOCK_DISCOVERED_ANIMALS = ["animal-rabbit-001", "animal-smallfish-001"];
const MOCK_FAVORITE_ANIMALS = ["animal-rabbit-001"];

// Import seria do arquivo de dados real
const ANIMAL_REGISTRY: AnimalRegistryEntry[] = [
  // Dados mockados para teste - substituir pela importação real
];

const CATEGORY_LABELS: Record<AnimalCategory, string> = {
  mammal_small: "🐭 Mamíferos Pequenos",
  mammal_medium: "🦌 Mamíferos Médios", 
  mammal_large: "🐻 Mamíferos Grandes",
  bird: "🐦 Aves",
  fish_freshwater: "🐟 Peixes de Água Doce",
  fish_saltwater: "🐠 Peixes Marinhos",
  reptile: "🦎 Répteis",
  amphibian: "🐸 Anfíbios",
  insect: "🐛 Insetos",
  arthropod: "🕷️ Artrópodes",
  mythical: "🦄 Criaturas Míticas"
};

const RARITY_COLORS = {
  common: "bg-gray-100 text-gray-800",
  uncommon: "bg-green-100 text-green-800", 
  rare: "bg-blue-100 text-blue-800",
  epic: "bg-purple-100 text-purple-800",
  legendary: "bg-yellow-100 text-yellow-800"
};

export default function AnimalRegistryTab() {
  const { player } = useGameState();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<AnimalCategory | "all">("all");
  const [showOnlyDiscovered, setShowOnlyDiscovered] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalRegistryEntry | null>(null);

  const filteredAnimals = useMemo(() => {
    return ANIMAL_REGISTRY.filter(animal => {
      const matchesSearch = animal.commonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           animal.scientificName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || animal.category === selectedCategory;
      const matchesDiscovered = !showOnlyDiscovered || MOCK_DISCOVERED_ANIMALS.includes(animal.id);
      const meetsLevel = animal.requiredLevel <= (player?.level || 1);
      
      return matchesSearch && matchesCategory && matchesDiscovered && meetsLevel;
    });
  }, [searchTerm, selectedCategory, showOnlyDiscovered, player?.level]);

  const discoveryStats = useMemo(() => {
    const discovered = MOCK_DISCOVERED_ANIMALS.length;
    const total = ANIMAL_REGISTRY.filter(a => a.requiredLevel <= (player?.level || 1)).length;
    const percentage = total > 0 ? Math.round((discovered / total) * 100) : 0;
    
    return { discovered, total, percentage };
  }, [player?.level]);

  const isAnimalDiscovered = (animalId: string) => MOCK_DISCOVERED_ANIMALS.includes(animalId);
  const isAnimalFavorite = (animalId: string) => MOCK_FAVORITE_ANIMALS.includes(animalId);

  return (
    <div className="space-y-6">
      {/* Header e estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <span>Livro de Registro dos Animais</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{discoveryStats.discovered}</div>
              <div className="text-sm text-gray-600">Descobertos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{discoveryStats.total}</div>
              <div className="text-sm text-gray-600">Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{discoveryStats.percentage}%</div>
              <div className="text-sm text-gray-600">Completude</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar animais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AnimalCategory | "all")}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="discovered-only"
                checked={showOnlyDiscovered}
                onChange={(e) => setShowOnlyDiscovered(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="discovered-only" className="text-sm">
                Apenas descobertos
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de animais */}
      <ScrollArea className="h-[600px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal) => {
            const discovered = isAnimalDiscovered(animal.id);
            const favorite = isAnimalFavorite(animal.id);
            
            return (
              <Card 
                key={animal.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  discovered ? 'border-green-200 bg-green-50' : 'border-gray-200 opacity-60'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{animal.emoji}</span>
                      {favorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                    </div>
                    <Badge className={RARITY_COLORS[animal.rarity]}>
                      {animal.rarity}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-1">{animal.commonName}</h3>
                  <p className="text-sm text-gray-600 italic mb-2">{animal.scientificName}</p>
                  <p className="text-sm text-gray-500 mb-3">{CATEGORY_LABELS[animal.category]}</p>
                  
                  {discovered ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
                          <Info className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <span className="text-2xl">{animal.emoji}</span>
                            <span>{animal.commonName}</span>
                          </DialogTitle>
                        </DialogHeader>
                        <AnimalDetailView animal={animal} />
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="text-center py-2">
                      <Eye className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500">Não descoberto</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function AnimalDetailView({ animal }: { animal: AnimalRegistryEntry }) {
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">Geral</TabsTrigger>
        <TabsTrigger value="male">♂ Macho</TabsTrigger>
        <TabsTrigger value="female">♀ Fêmea</TabsTrigger>
        <TabsTrigger value="facts">Curiosidades</TabsTrigger>
      </TabsList>
      
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Nome Científico:</strong> {animal.scientificName}</div>
            <div><strong>Categoria:</strong> {CATEGORY_LABELS[animal.category]}</div>
            <div><strong>Habitat:</strong> {animal.habitat.join(", ")}</div>
            <div><strong>Dieta:</strong> {animal.generalInfo.diet}</div>
            <div><strong>Expectativa de Vida:</strong> {animal.generalInfo.lifespan}</div>
            <div><strong>Tamanho:</strong> {animal.generalInfo.size}</div>
            <div><strong>Peso:</strong> {animal.generalInfo.weight}</div>
            <div><strong>Comportamento:</strong> {animal.generalInfo.behavior.join(", ")}</div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="male" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>♂</span>
              <span>{animal.male.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Tamanho:</strong> {animal.male.physicalTraits.size}</div>
            <div><strong>Peso:</strong> {animal.male.physicalTraits.weight}</div>
            <div>
              <strong>Características Distintivas:</strong>
              <ul className="list-disc ml-5 mt-1">
                {animal.male.physicalTraits.distinctiveFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Comportamento:</strong>
              <ul className="list-disc ml-5 mt-1">
                {animal.male.behavior.map((behavior, idx) => (
                  <li key={idx}>{behavior}</li>
                ))}
              </ul>
            </div>
            {animal.male.reproductiveInfo && (
              <div><strong>Reprodução:</strong> {animal.male.reproductiveInfo}</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="female" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>♀</span>
              <span>{animal.female.name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><strong>Tamanho:</strong> {animal.female.physicalTraits.size}</div>
            <div><strong>Peso:</strong> {animal.female.physicalTraits.weight}</div>
            <div>
              <strong>Características Distintivas:</strong>
              <ul className="list-disc ml-5 mt-1">
                {animal.female.physicalTraits.distinctiveFeatures.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Comportamento:</strong>
              <ul className="list-disc ml-5 mt-1">
                {animal.female.behavior.map((behavior, idx) => (
                  <li key={idx}>{behavior}</li>
                ))}
              </ul>
            </div>
            {animal.female.reproductiveInfo && (
              <div><strong>Reprodução:</strong> {animal.female.reproductiveInfo}</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="facts" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Curiosidades</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {animal.generalInfo.funFacts.map((fact, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-amber-500 mt-1">💡</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
