import { Link, useLocation } from "wouter";
import { BookOpen, GraduationCap, LayoutDashboard, Library, FileText, Compass } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Subjects", href: "/subjects", icon: BookOpen },
    { name: "Quizzes", href: "/quizzes", icon: GraduationCap },
    { name: "Study Guides", href: "/learn", icon: Library },
    { name: "Pathways", href: "/pathways", icon: Compass },
    { name: "Documents", href: "/documents", icon: FileText },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex flex-col gap-2 bg-primary px-4 py-3 shadow-md sm:px-6 lg:flex-row lg:items-center lg:gap-6 lg:py-0 lg:h-16 lg:px-8">
        <div className="flex shrink-0 items-center gap-2 font-bold text-xl text-white tracking-tight">
          <GraduationCap className="h-6 w-6" />
          <span>LearnForge</span>
        </div>

        <nav aria-label="Primary" className="-mx-4 flex items-center gap-1 overflow-x-auto px-4 text-sm font-medium lg:mx-0 lg:flex-1 lg:justify-end lg:gap-2 lg:overflow-visible lg:px-0">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? location === "/"
                : location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                  isActive
                    ? 'bg-white text-primary font-semibold'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
