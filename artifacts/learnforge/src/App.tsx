import { useEffect, useRef, lazy, Suspense } from "react";
import {
  ClerkProvider,
  SignIn,
  SignUp,
  Show,
  ClerkLoaded,
  useClerk,
} from "@clerk/react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import {
  Switch,
  Route,
  Redirect,
  Link,
  useLocation,
  Router as WouterRouter,
} from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import { ApiAuthBridge } from "@/components/api-auth-bridge";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";

// Eagerly loaded — on the critical path for all users
import Dashboard from "@/pages/dashboard";
import Pricing from "@/pages/pricing";
import Help from "@/pages/help";

// Lazy loaded — only fetched when the user navigates to them
const Subjects = lazy(() => import("@/pages/subjects"));
const Quizzes = lazy(() => import("@/pages/quizzes"));
const QuizTake = lazy(() => import("@/pages/quiz-take"));
const Learn = lazy(() => import("@/pages/learn"));
const LearnSession = lazy(() => import("@/pages/learn-session"));
const Interview = lazy(() => import("@/pages/interview"));
const Pathways = lazy(() => import("@/pages/pathways"));
const Pathway = lazy(() => import("@/pages/pathway"));
const Curriculum = lazy(() => import("@/pages/curriculum"));
const CurriculumDetail = lazy(() => import("@/pages/curriculum-detail"));
const Documents = lazy(() => import("@/pages/documents"));
const Attempt = lazy(() => import("@/pages/attempt"));
const Terms = lazy(() => import("@/pages/terms"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Refund = lazy(() => import("@/pages/refund"));
const Contact = lazy(() => import("@/pages/contact"));
const SchoolCodes = lazy(() => import("@/pages/school-codes"));
const OwnerVerifications = lazy(() => import("@/pages/owner-verifications"));
const OwnerStats = lazy(() => import("@/pages/owner-stats"));
const OwnerOutreach = lazy(() => import("@/pages/owner-outreach"));
const Exams = lazy(() => import("@/pages/exams"));
const Certificates = lazy(() => import("@/pages/certificates"));
const Certificate = lazy(() => import("@/pages/certificate"));
const ProgressPage = lazy(() => import("@/pages/progress"));
const Tutor = lazy(() => import("@/pages/tutor"));
const Flashcards = lazy(() => import("@/pages/flashcards"));
const Snap = lazy(() => import("@/pages/snap"));
// Games/Labs are heaviest — always lazy
const Games = lazy(() => import("@/pages/games"));
const LabPreview = lazy(() => import("@/pages/lab-preview"));
const LabPreviewPageLazy = lazy(() =>
  import("@/pages/lab-preview").then((m) => ({ default: m.LabPreviewPage }))
);
const LabDemoPage = lazy(() => import("@/pages/lab-demo"));
const LabShotPage = lazy(() => import("@/pages/lab-shot"));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // data fresh for 30s — no redundant refetches on navigation
      gcTime: 5 * 60_000,      // keep unused queries in cache for 5 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. In Vite dev (including LAN IPs
// like 192.168.x.x), use the env key — publishableKeyFromHost only works on Replit.
const isLocalDev =
  import.meta.env.DEV ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "[::1]";
const clerkPubKey = isLocalDev
  ? import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
  : publishableKeyFromHost(
      window.location.hostname,
      import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    );

// REQUIRED — copy verbatim. Empty in dev, auto-set in prod.
const clerkProxyUrl = isLocalDev
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

// Lightweight header + container for public pages that need layout (games, help)
// but are accessible without signing in.
function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex items-center justify-between px-4 py-3 shadow-lg sm:px-6 lg:px-8 lg:h-16 lg:py-0">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight"
        >
          <Logo className="h-8 w-auto text-white" />
          <span>LearnForge</span>
        </Link>
        <div className="flex items-center gap-2">
          <Show when="signed-in">
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/">Dashboard</Link>
            </Button>
          </Show>
          <Show when="signed-out">
            <Button asChild variant="ghost" className="text-white hover:bg-white/15 hover:text-white">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </Show>
        </div>
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function AppShell() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
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
          <Route path="/lab-preview">
            {() => <LabPreviewPageLazy embedded />}
          </Route>
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
      </Suspense>
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
        <ClerkLoaded>
          <ApiAuthBridge />
          <AppShell />
        </ClerkLoaded>
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
          <Suspense fallback={<PageLoader />}>
            <Switch>
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route path="/" component={RootGate} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/lab-preview" component={LabPreview} />
              <Route path="/lab-demo" component={LabDemoPage} />
              <Route path="/lab-shot" component={LabShotPage} />
              <Route path="/terms" component={Terms} />
              <Route path="/privacy" component={Privacy} />
              <Route path="/refund" component={Refund} />
              <Route path="/contact" component={Contact} />
              <Route path="/games">
                {() => <PublicPageLayout><Suspense fallback={<PageLoader />}><Games /></Suspense></PublicPageLayout>}
              </Route>
              <Route path="/help">
                {() => <PublicPageLayout><Help /></PublicPageLayout>}
              </Route>
              <Route component={ProtectedGate} />
            </Switch>
          </Suspense>
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
