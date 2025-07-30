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
      "Floresta Temperada": "🌙 Após o sonho estranho, você desperta nesta floresta encantada da ilha misteriosa! 🏝️✨ As árvores sussurram segredos antigos enquanto você caminha entre raios de sol dourado. 🌞🌳 Pequenos seres mágicos dançam entre as folhas, deixando rastros de brilho no ar. 🧚‍♀️✨ Um riacho cristalino canta uma melodia que você reconhece do seu sonho, guiando você mais profundamente na aventura. 🎵💧 Cogumelos luminosos piscam como lanternas naturais, iluminando o caminho para tesouros escondidos! 🍄💎",
      
      "Montanhas Rochosas": "⛰️ Os picos majestosos desta ilha parecem tocar as nuvens que ainda carregam a magia do seu sonho! 🌤️✨ Cristais mágicos brilham nas rochas, pulsando com uma energia misteriosa que faz seu coração acelerar. 💎⚡ Águias douradas voam em círculos, como se estivessem protegendo segredos ancestrais. 🦅👑 Cachoeiras cantam canções antigas enquanto despencam das alturas, criando arco-íris que dançam no ar puro da montanha. 🌈💧 Cada passo revela uma nova maravilha desta terra encantada! 👣🔮",
      
      "Pântano Sombrio": "🌫️ Uma neblina mágica envolve este pântano misterioso, onde ecos do seu sonho ainda reverberam! 🌙💭 Árvores retorcidas contam histórias em sussurros, suas raízes brilhando levemente sob a água escura. 🌳✨ Libélulas iridescentes dançam como fadas, guiando você através dos caminhos seguros. 🧚‍♀️🌊 Plantas carnívoras adormecem ao seu toque gentil, revelando flores luminosas escondidas em seus coracões. 🌺🌙 O pântano guarda segredos antigos que só os corajosos podem descobrir! 🗝️🔍",
      
      "Deserto Árido": "🏜️ As dunas douradas desta ilha parecem ondas congeladas no tempo, ainda ecoando a magia do seu sonho! 🌊✨ Sob a areia, ruínas de cristal brilham como estrelas enterradas, esperando para serem descobertas. ⭐💎 Cactus mágicos florescem com flores que mudam de cor conforme a lua, criando um espetáculo noturno deslumbrante. 🌵🌙 Oásis encantados aparecem aos viajantes de coração puro, oferecendo águas que curam e energizam. 💧🌟 O vento do deserto carrega canções de civilizações perdidas! 🎵🏛️",
      
      "Tundra Gelada": "❄️ A vastidão branca desta região gelada da ilha brilha com a magia cristalina do seu sonho! 🏝️✨ Auroras boreais dançam no céu como espíritos antigos, pintando histórias coloridas na escuridão. 🌌🎨 Cristais de gelo cantam melodias quando o vento os toca, criando uma sinfonia natural encantadora. 🎵💎 Animais árticos com pelagem prateada aparecem e desaparecem como guardiões mágicos da terra. 🐺👻 Cada floco de neve carrega um pequeno feitiço de proteção! ❄️🛡️",
      
      "Costa Rochosa": "🌊 Onde o mar encontra a terra nesta ilha mágica, as ondas sussurram segredos do seu sonho! 🏝️💭 Falésias de cristal refletem cores impossíveis no pôr do sol, criando um espetáculo que hipnotiza os visitantes. 🌅💎 Gaivotas douradas voam em formações mágicas, deixando rastros de brilho no ar salgado. 🕊️✨ Poças de maré revelam mundos em miniatura onde criaturas marinhas encantadas dançam em corais luminosos. 🐠🌺 Faróis antigos piscam com luzes que guiam não apenas navios, mas também sonhadores perdidos! 🗼🌟"
    };
    
    return stories[biome.name] || "🏝️ Após despertar do sonho estranho, você se encontra nesta terra mágica e misteriosa! ✨🌙 Cada canto desta ilha encantada pulsa com energia antiga, esperando que exploradores corajosos desvelem seus segredos mais profundos. 🔮🗝️ As lendas sussurram sobre tesouros escondidos e criaturas mágicas que aguardam aqueles de coração puro e espírito aventureiro! 💎🧚‍♀️";
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