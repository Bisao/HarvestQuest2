import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Game from "@/pages/game";
import MainMenu from "@/pages/main-menu";
import AuthSuccess from "@/pages/auth-success"; // Added AuthSuccess

function Router() {
  return (
    <Switch>
      <Route path="/" component={MainMenu} />
      <Route path="/game" component={Game} />
      <Route path="/auth-success" component={AuthSuccess} /> {/* Added auth-success route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;