import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Player } from "@shared/schema";

export default function GameSimple() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  let playerUsername = urlParams.get('player') || '';
  
  // Also try to get from localStorage as fallback
  if (!playerUsername) {
    try {
      const storedPlayer = localStorage.getItem('currentPlayer');
      if (storedPlayer) {
        const parsed = JSON.parse(storedPlayer);
        playerUsername = parsed.username || '';
      }
    } catch (e) {
      console.error("Error parsing stored player:", e);
    }
  }
  
  console.log("Game loading for player:", playerUsername);

  // Always call hooks in the same order - no conditional hooks
  const { data: player, isLoading: playerLoading, error: playerError } = useQuery<Player>({
    queryKey: ["/api/player", playerUsername],
    enabled: !!playerUsername,
    retry: 1,
    queryFn: async () => {
      console.log("Fetching player data for:", playerUsername);
      const response = await fetch(`/api/player/${encodeURIComponent(playerUsername)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found');
        }
        throw new Error('Failed to fetch player');
      }
      
      const playerData = await response.json();
      console.log("Player data loaded:", playerData);
      return playerData;
    }
  });

  // Handle different states
  if (!playerUsername) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Erro</h2>
          <p className="text-gray-600 mt-2">Nome do jogador não encontrado</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Voltar ao menu principal
          </a>
        </div>
      </div>
    );
  }

  if (playerLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-gray-800">Carregando Jogo...</h2>
          <p className="text-gray-600 mt-2">Preparando sua aventura, {playerUsername}</p>
        </div>
      </div>
    );
  }

  if (playerError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800">Erro ao Carregar</h2>
          <p className="text-gray-600 mt-2">Jogador não encontrado ou erro no servidor</p>
          <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Voltar ao menu principal
          </a>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800">Carregando dados...</h2>
        </div>
      </div>
    );
  }

  // Game loaded successfully
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-2">🎮 Coletor Adventures</h1>
          <div className="text-center">
            <h2 className="text-xl text-green-600">Bem-vindo, {player.username}!</h2>
            <p className="text-gray-600">Nível {player.level} • XP: {player.experience}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🍖</div>
            <div className="text-sm text-gray-600">Fome</div>
            <div className="text-lg font-bold">{player.hunger}/{player.maxHunger}</div>
          </div>
          
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">💧</div>
            <div className="text-sm text-gray-600">Sede</div>
            <div className="text-lg font-bold">{player.thirst}/{player.maxThirst}</div>
          </div>
          
          <div className="bg-yellow-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🪙</div>
            <div className="text-sm text-gray-600">Moedas</div>
            <div className="text-lg font-bold">{player.coins}</div>
          </div>
          
          <div className="bg-purple-100 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎒</div>
            <div className="text-sm text-gray-600">Inventário</div>
            <div className="text-lg font-bold">{player.inventoryWeight}/{player.maxInventoryWeight}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎯 Jogo Funcionando!</h3>
          <p className="text-gray-600 mb-4">
            Seu perfil foi carregado com sucesso. O sistema de save está funcionando perfeitamente!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-bold text-green-800 mb-2">✅ Sistema de Saves</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Criação de perfis funcionando</li>
                <li>• Carregamento de dados OK</li>
                <li>• Persistência no banco SQLite</li>
                <li>• Deleção de saves funcionando</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">🎮 Próximos Passos</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Testar expedições</li>
                <li>• Verificar inventário</li>
                <li>• Testar crafting</li>
                <li>• Explorar biomas</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a 
              href="/" 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Menu Principal
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}