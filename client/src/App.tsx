import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import MainMenu from "@/pages/main-menu";
import Game from "@/pages/game";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Switch>
          <Route path="/game" component={Game} />
          <Route path="/" component={MainMenu} />
          <Route>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Página não encontrada</h1>
                <p className="text-gray-600 mt-2">A página que você procura não existe.</p>
                <a href="/" className="text-blue-600 hover:underline mt-4 inline-block">
                  Voltar ao menu principal
                </a>
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;