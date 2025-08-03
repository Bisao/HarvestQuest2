import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface SpeedOption {
  key: 'FAST' | 'NORMAL' | 'SLOW' | 'VERY_SLOW';
  label: string;
  duration: number;
  isActive: boolean;
}

export default function TimeSpeedControl() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar opções de velocidade disponíveis
  const { data: speedOptions = [], isLoading } = useQuery({
    queryKey: ['/api/time/speed/options'],
    queryFn: async (): Promise<SpeedOption[]> => {
      const response = await fetch('/api/time/speed/options');
      if (!response.ok) throw new Error('Failed to fetch speed options');
      return response.json();
    },
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  // Mutação para alterar velocidade
  const setSpeedMutation = useMutation({
    mutationFn: async (speed: string) => {
      const response = await fetch('/api/time/speed/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speed }),
      });
      if (!response.ok) throw new Error('Failed to set time speed');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('⏰ SPEED-CONTROL: Speed changed successfully:', data);
      toast({
        title: "Velocidade do Tempo Alterada",
        description: `Agora ${data.speedInfo.label}`,
      });
      
      // Invalidar cache para atualizar tempo
      queryClient.invalidateQueries({ queryKey: ['/api/time/speed/options'] });
      queryClient.invalidateQueries({ queryKey: ['/api/time/current'] });
    },
    onError: (error) => {
      console.error('⏰ SPEED-CONTROL: Error changing speed:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar a velocidade do tempo",
        variant: "destructive",
      });
    },
  });

  const handleSpeedChange = (speed: string) => {
    console.log('⏰ SPEED-CONTROL: Changing speed to:', speed);
    setSpeedMutation.mutate(speed);
  };

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {speedOptions.map((option) => (
        <Button
          key={option.key}
          variant={option.isActive ? "default" : "outline"}
          size="sm"
          onClick={() => handleSpeedChange(option.key)}
          disabled={setSpeedMutation.isPending}
          className="justify-start text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}