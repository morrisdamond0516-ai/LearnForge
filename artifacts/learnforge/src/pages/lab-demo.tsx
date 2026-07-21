import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Lock, Sparkles, Terminal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { SiteFooter } from "@/components/site-footer";
import { TerminalLabEngine } from "@/components/games/terminal-lab-engine";
import type { TerminalWorkspaceContent } from "@/lib/educational-games/skill-game-types";

const SCENARIOS: {
  id: string;
  label: string;
  badge: string;
  badgeColor: string;
  os: string;
  data: TerminalWorkspaceContent;
}[] = [
  {
    id: "network-triage",
    label: "CompTIA A+ — Network Triage",
    badge: "A+",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    os: "Windows CMD",
    data: {
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
          notes:
            "ipconfig /all shows every NIC's IP, subnet, gateway, DHCP server, DNS server, and lease expiry. The short 'ipconfig' only shows IP, mask, and gateway — use /all when diagnosing DHCP or DNS issues.",
        },
        {
          instruction: "Test connectivity to the default gateway (192.168.1.1).",
          expectedCommand: "ping 192.168.1.1",
          hint: "ping 192.168.1.1",
          notes:
            "Pinging the gateway tests Layer 3 connectivity within your local subnet. Success here means your NIC, cable, and switch are working. Failure points to a local config or hardware issue.",
        },
        {
          instruction: "Test external connectivity to Google's public DNS.",
          expectedCommand: "ping 8.8.8.8",
          hint: "ping 8.8.8.8",
          notes:
            "8.8.8.8 is Google's public DNS IP. Pinging it by IP (not hostname) tests WAN routing without relying on DNS. If this fails but pinging the gateway succeeds, the issue is the router or ISP — not the workstation.",
        },
        {
          instruction: "Resolve a hostname to verify DNS is working.",
          expectedCommand: "nslookup google.com",
          hint: "nslookup google.com",
          notes:
            "nslookup sends a DNS query directly to your configured DNS server. If 8.8.8.8 pings fine but nslookup fails, DNS is the culprit — check the DNS server setting in ipconfig /all.",
        },
        {
          instruction: "Flush the local DNS resolver cache.",
          expectedCommand: "ipconfig /flushdns",
          hint: "ipconfig /flushdns",
          notes:
            "Windows caches DNS responses to save round-trips. A stale entry can resolve a domain to an old/wrong IP. Flushing forces a fresh lookup on the next request. Safe to run any time.",
        },
        {
          instruction: "Request a fresh DHCP lease to get new addressing.",
          expectedCommand: "ipconfig /renew",
          hint: "ipconfig /renew",
          notes:
            "Releases and requests a new DHCP lease. Useful when the workstation has an APIPA address (169.254.x.x) or an expired lease. Run 'ipconfig /release' first if renew hangs.",
        },
      ],
    },
  },
  {
    id: "linux-nginx-repair",
    label: "Fix-It: Linux nginx Repair",
    badge: "Linux+",
    badgeColor: "bg-green-500/10 text-green-400 border-green-500/20",
    os: "Linux Bash",
    data: {
      title: "🔧 Fix-It: Linux nginx Config Repair",
      brief:
        "The web server is down — monitoring shows nginx crashed after a config push. Find the typo, fix it, restart the service, and verify it's back.",
      hostname: "web-srv-01",
      prompt: "root@web-srv-01:~#",
      initialOutput:
        "ALERT: nginx.service failed at 14:03 UTC.\nMonitoring: HTTP health check returning connection refused on :80.\nThis is a Fix-It lab — there is a deliberate bug in the config. Find and fix it.",
      commandOutputs: {
        "systemctl status nginx":
          "● nginx.service - A high performance web server\n     Loaded: loaded (/lib/systemd/system/nginx.service)\n     Active: failed (Result: exit-code) since 14:03:01 UTC\n    Process: ExecStartPre=/usr/sbin/nginx -t (code=exited, status=1/FAILURE)\nnginx: [emerg] invalid number of worker_processes \"auto auto\" in /etc/nginx/nginx.conf:5",
        "nginx -t":
          'nginx: [emerg] invalid number of worker_processes "auto auto" in /etc/nginx/nginx.conf:5\nnginx: configuration file /etc/nginx/nginx.conf test failed',
        "cat /etc/nginx/nginx.conf":
          "user www-data;\nworker_processes auto auto;\nerror_log /var/log/nginx/error.log warn;\npid /run/nginx.pid;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  sendfile on;\n  server {\n    listen 80;\n    root /var/www/html;\n    index index.html;\n  }\n}",
        "sed -i 's/auto auto/auto/' /etc/nginx/nginx.conf":
          "[sed] replacement applied: worker_processes auto auto → auto",
        "systemctl restart nginx":
          "● nginx.service started successfully (PID 3821)",
        "ss -tuln":
          "Netid  State   Recv-Q  Send-Q  Local Address:Port\ntcp    LISTEN  0       511     0.0.0.0:80    0.0.0.0:*\ntcp    LISTEN  0       511     [::]:80       [::]:*",
        "curl localhost":
          "HTTP/1.1 200 OK\nServer: nginx/1.24.0\n\n<!DOCTYPE html><html><body><h1>Welcome to nginx!</h1></body></html>",
      },
      steps: [
        {
          instruction: "Check the nginx service status to see the error.",
          expectedCommand: "systemctl status nginx",
          hint: "systemctl status nginx",
          notes:
            "When a service fails to start, 'systemctl status' shows the exact error from the last start attempt — in this case the config line that caused nginx -t to exit non-zero.",
        },
        {
          instruction: "Run the nginx config test to pinpoint the exact error.",
          expectedCommand: "nginx -t",
          hint: "nginx -t",
          notes:
            "'nginx -t' runs a dry-run config test without restarting. Always run this before restarting nginx in production — if -t fails, the restart will also fail and nginx stays down.",
        },
        {
          instruction: "Inspect the nginx.conf to find the typo.",
          expectedCommand: "cat /etc/nginx/nginx.conf",
          hint: "cat /etc/nginx/nginx.conf",
          notes:
            "Line 2: 'worker_processes auto auto;' — the value is duplicated. Valid values are a number (e.g. 4) or the keyword 'auto'. Two tokens where one is expected causes the parse error.",
        },
        {
          instruction: "Fix the duplicate 'auto' using sed.",
          expectedCommand: "sed -i 's/auto auto/auto/' /etc/nginx/nginx.conf",
          hint: "sed -i 's/auto auto/auto/' /etc/nginx/nginx.conf",
          notes:
            "sed -i edits the file in-place (-i flag). The pattern 's/old/new/' replaces the first match on each line. Always test with 'nginx -t' after any config change before restarting.",
        },
        {
          instruction: "Restart nginx to load the corrected config.",
          expectedCommand: "systemctl restart nginx",
          hint: "systemctl restart nginx",
          notes:
            "After a config fix confirmed by 'nginx -t', 'systemctl restart' performs a full stop-start cycle. On a live production server you'd prefer 'nginx -s reload' for a zero-downtime reload.",
        },
        {
          instruction: "Confirm nginx is now listening on port 80.",
          expectedCommand: "ss -tuln",
          hint: "ss -tuln",
          notes:
            "Both 0.0.0.0:80 (IPv4) and [::]:80 (IPv6) should appear. If only IPv4 shows, check if 'listen [::]:80' is in the server block. The fix is complete when both are present.",
        },
        {
          instruction: "Send a test HTTP request to confirm the server responds.",
          expectedCommand: "curl localhost",
          hint: "curl localhost",
          notes:
            "HTTP 200 + the nginx welcome page means the server is fully operational. Update the monitoring ticket, note the root cause (duplicate config token), and recommend a pre-deploy 'nginx -t' gate in CI.",
        },
      ],
    },
  },
  {
    id: "aws-ec2-recovery",
    label: "AWS CLI — EC2 Recovery",
    badge: "AWS SAA",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    os: "AWS CLI",
    data: {
      title: "AWS CLI — EC2 Recovery & Deploy",
      brief:
        "Production is down. Use the AWS CLI to verify your credentials, find the stopped EC2 instance, start it, wait for it to pass health checks, then sync the latest build to S3.",
      hostname: "cloud-ops-01",
      prompt: "ops@cloud-ops-01:~$",
      initialOutput:
        "INCIDENT: prod-web-01 not responding. On-call page fired at 09:14 UTC.\nYour task: recover the EC2 instance and re-deploy the static assets to S3.",
      commandOutputs: {
        "aws sts get-caller-identity":
          '{\n  "UserId": "AIDAIOSFODNN7EXAMPLE",\n  "Account": "123456789012",\n  "Arn": "arn:aws:iam::123456789012:user/ops-engineer"\n}',
        "aws ec2 describe-instances":
          'INSTANCE  i-0abc12345def67890  t3.medium  stopped\nNAME      prod-web-01\nAZ        us-east-1a\nSG        sg-0a1b2c3d4e5f  (prod-web-sg)',
        "aws ec2 start-instances --instance-ids i-0abc12345def67890":
          '{\n  "StartingInstances": [{\n    "InstanceId": "i-0abc12345def67890",\n    "CurrentState": {"Name": "pending"},\n    "PreviousState": {"Name": "stopped"}\n  }]\n}',
        "aws ec2 describe-instance-status --instance-ids i-0abc12345def67890":
          "INSTANCE  i-0abc12345def67890  running\nSYSTEM CHECK   ok\nINSTANCE CHECK ok\nSTATUS         ok — 2/2 checks passed",
        "aws s3 sync ./dist s3://prod-static-assets --delete":
          "upload: dist/index.html → s3://prod-static-assets/index.html\nupload: dist/bundle.js → s3://prod-static-assets/bundle.js\nupload: dist/styles.css → s3://prod-static-assets/styles.css\nCompleted 3 file(s). Deleted 0 stale file(s).",
      },
      steps: [
        {
          instruction: "Verify the active AWS credentials and account.",
          expectedCommand: "aws sts get-caller-identity",
          hint: "aws sts get-caller-identity",
          notes:
            "Always confirm your identity before taking any incident action — never assume you're in the right account. The returned ARN tells you whether you're using a role (assumed) or a user (long-lived key).",
        },
        {
          instruction: "Find the EC2 instance and its current state.",
          expectedCommand: "aws ec2 describe-instances",
          hint: "aws ec2 describe-instances",
          notes:
            "Returns all EC2 instances in the region. In real incidents you'd filter with '--filters Name=tag:Name,Values=prod-web-01' to target one instance. Note the Instance ID — you'll need it for the next commands.",
        },
        {
          instruction: "Start the stopped instance.",
          expectedCommand:
            "aws ec2 start-instances --instance-ids i-0abc12345def67890",
          hint: "aws ec2 start-instances --instance-ids i-0abc12345def67890",
          notes:
            "start-instances is idempotent — running it on an already-running instance returns an error, it doesn't restart it. The instance transitions through 'pending' before reaching 'running'.",
        },
        {
          instruction:
            "Wait for both EC2 status checks to pass (2/2).",
          expectedCommand:
            "aws ec2 describe-instance-status --instance-ids i-0abc12345def67890",
          hint: "aws ec2 describe-instance-status --instance-ids i-0abc12345def67890",
          notes:
            "EC2 runs two checks: System Status (AWS infrastructure health) and Instance Status (OS-level reachability). Both must be 'ok' before the app is ready. In automation, use 'aws ec2 wait instance-status-ok'.",
        },
        {
          instruction:
            "Sync the latest build artifacts to the S3 static-assets bucket.",
          expectedCommand: "aws s3 sync ./dist s3://prod-static-assets --delete",
          hint: "aws s3 sync ./dist s3://prod-static-assets --delete",
          notes:
            "--delete removes files from S3 that no longer exist in the local ./dist directory, preventing stale assets from being served. Without it, old files accumulate. Always run a dry-run with '--dryrun' first on production buckets.",
        },
      ],
    },
  },
];

