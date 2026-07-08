import { useEffect, useRef } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  useClerk,
} from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";

import Dashboard from "@/pages/dashboard";
import Subjects from "@/pages/subjects";
import Quizzes from "@/pages/quizzes";
import QuizTake from "@/pages/quiz-take";
import Learn from "@/pages/learn";
import LearnSession from "@/pages/learn-session";
import Interview from "@/pages/interview";
import Help from "@/pages/help";
import Pathways from "@/pages/pathways";
import Pathway from "@/pages/pathway";
import Curriculum from "@/pages/curriculum";
import CurriculumDetail from "@/pages/curriculum-detail";
import Documents from "@/pages/documents";
import Attempt from "@/pages/attempt";
import Pricing from "@/pages/pricing";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import Refund from "@/pages/refund";
import Contact from "@/pages/contact";
import SchoolCodes from "@/pages/school-codes";
import OwnerVerifications from "@/pages/owner-verifications";
import OwnerStats from "@/pages/owner-stats";
import OwnerOutreach from "@/pages/owner-outreach";
import Exams from "@/pages/exams";
import Certificates from "@/pages/certificates";
import Certificate from "@/pages/certificate";
import ProgressPage from "@/pages/progress";
import Tutor from "@/pages/tutor";
import Flashcards from "@/pages/flashcards";
import Snap from "@/pages/snap";
import Games from "@/pages/games";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 0,
      refetchOnWindowFocus: false,
    },
  },
});

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. On localhost, use the env key
// directly — publishableKeyFromHost maps to clerk.localhost, which only works on Replit.
const isLocalHost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";
const clerkPubKey = isLocalHost
  ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  : publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    );

// REQUIRED — copy verbatim. Empty in dev, auto-set in prod.
const clerkProxyUrl = isLocalHost
  ? undefined
  : import.meta.env.VITE_CLERK_PROXY_URL || undefined;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(224 85% 52%)",
    colorForeground: "hsl(222 20% 12%)",
    colorMutedForeground: "hsl(220 12% 46%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(222 20% 12%)",
    colorNeutral: "hsl(220 14% 88%)",
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl border border-[hsl(220_14%_91%)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[hsl(222_20%_12%)] text-xl font-bold",
    headerSubtitle: "text-[hsl(220_12%_46%)]",
    socialButtonsBlockButtonText: "text-[hsl(222_20%_12%)] font-medium",
    formFieldLabel: "text-[hsl(222_20%_22%)] font-medium",
    footerActionLink: "text-[hsl(224_85%_52%)] font-semibold hover:text-[hsl(224_85%_42%)]",
    footerActionText: "text-[hsl(220_12%_46%)]",
    dividerText: "text-[hsl(220_12%_46%)]",
    identityPreviewEditButton: "text-[hsl(224_85%_52%)]",
    formFieldSuccessText: "text-[hsl(160_80%_30%)]",
    alertText: "text-[hsl(222_20%_12%)]",
    logoBox: "h-10",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-[hsl(220_14%_88%)] hover:bg-[hsl(220_16%_96%)]",
    formButtonPrimary: "bg-[hsl(224_85%_52%)] hover:bg-[hsl(224_85%_42%)] text-white font-semibold",
    formFieldInput: "border border-[hsl(220_14%_88%)] bg-white text-[hsl(222_20%_12%)]",
    footerAction: "text-[hsl(220_12%_46%)]",
    dividerLine: "bg-[hsl(220_14%_88%)]",
    otpCodeFieldInput: "border border-[hsl(220_14%_88%)] text-[hsl(222_20%_12%)]",
    main: "gap-4",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={basePath || "/"}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={basePath || "/"}
      />
    </div>
  );
}

function AppShell() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/subjects" component={Subjects} />
        <Route path="/quizzes" component={Quizzes} />
        <Route path="/quizzes/:id" component={QuizTake} />
        <Route path="/learn" component={Learn} />
        <Route path="/learn/interview" component={Interview} />
        <Route path="/learn/:id" component={LearnSession} />
        <Route path="/pathways" component={Pathways} />
        <Route path="/pathways/:id" component={Pathway} />
        <Route path="/curriculum" component={Curriculum} />
        <Route path="/curriculum/:id" component={CurriculumDetail} />
        <Route path="/exams" component={Exams} />
        <Route path="/certificates" component={Certificates} />
        <Route path="/certificates/:id" component={Certificate} />
        <Route path="/progress" component={ProgressPage} />
        <Route path="/tutor" component={Tutor} />
        <Route path="/flashcards" component={Flashcards} />
        <Route path="/games" component={Games} />
        <Route path="/snap" component={Snap} />
        <Route path="/documents" component={Documents} />
        <Route path="/help" component={Help} />
        <Route path="/school-codes" component={SchoolCodes} />
        <Route path="/owner/verifications" component={OwnerVerifications} />
        <Route path="/owner/stats" component={OwnerStats} />
        <Route path="/owner/outreach" component={OwnerOutreach} />
        <Route path="/attempts/:id" component={Attempt} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

// Base path: signed-in users land in the app, signed-out users see the landing page.
function RootGate() {
  return (
    <>
      <Show when="signed-in">
        <AppShell />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

// All non-auth, non-root routes: protected — signed-out users go to the landing page.
function ProtectedGate() {
  return (
    <>
      <Show when="signed-in">
        <AppShell />
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to continue learning",
          },
        },
        signUp: {
          start: {
            title: "Create your account",
            subtitle: "Start learning with LearnForge",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <AnalyticsTracker />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/" component={RootGate} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/terms" component={Terms} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/refund" component={Refund} />
            <Route path="/contact" component={Contact} />
            <Route component={ProtectedGate} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
