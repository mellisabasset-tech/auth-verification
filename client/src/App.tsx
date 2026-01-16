import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";
import GmailNotification from "./components/GmailNotification";

function Router() {
  // Compute router base: prefer Vite's BASE_URL, fall back to detecting
  // a /ggl-app prefix in the current location. This makes the app work
  // when served at the root (`/`) or behind a subpath like `/ggl-app`.
  let base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  if (base === "") base = "/";

  if (
    base === "/" &&
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/ggl-app")
  ) {
    base = "/ggl-app";
  }

  return (
    <WouterRouter base={base}>
      <Switch>
        <Route path="/" component={Login} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <GmailNotification />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
