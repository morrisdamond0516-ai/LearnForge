import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  FileText,
  Compass,
  BookMarked,
  LogOut,
  HelpCircle,
  Tag,
  ShieldCheck,
  Award,
  Trophy,
  MessageCircle,
  Layers,
  Camera,
  Gamepad2,
  ChevronDown,
  MoreHorizontal,
  BarChart3,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { useClerk, useUser } from "@clerk/react";
import { WelcomeTour } from "@/components/welcome-tour";
import { OnboardingBirthdate } from "@/components/onboarding-birthdate";
import { ExitSurvey } from "@/components/exit-survey";
import { AgeVerification } from "@/components/age-verification";
import { SiteFooter } from "@/components/site-footer";
import { Logo } from "@/components/logo";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useMe } from "@/hooks/use-me";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

type NavItem = { name: string; href: string; icon: LucideIcon };
type NavGroup = { name: string; icon: LucideIcon; items: NavItem[] };

function isActivePath(location: string, href: string): boolean {
  if (href === "/") return location === "/";
  return location === href || location.startsWith(`${href}/`);
}

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const label =
    user?.primaryEmailAddress?.emailAddress ??
    user?.fullName ??
    user?.username ??
    "Account";

  return (
    <div className="flex shrink-0 items-center gap-3 border-t border-white/15 pt-2 lg:border-t-0 lg:border-l lg:border-white/15 lg:pt-0 lg:pl-4">
      <span className="max-w-[12rem] truncate text-sm text-white/80" title={label}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => signOut({ redirectUrl: basePath || "/" })}
        className="flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/15 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}

/** A top-level nav entry that reveals its sub-tabs on hover or click. */
function NavDropdown({
  group,
  location,
}: {
  group: NavGroup;
  location: string;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = group.icon;
  const groupActive = group.items.some((it) => isActivePath(location, it.href));

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => cancelClose, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onMouseEnter={() => {
            cancelClose();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
          className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
            groupActive
              ? "bg-white text-primary font-semibold"
              : "text-white/80 hover:bg-white/15 hover:text-white"
          }`}
        >
          <Icon className="h-4 w-4" />
          {group.name}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
        className="w-56"
      >
        {group.items.map((it) => {
          const active = isActivePath(location, it.href);
          const ItemIcon = it.icon;
          return (
            <DropdownMenuItem key={it.href} asChild>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex cursor-pointer items-center gap-2 ${
                  active ? "bg-primary/10 font-medium text-primary" : ""
                }`}
              >
                <ItemIcon className="h-4 w-4" />
                {it.name}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: me } = useMe();

  const groups: NavGroup[] = [
    {
      name: "Learn",
      icon: Library,
      items: [
        { name: "Subjects", href: "/subjects", icon: BookOpen },
        { name: "Study Guides", href: "/learn", icon: Library },
        { name: "AI Tutor", href: "/tutor", icon: MessageCircle },
        { name: "Curriculum", href: "/curriculum", icon: BookMarked },
        { name: "Flashcards", href: "/flashcards", icon: Layers },
        { name: "Learning Games", href: "/games", icon: Gamepad2 },
        { name: "Snap a Problem", href: "/snap", icon: Camera },
      ],
    },
    {
      name: "Practice",
      icon: GraduationCap,
      items: [
        { name: "Education/Career Test", href: "/quizzes", icon: GraduationCap },
        { name: "Certified Exams", href: "/exams", icon: Award },
        { name: "Progress", href: "/progress", icon: Trophy },
      ],
    },
    {
      name: "More",
      icon: MoreHorizontal,
      items: [
        { name: "College/Trade", href: "/pathways", icon: Compass },
        { name: "Documents", href: "/documents", icon: FileText },
        { name: "Pricing", href: "/pricing", icon: Tag },
        { name: "Help", href: "/help", icon: HelpCircle },
        ...(me?.isOwner
          ? [
              {
                name: "Verifications",
                href: "/owner/verifications",
                icon: ShieldCheck,
              },
              {
                name: "Site Stats",
                href: "/owner/stats",
                icon: BarChart3,
              },
              {
                name: "Outreach",
                href: "/owner/outreach",
                icon: Mail,
              },
            ]
          : []),
      ],
    },
  ];

  const dashboardActive = location === "/";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="app-header sticky top-0 z-40 flex flex-col gap-2 px-4 py-3 shadow-lg sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:py-0 lg:h-16 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 font-bold text-xl tracking-tight">
          <Logo className="h-8 w-auto text-white" />
          <span>
            <span className="text-white">Learn</span><span style={{ color: "hsl(38 90% 62%)" }}>Forge</span>
          </span>
        </div>

        <nav
          aria-label="Primary"
          className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 text-sm font-medium lg:mx-0 lg:flex-1 lg:justify-end lg:gap-2 lg:overflow-visible lg:px-0"
        >
          <Link
            href="/"
            aria-current={dashboardActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
              dashboardActive
                ? "bg-white text-primary font-semibold"
                : "text-white/80 hover:bg-white/15 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {groups.map((group) => (
            <NavDropdown key={group.name} group={group} location={location} />
          ))}
        </nav>

        <UserMenu />
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-end">
            <Link
              href="/documents"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <FileText className="h-4 w-4" />
              Documents
            </Link>
          </div>
          <AgeVerification />
          {children}
        </div>
      </main>
      <SiteFooter />
      {me && !me.needsBirthDate && <WelcomeTour />}
      <OnboardingBirthdate />
      <ExitSurvey />
    </div>
  );
}
