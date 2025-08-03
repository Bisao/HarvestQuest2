import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import LoadingScreen from './components/game/loading-screen';

// Lazy load páginas para melhor performance
const Game = lazy(() => import('./pages/game'));
const MainMenu = lazy(() => import('./pages/main-menu'));
const NotFound = lazy(() => import('./pages/not-found'));
const AuthSuccess = lazy(() => import('./pages/auth-success'));

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainMenu} />
      <Route path="/game" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <Router>
              <Suspense fallback={<LoadingScreen />}>
                <Route path="/" component={MainMenu} />
                <Route path="/game" component={Game} />
                <Route component={NotFound} />
              </Suspense>
            </Router>
          </div>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;