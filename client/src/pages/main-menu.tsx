import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Play, Wifi, WifiOff, Users, Clock, Star, Eye, EyeOff, LogOut, Settings, UserPlus, LogIn } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  isAdmin?: boolean;
}

interface SaveGame {
  id: string;
  username: string;
  level: number;
  experience: number;
  lastPlayed: number;
  offlineExpeditionActive?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

interface PlayerCardProps {
  save: SaveGame;
  isOnline: boolean;
  onPlay: (save: SaveGame) => void;
  onDelete: (save: SaveGame) => void;
}

function PlayerCard({ save, isOnline, onPlay, onDelete }: PlayerCardProps) {
  const formatLastPlayed = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;

    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">
            {save.username}
          </CardTitle>
          <div className="flex items-center gap-2">
            {save.offlineExpeditionActive && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                <Star className="w-3 h-3 mr-1" />
                Expedição
              </Badge>
            )}
            {isOnline ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Nível {save.level}
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              {save.experience} XP
            </span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Última sessão: {formatLastPlayed(save.lastPlayed)}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => onPlay(save)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={!isOnline}
          >
            <Play className="w-4 h-4 mr-2" />
            Jogar
          </Button>

          <Button
            onClick={() => onDelete(save)}
            variant="outline"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreatePlayerFormProps {
  newPlayerName: string;
  isCreating: boolean;
  isOnline: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

function CreatePlayerForm({ newPlayerName, isCreating, isOnline, onNameChange, onSubmit }: CreatePlayerFormProps) {
  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
      <CardHeader>
        <CardTitle className="text-lg text-gray-700">Criar Novo Jogador</CardTitle>
        <CardDescription>
          Crie um novo personagem para começar sua aventura
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Nome do jogador"
            value={newPlayerName}
            onChange={(e) => onNameChange(e.target.value)}
            maxLength={20}
            className="border-2 focus:border-blue-400"
          />

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isCreating || !newPlayerName.trim() || !isOnline}
          >
            {isCreating ? "Criando..." : "Criar Jogador"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface AuthFormProps {
  isOnline: boolean;
  onAuthSuccess: (auth: AuthState) => void;
}

function AuthForm({ isOnline, onAuthSuccess }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao fazer login");
      }

      return response.json();
    },
    onSuccess: (data) => {
      const authState: AuthState = {
        isAuthenticated: true,
        user: data.user,
        token: data.token
      };
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess(authState);
      toast({
        title: "Login realizado!",
        description: `Bem-vindo de volta, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Erro ao registrar usuário");
      }

      return response.json();
    },
    onSuccess: (data) => {
      const authState: AuthState = {
        isAuthenticated: true,
        user: data.user,
        token: data.token
      };
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onAuthSuccess(authState);
      toast({
        title: "Conta criada!",
        description: `Bem-vindo, ${data.user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no registro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return;
    }
    if (loginData.username && loginData.password) {
      loginMutation.mutate(loginData);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (registerData.username && registerData.email && registerData.password) {
      registerMutation.mutate({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password
      });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            🎮 Coletor Adventures
          </CardTitle>
          <CardDescription>
            Entre ou crie sua conta para começar a aventura
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Registro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Usuário</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="Digite seu usuário"
                    value={loginData.username}
                    onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loginMutation.isPending || !isOnline}
                >
                  {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <a
                  href="/api/auth/google"
                  className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Entrar com Google
                </a>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Usuário</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Escolha um usuário"
                    value={registerData.username}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    minLength={3}
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Digite seu email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={registerMutation.isPending || !isOnline}
                >
                  {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface DeleteConfirmationDialogProps {
  playerToDelete: { id: string; username: string } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmationDialog({ playerToDelete, onConfirm, onCancel }: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog open={!!playerToDelete} onOpenChange={() => onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Jogador</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o jogador "{playerToDelete?.username}"? 
            Esta ação não pode ser desfeita e todos os dados serão perdidos permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function MainMenu() {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [playerToDelete, setPlayerToDelete] = useState<{ id: string; username: string } | null>(null);
  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem("auth_token");
    const user = localStorage.getItem("user");
    return {
      isAuthenticated: !!token,
      user: user ? JSON.parse(user) : null,
      token
    };
  });

  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
            handleLogout();
          }
        } catch {
          handleLogout();
        }
      }
    };

    if (authState.isAuthenticated) {
      verifyToken();
    }
  }, []);

  // Fetch saved games - only if authenticated
  const { data: savedGames = [], isLoading: isLoadingSaves } = useQuery({
    queryKey: ["/api/saves"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/saves", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!response.ok) {
        throw new Error("Failed to fetch saves");
      }
      return response.json();
    },
    retry: 1,
    enabled: authState.isAuthenticated
  });

  // Create player mutation
  const createPlayerMutation = useMutation({
    mutationFn: async (username: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/saves", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create player");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      setNewPlayerName("");
      setIsCreating(false);
      toast({
        title: "Sucesso!",
        description: "Jogador criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      setIsCreating(false);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete player mutation
  const deletePlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/saves/${playerId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error("Failed to delete player");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
      setPlayerToDelete(null);
      toast({
        title: "Sucesso!",
        description: "Jogador excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || !isOnline) return;

    setIsCreating(true);
    createPlayerMutation.mutate(newPlayerName.trim());
  };

  const handlePlayGame = (save: SaveGame) => {
    if (!isOnline) return;

    console.log("Loading game for player:", save.username);
    const gameUrl = `/game?player=${encodeURIComponent(save.username)}`;
    console.log("Navigating to:", gameUrl);
    setLocation(gameUrl);
  };

  const handleDeletePlayer = (save: SaveGame) => {
    setPlayerToDelete({ id: save.id, username: save.username });
  };

  const confirmDeletePlayer = () => {
    if (playerToDelete) {
      deletePlayerMutation.mutate(playerToDelete.id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setAuthState({ isAuthenticated: false, user: null, token: null });
    queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso",
    });
  };

  const handleAuthSuccess = (auth: AuthState) => {
    setAuthState(auth);
    queryClient.invalidateQueries({ queryKey: ["/api/saves"] });
  };

  // Show auth form if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          {/* Connection Status */}
          <div className="flex justify-center mb-6">
            {isOnline ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Wifi className="w-4 h-4 mr-2" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                <WifiOff className="w-4 h-4 mr-2" />
                Desconectado - Verifique sua conexão
              </Badge>
            )}
          </div>

          <AuthForm 
            isOnline={isOnline} 
            onAuthSuccess={handleAuthSuccess} 
          />
        </div>
      </div>
    );
  }

  if (isLoadingSaves) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Carregando jogadores salvos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with User Info */}
        <div className="text-center space-y-4">
          <div className="flex justify-between items-center">
            <div></div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
              🎮 Coletor Adventures
            </h1>
            <div className="flex items-center gap-4">
              {authState.user && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Users className="w-4 h-4 mr-1" />
                    {authState.user.username}
                    {authState.user.isAdmin && (
                      <Settings className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sair
                  </Button>
                </div>
              )}
            </div>
          </div>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Continue sua aventura onde parou ou crie um novo personagem para explorar 
            um mundo cheio de recursos, crafting e expedições emocionantes!
          </p>

          {/* Connection Status */}
          <div className="flex justify-center">
            {isOnline ? (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <Wifi className="w-4 h-4 mr-2" />
                Conectado
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                <WifiOff className="w-4 h-4 mr-2" />
                Desconectado - Verifique sua conexão
              </Badge>
            )}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Existing Players */}
          {savedGames.map((save: SaveGame) => (
            <PlayerCard
              key={save.id}
              save={save}
              isOnline={isOnline}
              onPlay={handlePlayGame}
              onDelete={handleDeletePlayer}
            />
          ))}

          {/* Create New Player Form */}
          <CreatePlayerForm
            newPlayerName={newPlayerName}
            isCreating={isCreating}
            isOnline={isOnline}
            onNameChange={setNewPlayerName}
            onSubmit={handleCreatePlayer}
          />
        </div>

        {/* Empty State */}
        {savedGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Nenhum jogador encontrado
            </h3>
            <p className="text-gray-500">
              Crie seu primeiro personagem para começar a aventura!
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 border-t pt-8">
          <p>
            Coletor Adventures - Versão 2.0 | 
            {savedGames.length} jogador{savedGames.length !== 1 ? 'es' : ''} salvo{savedGames.length !== 1 ? 's' : ''} | 
            Logado como: {authState.user?.username}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        playerToDelete={playerToDelete}
        onConfirm={confirmDeletePlayer}
        onCancel={() => setPlayerToDelete(null)}
      />
    </div>
  );
}