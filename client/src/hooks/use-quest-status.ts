
import { useQuery } from "@tanstack/react-query";

interface Quest {
  id: string;
  name: string;
  status: string;
  canComplete?: boolean;
}

export function useQuestStatus(playerId: string) {
  const { data: quests = [] } = useQuery<Quest[]>({
    queryKey: [`/api/player/${playerId}/quests`],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const hasCompletableQuests = quests.some(quest => 
    quest.status === 'active' && quest.canComplete === true
  );

  const completableQuestsCount = quests.filter(quest => 
    quest.status === 'active' && quest.canComplete === true
  ).length;

  return {
    hasCompletableQuests,
    completableQuestsCount,
    allQuests: quests
  };
}
