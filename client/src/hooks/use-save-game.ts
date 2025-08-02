import { useMutation } from "@tanstack/react-query";
import type { Player } from "@shared/types";
import { getAuthHeaders } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useSaveGame() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (player: Player) => {
      const response = await fetch(`/api/player/${player.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(player),
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