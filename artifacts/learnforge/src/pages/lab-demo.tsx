import { Link } from "wouter";
import { ArrowRight, Lock, Sparkles, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { TerminalLabEngine } from "@/components/games/terminal-lab-engine";
import type { TerminalWorkspaceContent } from "@/lib/educational-games/skill-game-types";

const DEMO_LAB: TerminalWorkspaceContent = {
  title: "CompTIA A+ — Network Triage Demo",
  brief:
    "A user reports no internet access on their workstation. Follow the CompTIA A+ triage sequence: display the IP config, test gateway connectivity, test external DNS, flush the DNS cache, and request a new DHCP lease.",
  hostname: "DESK-101",
  prompt: "C:\\Windows\\System32>",
  initialOutput:
    "Ticket #4421 assigned to you.\nUser: 'I can open files on the share drive but websites won't load at all.'\nHint: start with ipconfig /all to see the current network state.",
  steps: [
    {
      instruction: "Display full IP configuration including DNS and DHCP server.",
      expectedCommand: "ipconfig /all",
      hint: "ipconfig /all",
    },
    {
      instruction: "Test connectivity to the default gateway (192.168.1.1).",
      expectedCommand: "ping 192.168.1.1",
      hint: "ping 192.168.1.1",
    },
    {
      instruction: "Test external connectivity to Google's public DNS.",
      expectedCommand: "ping 8.8.8.8",
      hint: "ping 8.8.8.8",
    },
    {
      instruction: "Resolve a hostname to verify DNS is working.",
      expectedCommand: "nslookup google.com",
      hint: "nslookup google.com",
    },
    {
      instruction: "Flush the local DNS resolver cache.",
      expectedCommand: "ipconfig /flushdns",
      hint: "ipconfig /flushdns",
    },
    {
      instruction: "Request a fresh DHCP lease to get new addressing.",
      expectedCommand: "ipconfig /renew",
      hint: "ipconfig /renew",
    },
  ],
};

const LOCKED_LABS = [
  { icon: "🌐", title: "Cisco Router Interface Config", badge: "Network+", os: "Cisco IOS" },
  { icon: "🐧", title: "Linux nginx Setup & Verify", badge: "Linux+", os: "Linux Bash" },
  { icon: "🔒", title: "Multi-Machine Network Lab", badge: "A+ / Network+", os: "3 Machines" },
  { icon: "🛡️", title: "Linux Security Audit", badge: "Security+", os: "Linux Bash" },
  { icon: "🪟", title: "Windows User Management", badge: "A+", os: "Windows CMD" },
  { icon: "📊", title: "Financial Spreadsheet Lab", badge: "Office", os: "Excel-style" },
];

export default function LabDemoPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/">
            <Logo className="h-7 w-auto cursor-pointer" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Get started free
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-b from-zinc-950 to-background border-b border-border">
          <div className="max-w-5xl mx-auto px-4 py-10 text-center space-y-4">
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Terminal className="h-3 w-3 mr-1.5" />
              Live demo — no sign-up required
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Try a real CompTIA A+ lab
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              This is a working terminal — type real commands, navigate the filesystem,
              complete each step. Every lab uses the same xterm.js engine.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-yellow-500" />
                Real xterm.js terminal
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Virtual filesystem (ls, cd, cat all work)
              </span>
              <span className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-green-400" />
                Step-by-step validation
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* The live lab */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Try it now</h2>
              <Badge variant="outline" className="text-xs">CompTIA A+</Badge>
            </div>
            <TerminalLabEngine
              gameId="demo-network-triage"
              data={DEMO_LAB}
            />
            <p className="text-xs text-muted-foreground text-center">
              Type each command and press Enter. Use the hint button if you get stuck.
              ↑ / ↓ scrolls command history. Tab completes filenames.
            </p>
          </div>

          {/* Lock wall — more labs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">148+ more labs waiting</h2>
              <Link href="/sign-up">
                <Button size="sm">
                  Unlock all labs free
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LOCKED_LABS.map((lab) => (
                <div
                  key={lab.title}
                  className="relative rounded-xl border border-border bg-card p-4 flex items-start gap-3 overflow-hidden"
                >
                  {/* Blur overlay */}
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-1.5">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                      <Link href="/sign-up">
                        <Button variant="outline" size="sm" className="text-xs h-7">
                          Unlock free
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <span className="text-2xl">{lab.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lab.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {lab.badge}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{lab.os}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
            <h3 className="text-xl font-bold">
              Get all 148 labs free for 6 months
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              Every career track, every subject simulation, every terminal and spreadsheet
              lab — free for 6 months, then $12.99/mo. Students under 18 always free.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/sign-up">
                <Button size="lg">
                  Start free — no card required
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/lab-preview">
                <Button variant="outline" size="lg">Browse all labs</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