const LOCKED_LABS = [
  { icon: "🌐", title: "Cisco Router Interface Config", badge: "Network+", os: "Cisco IOS" },
  { icon: "🪟", title: "Windows User Management", badge: "A+", os: "Windows CMD" },
  { icon: "🔒", title: "Multi-Machine Network Lab", badge: "A+ / Network+", os: "3 Machines" },
  { icon: "🛡️", title: "Linux Security Audit", badge: "Security+", os: "Linux Bash" },
  { icon: "☁️", title: "AWS IAM Security Audit", badge: "Cloud+", os: "AWS CLI" },
  { icon: "📊", title: "HVAC Diagnostic CLI", badge: "HVAC", os: "BMS Terminal" },
];

export default function LabDemoPage() {
  const [activeId, setActiveId] = useState(SCENARIOS[0].id);
  const active = SCENARIOS.find((s) => s.id === activeId)!;

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
              Live demos — no sign-up required
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold">
              Try 3 real labs — free, right now
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real xterm.js terminal. Type actual commands, navigate a virtual
              filesystem, complete each step. Every lab in LearnForge runs this
              same engine.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-yellow-500" />
                Real xterm.js terminal
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Virtual filesystem (ls, cd, cat)
              </span>
              <span className="flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-green-400" />
                Step validation + learning notes
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
          {/* Scenario tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveId(s.id)}
                  className={[
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
                    activeId === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30",
                  ].join(" ")}
                >
                  <span>{s.label}</span>
                  <Badge
                    variant="outline"
                    className={[
                      "text-[10px] px-1.5 py-0 border",
                      activeId === s.id
                        ? "border-primary-foreground/30 text-primary-foreground/80"
                        : s.badgeColor,
                    ].join(" ")}
                  >
                    {s.badge}
                  </Badge>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              <span>{active.os}</span>
              <span className="text-border">·</span>
              <span>Type commands below — hints and learning notes unlock as you go</span>
            </div>

            <TerminalLabEngine
              key={active.id}
              gameId={`demo-${active.id}`}
              data={active.data}
            />
            <p className="text-xs text-muted-foreground text-center">
              ↑ / ↓ scrolls command history · Tab completes commands · Hint button after a wrong try · 💡 notes appear after each step
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
              Every career track, every subject simulation, every terminal and
              spreadsheet lab — free for 6 months, then $12.99/mo. Students
              under 18 always free.
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
