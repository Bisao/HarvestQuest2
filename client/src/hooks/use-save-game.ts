import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface SaveGameData {
  playerId: string;
  saveData: any;
}

export function useSaveGame() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveGameMutation = useMutation({
    mutationFn: async (data: SaveGameData) => {
      const response = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save game');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Jogo Salvo",
        description: "Seu progresso foi salvo com sucesso!",
      });
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/saves'] });
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar o jogo",
        variant: "destructive",
      });
    },
  });

  return {
    saveGame: saveGameMutation.mutate,
    isSaving: saveGameMutation.isPending,
    error: saveGameMutation.error,
  };
}