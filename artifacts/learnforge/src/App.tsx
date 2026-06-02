import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";

import Dashboard from "@/pages/dashboard";
import Subjects from "@/pages/subjects";
import Quizzes from "@/pages/quizzes";
import QuizTake from "@/pages/quiz-take";
import Learn from "@/pages/learn";
import LearnSession from "@/pages/learn-session";
import Pathways from "@/pages/pathways";
import Pathway from "@/pages/pathway";
import Documents from "@/pages/documents";
import Attempt from "@/pages/attempt";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/subjects" component={Subjects} />
        <Route path="/quizzes" component={Quizzes} />
        <Route path="/quizzes/:id" component={QuizTake} />
        <Route path="/learn" component={Learn} />
        <Route path="/learn/:id" component={LearnSession} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/pathways/:id" component={Pathway} />
        <Route path="/documents" component={Documents} />
        <Route path="/attempts/:id" component={Attempt} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
