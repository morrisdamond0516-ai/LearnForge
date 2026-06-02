import { Link, useLocation } from "wouter";
import { BookOpen, GraduationCap, LayoutDashboard, Library, FileText, Compass, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 bg-primary px-4 shadow-md sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between gap-x-4 lg:gap-x-6">
          <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <GraduationCap className="h-6 w-6" />
            <span>LearnForge</span>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`transition-colors ${
                    location === item.href
                      ? 'text-white font-semibold underline underline-offset-4 decoration-white/60'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-primary/20 bg-primary/95 p-4">
          <nav className="flex flex-col gap-1 text-sm font-medium">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
                  location === item.href
                    ? 'bg-white/20 text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
