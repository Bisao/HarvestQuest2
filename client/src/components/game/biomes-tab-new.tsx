import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ExpeditionModal from "./expedition-modal";
import type { Biome, Resource, Equipment, Player, Expedition } from "@shared/types";

interface BiomesTabProps {
  biomes: Biome[];
  resources: Resource[];
  equipment: Equipment[];
  player: Player;
  onExpeditionStart: (expeditionData: any) => void;
}

export default function BiomesTab({ 
  biomes, 
  resources, 
  equipment, 
  player, 
  onExpeditionStart
}: BiomesTabProps) {
  const [selectedBiome, setSelectedBiome] = useState<Biome | null>(null);
  const [expeditionModalOpen, setExpeditionModalOpen] = useState(false);

  // Fetch active expedition
  const { data: activeExpedition } = useQuery<Expedition | null>({
    queryKey: [`/api/player/${player.id}/active-expedition`],
    refetchInterval: 1000, // Refetch every second to update progress
  });

  const getResourcesForBiome = (biome: Biome) => {
    const resourceIds = biome.availableResources as string[];
    return resourceIds.map(id => resources.find(r => r.id === id)).filter(Boolean) as Resource[];
  };

  const getBiomeStory = (biome: Biome) => {
    const stories: { [key: string]: string } = {
      "Floresta Temperada": "Esta antiga floresta sussurra segredos de séculos passados. Entre suas árvores majestosas, raios de sol dourado filtram através das copas verdes, criando um mosaico de luz e sombra no chão coberto de folhas. O ar é fresco e úmido, carregado com o aroma de terra rica e madeira. Pequenos riachos serpenteiam entre as raízes, onde animais selvagens vêm beber água cristalina. Cogumelos coloridos brotam em troncos caídos, enquanto o canto dos pássaros ecoa suavemente pela vegetação densa.",
      
      "Montanhas Rochosas": "Picos imponentes se erguem em direção às nuvens, suas faces de pedra esculpidas pelos ventos e pelo tempo. O ar aqui é rarefeito e puro, com uma frieza que desperta os sentidos. Cachoeiras despencam de grandes alturas, criando uma sinfonia natural que ressoa pelos vales. Entre as rochas, cristais raros capturam a luz do sol, brilhando como estrelas terrestres. Águias planam majestosamente sobre os penhascos, enquanto cabras montesas navegam com agilidade pelos terrenos escarpados.",
      
      "Pântano Sombrio": "Neblina densa paira sobre águas escuras e misteriosas, onde árvores retorcidas emergem como guardiões ancestrais. O ambiente é úmido e misterioso, com sons estranhos ecoando na distância. Plantas carnívoras se escondem entre a vegetação aquática, enquanto sapos e insetos criam uma orquestra noturna constante. Lendas falam de tesouros perdidos nas profundezas lamacentas e de criaturas antigas que habitam os recantos mais sombrios deste reino aquático.",
      
      "Deserto Árido": "Sob o sol escaldante, dunas douradas se estendem até o horizonte, mudando constantemente com os ventos quentes. O silêncio é profundo, quebrado apenas pelo sussurro da areia em movimento. Oásis raros aparecem como miragens verdadeiras, cercados por palmeiras que oferecem sombra preciosa. Animais adaptados emergem durante a noite fresca, quando as estrelas brilham com intensidade incomparável no céu límpido. Antigas ruínas meio enterradas contam histórias de civilizações perdidas.",
      
      "Tundra Gelada": "Uma vastidão branca se estende infinitamente, onde o vento gelado sopra através da paisagem congelada. O ar é tão puro que cada respiração queima os pulmões com frieza cristalina. Auroras boreais dançam no céu noturno, pintando a escuridão com cores místicas. Animais peludos deixam pegadas na neve fresca, seguindo rotas ancestrais de sobrevivência. O gelo craque e geme, criando uma música natural única deste mundo congelado.",
      
      "Costa Rochosa": "Onde a terra encontra o mar, falésias dramáticas resistem ao abraço eterno das ondas. O ar salgado carrega o perfume do oceano, misturado com o aroma de algas marinhas. Gaivotas gritam enquanto mergulham em busca de peixes, e o som rítmico das ondas cria uma melodia hipnotizante. Poças de maré revelam pequenos mundos aquáticos cheios de vida colorida. Faróis antigos se erguem como sentinelas, guiando navegadores através das águas traiçoeiras."
    };
    
    return stories[biome.name] || "Um lugar misterioso e inexplorado, cheio de segredos esperando para serem descobertos. As lendas falam de grandes aventuras que aguardam os corajosos que se atrevem a explorar estes territórios desconhecidos.";
  };

  const getToolIcons = (resource: Resource) => {
    const icons: string[] = [];
    
    switch (resource.name) {
      case "Fibra":
        icons.push("🤚");
        break;
      case "Pedra":
      case "Ferro Fundido":
      case "Cristais":
        icons.push("⛏️");
        break;
      case "Pedras Soltas":
      case "Gravetos":
      case "Cogumelos":
      case "Frutas Silvestres":
      case "Conchas":
      case "Argila":
        icons.push("🤚");
        break;
      case "Madeira":
      case "Bambu":
        icons.push("🪓");
        break;
      case "Água Fresca":
        icons.push("🪣");
        break;
      case "Coelho":
        icons.push("🏹", "🔪");
        break;
      case "Veado":
      case "Javali":
        icons.push("🏹", "🔱", "🔪");
        break;
      case "Peixe Pequeno":
      case "Peixe Grande":
      case "Salmão":
        icons.push("🎣", "🪱");
        break;
      case "Areia":
        icons.push("🗿");
        break;
      default:
        icons.push("🤚");
        break;
    }
    
    return icons;
  };

  const isUnlocked = (biome: Biome) => player.level >= biome.requiredLevel;

  const handleExploreBiome = (biome: Biome) => {
    if (!isUnlocked(biome) || (activeExpedition && activeExpedition.progress < 100)) return;
    
    // If there's a completed expedition for this biome, complete it
    if (activeExpedition && activeExpedition.biomeId === biome.id && activeExpedition.progress >= 100) {
      handleCompleteExpedition(activeExpedition.id);
      return;
    }
    
    setSelectedBiome(biome);
    setExpeditionModalOpen(true);
  };

  const handleCompleteExpedition = async (expeditionId: string) => {
    try {
      const response = await fetch(`/api/expeditions/${expeditionId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to complete expedition');
      }
      // Refresh data after completion
      location.reload(); // Simple refresh for now
    } catch (error) {
      console.error('Error completing expedition:', error);
    }
  };

  const getButtonText = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) {
      return `Desbloqueado no Nível ${biome.requiredLevel}`;
    }
    
    if (activeExpedition) {
      if (activeExpedition.biomeId === biome.id) {
        return activeExpedition.progress >= 100 ? "Finalizar Expedição" : "Em Andamento...";
      }
      return "Expedição Ativa";
    }
    
    return "Explorar";
  };

  const getButtonVariant = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) return "secondary";
    
    if (activeExpedition) {
      if (activeExpedition.biomeId === biome.id && activeExpedition.progress >= 100) {
        return "default"; // Green for completion
      }
      return "secondary"; // Disabled state
    }
    
    return "default";
  };

  const isButtonDisabled = (biome: Biome, unlocked: boolean) => {
    if (!unlocked) return true;
    
    // If there's an active expedition and it's not for this biome, disable
    if (activeExpedition && activeExpedition.biomeId !== biome.id) return true;
    
    // If there's an active expedition for this biome but not completed, disable
    if (activeExpedition && activeExpedition.biomeId === biome.id && activeExpedition.progress < 100) return true;
    
    return false;
  };

  const handleExpeditionStart = (expeditionData: any) => {
    setExpeditionModalOpen(false);
    setSelectedBiome(null);
    onExpeditionStart(expeditionData);
  };

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {biomes.map((biome) => {
            const biomeResources = getResourcesForBiome(biome);
            const unlocked = isUnlocked(biome);
            
            return (
              <Card 
                key={biome.id} 
                className={`transition-all ${unlocked ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} min-h-[280px] md:min-h-[300px]`}
              >
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">{biome.emoji}</span>
                      <CardTitle className="text-lg md:text-xl">{biome.name}</CardTitle>
                    </div>
                    <Badge variant={unlocked ? "default" : "secondary"} className="text-xs">
                      Nível {biome.requiredLevel}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs md:text-sm">
                    Explore este bioma para coletar recursos únicos
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  {/* Progress bar for locked biomes */}
                  {!unlocked && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Progresso para desbloqueio</span>
                        <span className="text-gray-600">{player.level}/{biome.requiredLevel}</span>
                      </div>
                      <Progress 
                        value={(player.level / biome.requiredLevel) * 100} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* Biome Story */}
                  <div className="bg-amber-50 p-2 md:p-3 rounded-lg">
                    <h4 className="font-medium text-xs md:text-sm mb-2 md:mb-3 text-amber-800">História do Local:</h4>
                    <div className="max-h-32 md:max-h-40 overflow-y-auto pr-1">
                      <p className="text-xs md:text-sm text-amber-700 leading-relaxed">
                        {getBiomeStory(biome)}
                      </p>
                    </div>
                  </div>

                  

                  {/* Explore button */}
                  <div className="pt-1 md:pt-2">
                    <Button 
                      onClick={() => handleExploreBiome(biome)}
                      disabled={isButtonDisabled(biome, unlocked)}
                      className="w-full h-10 md:h-12 text-sm md:text-base font-medium"
                      variant={getButtonVariant(biome, unlocked)}
                    >
                      {getButtonText(biome, unlocked)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Expedition Modal */}
      <ExpeditionModal
        isOpen={expeditionModalOpen}
        onClose={() => {
          setExpeditionModalOpen(false);
          setSelectedBiome(null);
        }}
        biome={selectedBiome}
        resources={resources}
        equipment={equipment}
        player={player}
        onExpeditionStart={handleExpeditionStart}
      />
    </>
  );
}