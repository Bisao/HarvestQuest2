
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useSaveGame() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (playerId: string) => {
      const response = await fetch(`/api/player/${playerId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error("Failed to save game");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Jogo Salvo",
        description: "Seu progresso foi salvo com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o jogo.",
        variant: "destructive",
      });
    },
  });
}
