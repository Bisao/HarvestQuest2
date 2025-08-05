import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Brain, Clock, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StrategyRecommendation {
  category: 'immediate' | 'short_term' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reasoning: string;
  actionSteps: string[];
  expectedBenefits: string[];
  requiredResources?: string[];
  estimatedTimeMinutes?: number;
}

interface GameStateAnalysis {
  playerLevel: number;
  survivalStatus: 'critical' | 'low' | 'moderate' | 'good' | 'excellent';
  resourceStatus: 'scarce' | 'limited' | 'adequate' | 'abundant';
  skillDevelopment: 'beginner' | 'developing' | 'intermediate' | 'advanced';
  currentFocus: string[];
  recommendations: StrategyRecommendation[];
}

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
}

export default function AIAssistant({ isOpen, onClose, playerId }: AIAssistantProps) {
  const { toast } = useToast();
  const [selectedRecommendation, setSelectedRecommendation] = useState<StrategyRecommendation | null>(null);

  const { data: analysis, isLoading, refetch } = useQuery<GameStateAnalysis>({
    queryKey: ['/api/ai/recommendations', playerId],
    enabled: isOpen && !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.message?.includes('OpenAI API key not configured')) {
        toast({
          title: "Configuração Necessária",
          description: "Chave da API OpenAI não configurada. Usando recomendações básicas.",
          variant: "default"
        });
        return false;
      }
      return failureCount < 2;
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'immediate': return <AlertTriangle className="h-4 w-4" />;
      case 'short_term': return <Clock className="h-4 w-4" />;
      case 'long_term': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'low': return 'text-orange-600 dark:text-orange-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      case 'good': return 'text-green-600 dark:text-green-400';
      case 'excellent': return 'text-emerald-600 dark:text-emerald-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Assistente de Estratégia IA
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Analisando seu progresso...</span>
            </div>
          ) : analysis ? (
            <div className="space-y-6">
              {/* Status Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Nível</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.playerLevel}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Sobrevivência</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-semibold capitalize ${getStatusColor(analysis.survivalStatus)}`}>
                      {analysis.survivalStatus === 'good' ? 'Boa' :
                       analysis.survivalStatus === 'moderate' ? 'Moderada' :
                       analysis.survivalStatus === 'low' ? 'Baixa' : 
                       analysis.survivalStatus === 'critical' ? 'Crítica' : 'Excelente'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recursos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-semibold capitalize ${getStatusColor(analysis.resourceStatus)}`}>
                      {analysis.resourceStatus === 'adequate' ? 'Adequados' :
                       analysis.resourceStatus === 'limited' ? 'Limitados' :
                       analysis.resourceStatus === 'scarce' ? 'Escassos' : 'Abundantes'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Desenvolvimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-lg font-semibold capitalize ${getStatusColor(analysis.skillDevelopment)}`}>
                      {analysis.skillDevelopment === 'beginner' ? 'Iniciante' :
                       analysis.skillDevelopment === 'developing' ? 'Desenvolvendo' :
                       analysis.skillDevelopment === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Focus Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Foco Atual</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {analysis.currentFocus.map((focus, index) => (
                    <Badge key={index} variant="secondary">
                      {focus}
                    </Badge>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recomendações Estratégicas</h3>
                
                {analysis.recommendations.map((recommendation, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedRecommendation(recommendation)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          {getCategoryIcon(recommendation.category)}
                          {recommendation.title}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority === 'high' ? 'Alta' :
                             recommendation.priority === 'medium' ? 'Média' : 'Baixa'}
                          </Badge>
                          {recommendation.estimatedTimeMinutes && (
                            <Badge variant="outline">
                              {recommendation.estimatedTimeMinutes}min
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription>{recommendation.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Erro ao carregar recomendações</p>
              <Button onClick={() => refetch()} className="mt-2">
                Tentar Novamente
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Detailed Recommendation Modal */}
        {selectedRecommendation && (
          <Dialog open={!!selectedRecommendation} onOpenChange={() => setSelectedRecommendation(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedRecommendation.category)}
                  {selectedRecommendation.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Por que isso é importante:</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedRecommendation.reasoning}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Passos de Ação:
                  </h4>
                  <ul className="space-y-1">
                    {selectedRecommendation.actionSteps.map((step, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 font-semibold">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-semibold mb-2">Benefícios Esperados:</h4>
                  <ul className="space-y-1">
                    {selectedRecommendation.expectedBenefits.map((benefit, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <span className="text-green-600 font-semibold">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedRecommendation.requiredResources && selectedRecommendation.requiredResources.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Recursos Necessários:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecommendation.requiredResources.map((resource, index) => (
                          <Badge key={index} variant="outline">{resource}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex justify-between items-center pt-4">
          <Button variant="outline" onClick={() => refetch()}>
            <Brain className="h-4 w-4 mr-2" />
            Atualizar Análise
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}