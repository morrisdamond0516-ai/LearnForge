import { useCallback, useEffect, useRef, useState } from "react";
import { saveLabAttempt, getBestLabAttempt } from "@/lib/lab-history";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Flame,
  HelpCircle,
  Laptop,
  Monitor,
  Network,
  RotateCcw,
  Server,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import { useLabModuleFlow } from "@/components/games/lab-module-flow-context";
import type {
  TerminalMachine,
  TerminalWorkspaceContent,
} from "@/lib/educational-games/skill-game-types";

// ─── OS detection ──────────────────────────────────────────────────────────────
type OS = "windows" | "linux" | "cisco" | "powershell" | "domain";

function detectOS(prompt: string): OS {
  const p = prompt.toLowerCase();
  if (p.startsWith("ps ") || p.includes("powershell")) return "powershell";
  if (
    p.includes("router") ||
    p.includes("switch") ||
    p.includes("firewall") ||
    (p.endsWith("#") && !p.includes("$") && !p.includes(":"))
  )
    return "cisco";
  if (p.includes("$") || p.includes("~") || p.startsWith("/")) {
    // Domain CLI: custom user@host prompt (bms@, pharma@, billing@, etc.) — not a student shell
    const atIdx = p.indexOf("@");
    if (atIdx > 0 && p.slice(0, atIdx) !== "student") return "domain";
    return "linux";
  }
  return "windows";
}

// ─── Virtual Filesystem ────────────────────────────────────────────────────────
type FSFile = { type: "file"; content: string };
type FSDir = { type: "dir"; children: Record<string, FSNode> };
type FSNode = FSFile | FSDir;
type VirtualFS = { root: FSDir; cwd: string };

function extractInitialCwd(prompt: string, os: OS): string {
  if (os === "linux") {
    const m = /:([^$#]+)[$#]/.exec(prompt);
    if (m) {
      const raw = m[1]!.trim();
      return raw === "~" ? "/home/student" : raw.replace(/^~/, "/home/student");
    }
    return "/home/student";
  }
  if (os === "windows" || os === "powershell") {
    const m = /([A-Z]:\\[^>]*)>/i.exec(prompt);
    return m ? m[1]!.trim() : "C:\\Users\\Admin";
  }
  return "";
}

function buildDefaultFS(os: OS, hostname: string, cwd: string): VirtualFS {
  if (os === "linux") {
    const root: FSDir = {
      type: "dir",
      children: {
        home: {
          type: "dir",
          children: {
            student: {
              type: "dir",
              children: {
                Desktop: { type: "dir", children: {} },
                Documents: { type: "dir", children: {} },
                Downloads: { type: "dir", children: {} },
                projects: {
                  type: "dir",
                  children: {
                    "README.md": {
                      type: "file",
                      content: "# Project\nSee docs for setup.",
                    },
                    "app.py": {
                      type: "file",
                      content: "#!/usr/bin/env python3\nprint('Hello World')",
                    },
                  },
                },
                "config.txt": {
                  type: "file",
                  content:
                    "# Network Config\nINTERFACE=eth0\nIP=192.168.1.105\nGATEWAY=192.168.1.1\nDNS=8.8.8.8\n",
                },
                "setup.sh": {
                  type: "file",
                  content: "#!/bin/bash\necho 'Starting setup...'\napt-get update -y\n",
                },
                "error.log": {
                  type: "file",
                  content: `Jul 21 08:00:01 ${hostname} systemd[1]: Started nginx.service.\nJul 21 08:02:15 ${hostname} nginx[1235]: [error] bind() to 0.0.0.0:80 failed (98: Address already in use)\nJul 21 08:05:12 ${hostname} systemd[1]: nginx.service: Main process exited, code=exited, status=1`,
                },
              },
            },
          },
        },
        etc: {
          type: "dir",
          children: {
            passwd: {
              type: "file",
              content:
                "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Student,,,:/home/student:/bin/bash",
            },
            hosts: {
              type: "file",
              content: `127.0.0.1   localhost\n127.0.1.1   ${hostname}\n192.168.1.1 gateway.corp.local\n192.168.1.10 server01.corp.local\n192.168.1.20 web-srv-01.corp.local`,
            },
            "resolv.conf": {
              type: "file",
              content:
                "nameserver 192.168.1.1\nnameserver 8.8.8.8\nsearch corp.local",
            },
            nginx: {
              type: "dir",
              children: {
                "nginx.conf": {
                  type: "file",
                  content:
                    "worker_processes 1;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/sites-enabled/*;\n  server {\n    listen 80;\n    server_name localhost;\n    root /var/www/html;\n  }\n}",
                },
                "sites-enabled": {
                  type: "dir",
                  children: {
                    default: {
                      type: "file",
                      content:
                        "server {\n    listen 80 default_server;\n    root /var/www/html;\n    index index.html;\n}",
                    },
                  },
                },
              },
            },
            ssh: {
              type: "dir",
              children: {
                sshd_config: {
                  type: "file",
                  content:
                    "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\nX11Forwarding yes\n",
                },
              },
            },
          },
        },
        var: {
          type: "dir",
          children: {
            log: {
              type: "dir",
              children: {
                syslog: {
                  type: "file",
                  content: `Jul 21 08:00:00 ${hostname} systemd[1]: Started session.\nJul 21 08:00:01 ${hostname} sshd[1000]: Server listening on 0.0.0.0 port 22.`,
                },
                auth: {
                  type: "file",
                  content: `Jul 21 08:30:00 ${hostname} sudo: student : TTY=pts/0 ; COMMAND=/bin/systemctl restart nginx`,
                },
                nginx: {
                  type: "dir",
                  children: {
                    "access.log": {
                      type: "file",
                      content: `192.168.1.105 - - [21/Jul/2026] "GET / HTTP/1.1" 200 612\n192.168.1.110 - - [21/Jul/2026] "GET /api/health HTTP/1.1" 200 2`,
                    },
                    "error.log": {
                      type: "file",
                      content:
                        "2026/07/21 08:02:15 [error] 1235#1235: *1 open() \"/var/www/html/favicon.ico\" failed (2: No such file)",
                    },
                  },
                },
              },
            },
            www: {
              type: "dir",
              children: {
                html: {
                  type: "dir",
                  children: {
                    "index.html": {
                      type: "file",
                      content:
                        "<!DOCTYPE html>\n<html><body><h1>It works!</h1></body></html>",
                    },
                  },
                },
              },
            },
          },
        },
        tmp: { type: "dir", children: {} },
      },
    };
    return { root, cwd };
  }

  // Windows / PowerShell
  const root: FSDir = {
    type: "dir",
    children: {
      "C:": {
        type: "dir",
        children: {
          Windows: {
            type: "dir",
            children: {
              System32: { type: "dir", children: {} },
              Temp: { type: "dir", children: {} },
            },
          },
          Users: {
            type: "dir",
            children: {
              Admin: {
                type: "dir",
                children: {
                  Desktop: { type: "dir", children: {} },
                  Documents: {
                    type: "dir",
                    children: {
                      "network-notes.txt": {
                        type: "file",
                        content:
                          "Gateway: 192.168.1.1\nDNS: 8.8.8.8\nSubnet: 255.255.255.0",
                      },
                    },
                  },
                  Downloads: { type: "dir", children: {} },
                  "config.txt": {
                    type: "file",
                    content:
                      "[Network]\nIP=192.168.1.105\nGateway=192.168.1.1\nDNS=8.8.8.8\nSubnet=255.255.255.0\n",
                  },
                },
              },
            },
          },
          repos: {
            type: "dir",
            children: {
              app: {
                type: "dir",
                children: {
                  "auth.js": {
                    type: "file",
                    content:
                      "// Authentication module\nconst user = req.body.user ?? null;\nmodule.exports = { authenticate };",
                  },
                  "package.json": {
                    type: "file",
                    content:
                      '{\n  "name": "app",\n  "version": "1.0.0",\n  "scripts": {\n    "test": "jest",\n    "lint": "eslint src/"\n  }\n}',
                  },
                },
              },
            },
          },
          "Program Files": { type: "dir", children: {} },
        },
      },
    },
  };
  return { root, cwd };
}

// ─── Path helpers ──────────────────────────────────────────────────────────────
function isWin(os: OS): boolean {
  return os === "windows" || os === "powershell";
}

function splitPath(path: string, os: OS): string[] {
  return path.split(isWin(os) ? /[/\\]/ : /\//).filter(Boolean);
}

function sep(os: OS): string {
  return isWin(os) ? "\\" : "/";
}

function resolvePath(cwd: string, target: string, os: OS): string {
  if (!target || target === ".") return cwd;
  const win = isWin(os);
  if (!win && target.startsWith("/")) return normPath(target, os);
  if (win && /^[A-Za-z]:\\/.test(target)) return normPath(target, os);
  const home = win ? "C:\\Users\\Admin" : "/home/student";
  if (target === "~") return home;
  if (target.startsWith("~/") || target.startsWith("~\\"))
    return normPath(home + sep(os) + target.slice(2), os);
  const parts = splitPath(cwd, os);
  for (const p of target.split(isWin(os) ? /[/\\]/ : /\//)) {
    if (p === "..") {
      if (parts.length > 0) parts.pop();
    } else if (p !== ".") {
      parts.push(p);
    }
  }
  return (win ? "" : "/") + parts.join(sep(os));
}

function normPath(path: string, os: OS): string {
  const parts = splitPath(path, os);
  return (isWin(os) ? "" : "/") + parts.join(sep(os));
}

function getNode(root: FSDir, path: string, os: OS): FSNode | null {
  const parts = splitPath(path, os);
  let cur: FSNode = root;
  for (const part of parts) {
    if (cur.type !== "dir") return null;
    const child: FSNode | undefined = cur.children[part] as FSNode | undefined;
    if (!child) return null;
    cur = child;
  }
  return cur;
}

function cwdShort(cwd: string, os: OS): string {
  if (!isWin(os))
    return cwd === "/home/student" ? "~" : cwd.replace("/home/student", "~");
  return cwd;
}

// ─── Machine icon ──────────────────────────────────────────────────────────────
function MachineIcon({ icon, size = "sm" }: { icon?: TerminalMachine["icon"]; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5";
  switch (icon) {
    case "server":     return <Server className={cls} />;
    case "router":     return <Network className={cls} />;
    case "switch":     return <Network className={cls} />;
    case "firewall":   return <Shield className={cls} />;
    case "laptop":     return <Laptop className={cls} />;
    case "pc":
    default:           return <Monitor className={cls} />;
  }
}

// ─── Network topology mini-diagram ────────────────────────────────────────────
function NetworkTopologyDiagram({
  machines,
  activeMachineId,
  currentStepMachineId,
  onSelect,
}: {
  machines: TerminalMachine[];
  activeMachineId: string;
  currentStepMachineId?: string;
  onSelect: (id: string) => void;
}) {
  const osColour: Record<string, string> = {
    cisco:      "text-yellow-400",
    linux:      "text-green-400",
    windows:    "text-blue-400",
    powershell: "text-cyan-400",
  };
  return (
    <div className="flex items-center justify-center gap-0 px-4 py-3 bg-zinc-950 border-b border-zinc-800 overflow-x-auto">
      {machines.map((m, i) => {
        const os = detectOS(m.prompt);
        const isActive = m.id === activeMachineId;
        const isPending = m.id === currentStepMachineId;
        const colour = osColour[os] ?? "text-zinc-400";
        return (
          <div key={m.id} className="flex items-center">
            {/* Connector line between nodes */}
            {i > 0 && (
              <div className="flex items-center w-8 shrink-0">
                <div className="h-px flex-1 bg-zinc-700" />
                <div className="w-1.5 h-1.5 border-r-2 border-t-2 border-zinc-600 rotate-45 -ml-1 shrink-0" />
              </div>
            )}
            {/* Node */}
            <button
              onClick={() => onSelect(m.id)}
              className={`
                flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all shrink-0
                ${isActive
                  ? "bg-blue-500/15 ring-1 ring-blue-500/60"
                  : "hover:bg-zinc-800"}
              `}
            >
              <div
                className={`
                  relative flex items-center justify-center h-9 w-9 rounded-full border-2
                  ${isActive ? "border-blue-500 bg-blue-500/10" : "border-zinc-700 bg-zinc-900"}
                `}
              >
                <span className={colour}>
                  <MachineIcon icon={m.icon} size="lg" />
                </span>
                {isPending && !isActive && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-400 border-2 border-zinc-950 animate-pulse" />
                )}
              </div>
              <div className="text-center leading-tight">
                <p className={`text-[11px] font-semibold ${isActive ? "text-white" : "text-zinc-300"}`}>
                  {m.label}
                </p>
                <p className={`text-[9px] uppercase tracking-wide ${colour}`}>
                  {os === "cisco" ? "Cisco IOS" : os === "linux" ? "Linux" : os === "domain" ? "Domain CLI" : os === "powershell" ? "PowerShell" : "Windows"}
                </p>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── System command output (stateless) ────────────────────────────────────────
function getCommandOutput(cmd: string, hostname: string, os: OS): string {
  const c = cmd.trim();
  const cl = c.toLowerCase();
  const parts = cl.split(/\s+/);
  const base = parts[0] ?? "";

  if (cl === "hostname") return hostname;
  if (cl === "whoami") return isWin(os) ? `${hostname}\\admin` : "student";
  if (base === "echo") return c.slice(5);

  if (os === "windows" || os === "powershell") {
    if (base === "ipconfig") {
      if (cl.includes("/all"))
        return `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${hostname}\n   Primary Dns Suffix  . . . . . . . : corp.local\n   Node Type . . . . . . . . . . . . : Hybrid\n\nEthernet adapter Ethernet0:\n\n   Physical Address. . . . . . . . . : 00-0C-29-A1-B2-C3\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : \x1b[1;37m192.168.1.105\x1b[0m\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.1\n                                       8.8.8.8`;
      if (cl.includes("/flushdns"))
        return "Windows IP Configuration\n\n\x1b[32mSuccessfully flushed the DNS Resolver Cache.\x1b[0m";
      if (cl.includes("/release"))
        return "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   Media State . . . : Media disconnected";
      if (cl.includes("/renew"))
        return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : 192.168.1.107\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
      return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
    }
    if (base === "ping") {
      const t = parts[1] ?? "8.8.8.8";
      const ip = t.match(/^\d/) ? t : "142.250.80.46";
      return `\nPinging ${t} [${ip}] with 32 bytes of data:\nReply from ${ip}: bytes=32 time=14ms TTL=118\nReply from ${ip}: bytes=32 time=13ms TTL=118\nReply from ${ip}: bytes=32 time=12ms TTL=118\nReply from ${ip}: bytes=32 time=14ms TTL=118\n\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 \x1b[32m(0% loss)\x1b[0m\nApproximate round trip times in milli-seconds:\n    Minimum = 12ms, Maximum = 14ms, Average = 13ms`;
    }
    if (base === "tracert") {
      const t = parts[1] ?? "8.8.8.8";
      return `\nTracing route to ${t} over a maximum of 30 hops\n\n  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2     8 ms     7 ms     8 ms  10.0.0.1\n  3    12 ms    11 ms    12 ms  ${t}\n\nTrace complete.`;
    }
    if (base === "nslookup") {
      const t = parts[1] ?? "google.com";
      return `Server:  dns.corp.local\nAddress:  192.168.1.1\n\nNon-authoritative answer:\nName:    ${t}\nAddresses:  142.250.80.46`;
    }
    if (base === "netstat")
      return `Active Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING\n  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:3389     0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:54321    142.250.80.46:443      ESTABLISHED`;
    if (base === "systeminfo")
      return `Host Name:                 ${hostname.toUpperCase()}\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nTotal Physical Memory:     8,192 MB\nDomain:                    corp.local`;
    if (base === "tasklist")
      return `Image Name                     PID Session Name        Mem Usage\n========================= ========\nSystem Idle Process              0 Services                  8 K\nsvchost.exe                    844 Services              28,432 K\nexplorer.exe                  2560 Console              42,156 K`;
    if (base === "taskkill")
      return `SUCCESS: The process "${parts.at(-1)}" has been terminated.`;
    if (cl.startsWith("net user")) {
      if (parts.length <= 2)
        return `User accounts for \\\\${hostname}\n\n-------------------------------------------------------------------------------\nAdministrator            Guest                    helpdesk\nThe command completed successfully.`;
      const u = parts[2] ?? "admin";
      return `User name                    ${u}\nAccount active               Yes\nLocal Group Memberships      *Users\nThe command completed successfully.`;
    }
    if (cl.startsWith("net localgroup"))
      return `Alias name     Administrators\nComment        Administrators have complete and unrestricted access\n\nMembers\n-------------------------------------------------------------------------------\nAdmin\nThe command completed successfully.`;
    if (cl.startsWith("sc "))
      return `SERVICE_NAME: ${parts[2] ?? "wuauserv"}\n        STATE              : 4  RUNNING\n        WIN32_EXIT_CODE    : 0  (0x0)`;
    if (cl === "sfc /scannow")
      return `Beginning system scan...\n\nVerification 100% complete.\n\n\x1b[32mWindows Resource Protection did not find any integrity violations.\x1b[0m`;
    if (cl === "ver")
      return "Microsoft Windows [Version 10.0.19045.3803]";
    if (cl.startsWith("gpupdate"))
      return `Updating policy...\n\x1b[32mComputer Policy update has completed successfully.\x1b[0m`;
    if (base === "npm") {
      if (cl.includes("install"))
        return `\nadded 342 packages in 12s\n\n\x1b[32m342 packages are up to date.\x1b[0m`;
      if (cl.includes("test"))
        return `\n> jest\n\nPASS  src/__tests__/auth.test.js\n  ✓ should return null for missing user (3 ms)\n  ✓ should authenticate valid session (5 ms)\n\n\x1b[32mAll tests passed.\x1b[0m`;
      if (cl.includes("lint"))
        return `\n> eslint src/\n\n\x1b[32mNo ESLint warnings or errors found.\x1b[0m`;
    }
    if (cl.startsWith("git ")) {
      if (cl === "git status")
        return `On branch fix/login-crash\nChanges to be committed:\n\tmodified:   auth.js\n`;
      if (cl.startsWith("git add")) return "";
      if (cl.startsWith("git commit"))
        return `[fix/login-crash 9f3a1c2] ${cl.includes("-m") ? c.replace(/.*-m\s*["']?/, "").replace(/["'].*/, "") : "update"}\n 1 file changed, 3 insertions(+), 1 deletion(-)`;
      if (cl === "git log --oneline")
        return `9f3a1c2 fix login null crash\na1b2c3d initial commit`;
      if (cl.startsWith("git push"))
        return `To https://github.com/corp/app.git\n   a1b2c3d..9f3a1c2  fix/login-crash -> fix/login-crash\n\x1b[32mBranch pushed successfully.\x1b[0m`;
      if (cl.startsWith("git pull"))
        return `\x1b[32mAlready up to date.\x1b[0m`;
    }
  }

  if (os === "linux") {
    if (base === "ping") {
      const t =
        parts.find((p) => !p.startsWith("-") && p !== "ping") ?? "8.8.8.8";
      return `PING ${t} (8.8.8.8) 56(84) bytes of data.\n64 bytes from ${t}: icmp_seq=1 ttl=118 time=12.3 ms\n64 bytes from ${t}: icmp_seq=2 ttl=118 time=13.1 ms\n64 bytes from ${t}: icmp_seq=3 ttl=118 time=12.8 ms\n64 bytes from ${t}: icmp_seq=4 ttl=118 time=13.5 ms\n\n--- ${t} ping statistics ---\n4 packets transmitted, 4 received, \x1b[32m0% packet loss\x1b[0m\nrtt min/avg/max/mdev = 12.3/12.9/13.5/0.5 ms`;
    }
    if (base === "ifconfig")
      return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet \x1b[1;37m192.168.1.20\x1b[0m  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether 00:0c:29:a1:b2:c3  txqueuelen 1000\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`;
    if (cl.startsWith("ip addr") || cl === "ip a")
      return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet \x1b[1;37m192.168.1.20/24\x1b[0m brd 192.168.1.255 scope global dynamic eth0\n    inet6 fe80::20c:29ff:fea1:b2c3/64 scope link`;
    if (cl.startsWith("ip route") || cl === "ip r")
      return `default via 192.168.1.1 dev eth0 proto dhcp metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.20`;
    if (cl.startsWith("ss ") || cl.startsWith("netstat "))
      return `Netid   State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\ntcp     LISTEN   0        511         0.0.0.0:80          0.0.0.0:*\ntcp     LISTEN   0        511         0.0.0.0:443         0.0.0.0:*\ntcp     LISTEN   0        128         0.0.0.0:22          0.0.0.0:*\ntcp     ESTAB    0        0     192.168.1.20:22    192.168.1.105:54321`;
    if (cl.startsWith("systemctl")) {
      const action = parts[1] ?? "status";
      const svc = parts[2] ?? "nginx";
      if (action === "status")
        return `● ${svc}.service - ${svc}\n     Loaded: loaded (/lib/systemd/system/${svc}.service; enabled)\n     Active: \x1b[32mactive (running)\x1b[0m since Mon 2026-07-21 08:00:00 UTC\n   Main PID: 1235 (${svc})\n     Memory: 4.1M`;
      if (action === "start")
        return `\x1b[32m[  OK  ]\x1b[0m Started ${svc}.service.`;
      if (action === "stop")
        return `\x1b[33m[  OK  ]\x1b[0m Stopped ${svc}.service.`;
      if (action === "restart")
        return `\x1b[32m[  OK  ]\x1b[0m Restarted ${svc}.service.`;
      if (action === "enable")
        return `Created symlink /etc/systemd/system/multi-user.target.wants/${svc}.service.`;
    }
    if (base === "ps")
      return `  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1456 pts/0    00:00:00 nginx\n 2345 pts/0    00:00:00 ps`;
    if (cl === "uname -a")
      return `Linux ${hostname} 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux`;
    if (cl.startsWith("apt") || cl.startsWith("apt-get")) {
      if (cl.includes("update"))
        return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nReading package lists... Done\n\x1b[32mAll packages are up to date.\x1b[0m`;
      if (cl.includes("install"))
        return `Reading package lists... Done\n\x1b[32mSetting up ${parts[2] ?? "package"} ...\x1b[0m`;
    }
    if (base === "df")
      return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  37% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm`;
    if (base === "free")
      return `               total        used        free\nMem:         8117780     2134567     4325678\nSwap:        2097148           0     2097148`;
    if (base === "chmod" || base === "chown") return "";
    if (cl === "curl localhost" || cl === "curl http://localhost")
      return `\x1b[32m<!DOCTYPE html>\n<html><body><h1>It works!</h1></body></html>\x1b[0m`;
    if (base === "curl")
      return `\x1b[32m{ "status": "ok" }\x1b[0m`;
    if (base === "kill") return "";
    if (base === "useradd") return "";
    if (base === "passwd")
      return "New password: ****\nRetype new password: ****\n\x1b[32mpasswd: password updated successfully\x1b[0m";
    if (cl === "history")
      return `  1  ls -la\n  2  cd /etc/nginx\n  3  cat nginx.conf\n  4  systemctl restart nginx\n  5  ss -tuln\n  6  history`;
  }

  if (os === "cisco") {
    if (cl === "enable" || cl === "en") return "";
    if (cl === "configure terminal" || cl === "conf t")
      return "Enter configuration commands, one per line.  End with CNTL/Z.";
    if (
      cl.startsWith("show ip interface brief") ||
      cl.startsWith("sh ip int br")
    )
      return `Interface              IP-Address      OK? Method Status                Protocol\n\x1b[32mGigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up\x1b[0m\n\x1b[32mGigabitEthernet0/1     10.0.0.1        YES NVRAM  up                    up\x1b[0m\n\x1b[31mGigabitEthernet0/2     unassigned      YES NVRAM  administratively down down\x1b[0m`;
    if (cl.startsWith("show ip route") || cl.startsWith("sh ip ro"))
      return `Codes: C - connected, S - static, R - RIP\n       O - OSPF, B - BGP\n\nGateway of last resort is not set\n\n\x1b[32mC        192.168.1.0/24 is directly connected, GigabitEthernet0/0\nC        10.0.0.0/24 is directly connected, GigabitEthernet0/1\x1b[0m\nS        0.0.0.0/0 [1/0] via 203.0.113.1`;
    if (cl.startsWith("show run") || cl.startsWith("sh run"))
      return `Building configuration...\n\nhostname ${hostname}\n!\nip routing\n!\ninterface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\n!\ninterface GigabitEthernet0/1\n ip address 10.0.0.1 255.255.255.0\n no shutdown\n!\nend`;
    if (cl.startsWith("show ver") || cl.startsWith("sh ver"))
      return `Cisco IOS Software, Version 15.4(3)M2\n${hostname} uptime is 3 hours, 45 minutes\nCisco 2911 Router`;
    if (cl.startsWith("show int") || cl.startsWith("sh int"))
      return `GigabitEthernet0/0 is \x1b[32mup\x1b[0m, line protocol is \x1b[32mup\x1b[0m\n  Internet address is 192.168.1.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec\n  5 minute input rate 1000 bits/sec, 0 packets/sec\n  5 minute output rate 1000 bits/sec, 0 packets/sec`;
    if (cl.startsWith("show arp") || cl.startsWith("sh arp"))
      return `Protocol  Address    Age  Hardware Addr   Type   Interface\nInternet  192.168.1.105   3   000c.29a1.b2c3  ARPA   GigabitEthernet0/0\nInternet  192.168.1.20    5   000c.29a2.c3d4  ARPA   GigabitEthernet0/0`;
    if (cl.startsWith("show cdp nei") || cl.startsWith("sh cdp nei"))
      return `Capability Codes: R - Router, T - Trans Bridge, S - Switch\n\nDevice ID    Local Intrfce  Holdtme  Capability  Platform  Port ID\nSW1          Gig 0/1         120         S I      WS-C2960  Gig 0/1`;
    if (cl === "no shutdown")
      return `\x1b[32m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up\n%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up\x1b[0m`;
    if (cl === "shutdown")
      return `\x1b[33m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down\x1b[0m`;
    if (cl === "write memory" || cl === "wr" || cl.startsWith("copy run"))
      return "Building configuration...\n\x1b[32m[OK]\x1b[0m";
    if (base === "ping") {
      const t = parts[1] ?? "192.168.1.1";
      return `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${t}, timeout is 2 seconds:\n!!!!!\n\x1b[32mSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms\x1b[0m`;
    }
    if (base === "traceroute") {
      const t = parts[1] ?? "192.168.1.1";
      return `Type escape sequence to abort.\nTracing the route to ${t}:\n  1 192.168.1.1 4 msec 4 msec 4 msec\n  2 ${t} 8 msec 8 msec 8 msec`;
    }
    if (base === "interface" || base === "int") return "";
    if (cl.startsWith("ip address") || cl.startsWith("ip route")) return "";
    if (cl === "exit" || cl === "end") return "";
    if (cl === "reload") return "\nSystem configuration has been modified. Save? [yes/no]:";
  }

  return `'${c}' is not recognized as a command.`;
}

// ─── FS commands ───────────────────────────────────────────────────────────────
function handleFSCommand(
  cmd: string,
  fs: VirtualFS,
  os: OS,
): { output: string; newFS: VirtualFS } {
  const c = cmd.trim();
  const cl = c.toLowerCase();
  const parts = c.split(/\s+/);
  const clparts = cl.split(/\s+/);
  const base = clparts[0] ?? "";

  if (cl === "pwd" || cl === "cd.")
    return { output: fs.cwd, newFS: fs };

  if (base === "ls" || base === "dir") {
    const targetArg = parts.slice(1).find((p) => !p.startsWith("-"));
    const targetPath = targetArg
      ? resolvePath(fs.cwd, targetArg, os)
      : fs.cwd;
    const node = getNode(fs.root, targetPath, os);
    if (!node)
      return {
        output: `\x1b[31mls: cannot access '${targetArg}': No such file or directory\x1b[0m`,
        newFS: fs,
      };
    if (node.type === "file") return { output: targetArg ?? "", newFS: fs };
    const items = Object.entries(node.children);
    if (os === "linux") {
      if (cl.includes("-la") || cl.includes("-al")) {
        const lines = [`total ${items.length * 4}`];
        lines.push("drwxr-xr-x  2 student student 4096 Jul 21 08:30 .");
        lines.push("drwxr-xr-x 28 student student 4096 Jul 21 08:00 ..");
        for (const [name, child] of items) {
          const d = child.type === "dir";
          const perms = d
            ? "drwxr-xr-x"
            : name.endsWith(".sh")
            ? "-rwxr-xr-x"
            : "-rw-r--r--";
          lines.push(
            `${perms}  1 student student 4096 Jul 21 08:30 ${d ? `\x1b[34m${name}\x1b[0m` : name}`,
          );
        }
        return { output: lines.join("\n"), newFS: fs };
      }
      const out = items
        .map(([n, ch]) => (ch.type === "dir" ? `\x1b[34m${n}\x1b[0m` : n))
        .join("  ");
      return { output: out, newFS: fs };
    }
    const lines = [` Volume in drive C is Windows\n Directory of ${targetPath}\n`];
    for (const [n, ch] of items)
      lines.push(
        `07/21/2026  08:30 AM    ${ch.type === "dir" ? "<DIR>         " : "          "}   ${n}`,
      );
    lines.push(
      `\n               ${items.filter(([, ch]) => ch.type === "file").length} File(s)\n               ${items.filter(([, ch]) => ch.type === "dir").length} Dir(s)  45,123,456,000 bytes free`,
    );
    return { output: lines.join("\n"), newFS: fs };
  }

  if (base === "cd") {
    const target = parts.slice(1).join(" ");
    if (!target) {
      const home = isWin(os) ? "C:\\Users\\Admin" : "/home/student";
      return { output: "", newFS: { ...fs, cwd: home } };
    }
    const newPath = resolvePath(fs.cwd, target, os);
    const node = getNode(fs.root, newPath, os);
    if (!node)
      return {
        output: `\x1b[31m${isWin(os) ? "The system cannot find the path specified." : `bash: cd: ${target}: No such file or directory`}\x1b[0m`,
        newFS: fs,
      };
    if (node.type !== "dir")
      return {
        output: `\x1b[31m${isWin(os) ? "Not a directory." : `bash: cd: ${target}: Not a directory`}\x1b[0m`,
        newFS: fs,
      };
    return { output: "", newFS: { ...fs, cwd: newPath } };
  }

  if (base === "cat" || base === "type") {
    const target = parts.slice(1).join(" ");
    if (!target)
      return { output: `\x1b[31mcat: missing operand\x1b[0m`, newFS: fs };
    const targetPath = resolvePath(fs.cwd, target, os);
    const node = getNode(fs.root, targetPath, os);
    if (!node)
      return {
        output: `\x1b[31m${isWin(os) ? "The system cannot find the file specified." : `cat: ${target}: No such file or directory`}\x1b[0m`,
        newFS: fs,
      };
    if (node.type === "dir")
      return {
        output: `\x1b[31m${isWin(os) ? "Access is denied." : `cat: ${target}: Is a directory`}\x1b[0m`,
        newFS: fs,
      };
    return { output: node.content, newFS: fs };
  }

  if (base === "mkdir" || base === "md") {
    const name = parts.slice(1).join(" ");
    if (!name) return { output: "\x1b[31mmkdir: missing operand\x1b[0m", newFS: fs };
    const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root)) as FSDir;
    const parent = getNode(newRoot, fs.cwd, os) as FSDir | null;
    if (parent?.type === "dir") parent.children[name] = { type: "dir", children: {} };
    return { output: "", newFS: { ...fs, root: newRoot } };
  }

  if (base === "touch") {
    const name = parts[1] ?? "";
    if (!name) return { output: "", newFS: fs };
    const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root)) as FSDir;
    const parent = getNode(newRoot, fs.cwd, os) as FSDir | null;
    if (parent?.type === "dir" && !parent.children[name])
      parent.children[name] = { type: "file", content: "" };
    return { output: "", newFS: { ...fs, root: newRoot } };
  }

  if (base === "rm" || base === "del" || base === "rmdir") {
    const target = parts.slice(1).find((p) => !p.startsWith("-")) ?? "";
    if (!target) return { output: "\x1b[31mrm: missing operand\x1b[0m", newFS: fs };
    const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root)) as FSDir;
    const parent = getNode(newRoot, fs.cwd, os) as FSDir | null;
    if (parent?.type === "dir" && parent.children[target]) {
      delete parent.children[target];
      return { output: "", newFS: { ...fs, root: newRoot } };
    }
    return {
      output: `\x1b[31mrm: ${target}: No such file or directory\x1b[0m`,
      newFS: fs,
    };
  }

  if (base === "mv" || base === "rename" || base === "ren") {
    const src = parts[1] ?? "";
    const dst = parts[2] ?? "";
    if (!src || !dst) return { output: `\x1b[31mmv: missing operand\x1b[0m`, newFS: fs };
    const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root)) as FSDir;
    const parent = getNode(newRoot, fs.cwd, os) as FSDir | null;
    if (parent?.type === "dir" && parent.children[src]) {
      parent.children[dst] = parent.children[src]!;
      delete parent.children[src];
      return { output: "", newFS: { ...fs, root: newRoot } };
    }
    return {
      output: `\x1b[31mmv: ${src}: No such file or directory\x1b[0m`,
      newFS: fs,
    };
  }

  return { output: "__NOT_FS__", newFS: fs };
}

// ─── Per-machine mutable state (stored in a ref Map) ──────────────────────────
type MachineState = {
  term: Terminal;
  fit: FitAddon;
  fs: VirtualFS;
  currentLine: string;
  history: string[];
  histIdx: number;
};

// ─── Wrong-command nudge helper ───────────────────────────────────────────────
function wrongCommandNudge(typed: string, expected: string, tries: number): string {
  const t = typed.toLowerCase().trim();
  const e = expected.toLowerCase().trim();
  const eBase = e.split(/\s/)[0];
  const tBase = t.split(/\s/)[0];
  if (tries === 1) {
    if (tBase === eBase) return "Right command — double-check the flags or arguments.";
    if (eBase === "ipconfig" && tBase === "ifconfig") return "Windows uses ipconfig, not ifconfig.";
    if (eBase === "ifconfig" && tBase === "ipconfig") return "Linux uses ifconfig or 'ip addr', not ipconfig.";
    if (eBase === "systemctl" && (t.startsWith("service ") || t.startsWith("sudo service "))) return "Try systemctl on this system.";
    if (eBase === "ping" && !t.startsWith("ping ")) return "Specify a host: ping <address>";
    return "Not the expected command for this step — check the instruction.";
  }
  if (tries === 2) return "Auto-hint revealed in the sidebar →";
  return "Check the hint in the sidebar and try again.";
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function TerminalLabEngine({
  gameId,
  data,
}: {
  gameId: string;
  data: TerminalWorkspaceContent;
}) {
  // Compute the canonical list of machines (multi or single)
  const primaryMachine: TerminalMachine = {
    id: "primary",
    label: data.hostname,
    hostname: data.hostname,
    prompt: data.prompt,
    initialOutput: data.initialOutput,
    icon: (() => {
      const os = detectOS(data.prompt);
      return os === "cisco" ? "router" : (os === "linux" || os === "domain") ? "server" : "pc";
    })(),
  };
  const allMachines: TerminalMachine[] =
    data.machines && data.machines.length > 0 ? data.machines : [primaryMachine];
  const isMultiMachine = allMachines.length > 1;

  const [activeMachineId, setActiveMachineId] = useState<string>(
    allMachines[0]?.id ?? "primary",
  );

  // Shared step tracking (across all machines)
  const currentStepRef = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Per-machine container divs
  const containerDivsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  // Per-machine state (terminal, FS, input line)
  const machineStatesRef = useRef<Map<string, MachineState>>(new Map());

  const [labStarted, setLabStarted] = useState(false);
  const wrongAttemptsRef = useRef<Map<number, number>>(new Map());
  const showHintRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(
    data.timeLimitMinutes != null ? data.timeLimitMinutes * 60 : null,
  );
  const [timedOut, setTimedOut] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [revealAvailable, setRevealAvailable] = useState(false);
  const [cmdRevealed, setCmdRevealed] = useState(false);
  const revealAvailableRef = useRef(false);
  const reward = useGameReward(gameId, done, 100);
  const flow = useLabModuleFlow();

  const buildPromptString = useCallback(
    (machine: TerminalMachine, fs: VirtualFS): string => {
      const os = detectOS(machine.prompt);
      if (os === "cisco") return `\r\n\x1b[36m${machine.prompt}\x1b[0m`;
      if (os === "domain") return `\r\n\x1b[32m${machine.prompt}\x1b[0m `;
      if (os === "linux") {
        const short = cwdShort(fs.cwd, os);
        return `\r\n\x1b[32mstudent@${machine.hostname}:${short}$\x1b[0m `;
      }
      return `\r\n\x1b[37m${fs.cwd}>\x1b[0m `;
    },
    [],
  );

  const initMachineTerminal = useCallback(
    (machine: TerminalMachine, container: HTMLDivElement) => {
      const os = detectOS(machine.prompt);
      const initialCwd = extractInitialCwd(machine.prompt, os);
      const fs = buildDefaultFS(os, machine.hostname, initialCwd);

      const term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontFamily: '"Cascadia Code", "Consolas", "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.3,
        scrollback: 1000,
        theme: {
          background: "#0c0c0c",
          foreground: "#cccccc",
          cursor: "#ffffff",
          cursorAccent: "#0c0c0c",
          selectionBackground: "rgba(255,255,255,0.3)",
          black: "#0c0c0c",     brightBlack: "#767676",
          red: "#c50f1f",       brightRed: "#ff4f4f",
          green: "#13a10e",     brightGreen: "#16c60c",
          yellow: "#c19c00",    brightYellow: "#f9f1a5",
          blue: "#3b78ff",      brightBlue: "#61afef",
          magenta: "#881798",   brightMagenta: "#b4009e",
          cyan: "#3a96dd",      brightCyan: "#61d6d6",
          white: "#cccccc",     brightWhite: "#f2f2f2",
        },
      });

      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(container);
      requestAnimationFrame(() => { try { fit.fit(); } catch (_) {} });

      const state: MachineState = {
        term,
        fit,
        fs,
        currentLine: "",
        history: [],
        histIdx: -1,
      };
      machineStatesRef.current.set(machine.id, state);

      // Banner — domain CLIs (BMS, pharmacy, billing, etc.) skip the OS banner;
      // their initialOutput already provides the system context.
      const banner =
        os === "windows"
          ? `Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.`
          : os === "cisco"
          ? `\r\n${machine.hostname}>\r\nCisco IOS Software, Version 15.4(3)M2 — Cisco 2911 Router`
          : os === "domain"
          ? null
          : `Last login: Mon Jul 21 08:00:00 2026\nWelcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)`;
      if (banner) banner.split("\n").forEach((l) => term.writeln(l));

      if (machine.initialOutput) {
        term.writeln("");
        machine.initialOutput.split("\n").forEach((l) => term.writeln(l));
      }

      term.write(buildPromptString(machine, state.fs));

      term.onKey(({ key, domEvent }) => {
        const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
        const s = machineStatesRef.current.get(machine.id)!;

        if (domEvent.keyCode === 13) {
          // Enter
          const cmd = s.currentLine.trim();
          term.writeln("");

          if (cmd) {
            s.history.unshift(cmd);
            s.histIdx = -1;
            const lower = cmd.toLowerCase();

            if (lower === "cls" || lower === "clear") {
              term.clear();
              term.write(buildPromptString(machine, s.fs));
              s.currentLine = "";
              return;
            }

            const { output: fsOut, newFS } = handleFSCommand(cmd, s.fs, os);
            if (fsOut !== "__NOT_FS__") {
              s.fs = newFS;
              if (fsOut) fsOut.split("\n").forEach((l) => term.writeln(l));
            } else {
              // Check per-lab custom command outputs first (domain CLIs: BMS, pharmacy, billing, etc.)
              const customOut = data.commandOutputs?.[cmd.toLowerCase()];
              const out = customOut ?? getCommandOutput(cmd, machine.hostname, os);
              if (out) out.split("\n").forEach((l) => term.writeln(l));
            }

            // Step validation — check machine constraint
            const stepIdx = currentStepRef.current;
            const stepData = data.steps[stepIdx];
            if (stepData) {
              const machineMatches =
                !stepData.machineId || stepData.machineId === machine.id;
              if (machineMatches) {
                const expected = stepData.expectedCommand.trim().toLowerCase();
                const typed = cmd.trim().toLowerCase();
                if (typed === expected || typed.startsWith(expected + " ")) {
                  term.writeln(`\r\n\x1b[32m✓ Step ${stepIdx + 1} complete\x1b[0m`);
                  if (stepData.notes) {
                    term.writeln(`\x1b[36m💡 ${stepData.notes}\x1b[0m`);
                  }
                  const next = stepIdx + 1;
                  currentStepRef.current = next;
                  wrongAttemptsRef.current.delete(stepIdx);
                  setCurrentStep(next);
                  setCompletedSteps((prev) => new Set([...prev, stepIdx]));
                  setShowHint(false);
                  setRevealAvailable(false);
                  setCmdRevealed(false);
                  if (next >= data.steps.length) {
                    term.writeln(
                      "\x1b[32;1m\r\n╔══════════════════════════════════╗\r\n║   Lab complete! All steps done.  ║\r\n╚══════════════════════════════════╝\x1b[0m",
                    );
                    setDone(true);
                    return;
                  }
                  // If next step is on a different machine, hint the user
                  const nextStep = data.steps[next];
                  if (nextStep?.machineId && nextStep.machineId !== machine.id) {
                    const targetMachine = allMachines.find(
                      (m) => m.id === nextStep.machineId,
                    );
                    if (targetMachine) {
                      term.writeln(
                        `\x1b[33m→ Switch to machine: ${targetMachine.label}\x1b[0m`,
                      );
                    }
                  }
                } else {
                  // Wrong command on correct machine — red feedback + auto-hint
                  const tries = (wrongAttemptsRef.current.get(stepIdx) ?? 0) + 1;
                  wrongAttemptsRef.current.set(stepIdx, tries);
                  const nudge = wrongCommandNudge(cmd, stepData.expectedCommand, tries);
                  term.writeln(`\r\n\x1b[31m✗\x1b[0m  ${nudge}`);
                  if (tries === 2 && !showHintRef.current) {
                    setShowHint(true);
                    setHintsUsed((h) => h + 1);
                  }
                  if (tries >= 3 && showHintRef.current && !revealAvailableRef.current) {
                    setRevealAvailable(true);
                  }
                }
              } else {
                // Wrong machine — gentle nudge
                const targetMachine = allMachines.find(
                  (m) => m.id === stepData.machineId,
                );
                if (targetMachine) {
                  term.writeln(
                    `\x1b[33m(This step needs to be run on ${targetMachine.label})\x1b[0m`,
                  );
                }
              }
            }
          }

          term.write(buildPromptString(machine, s.fs));
          s.currentLine = "";
        } else if (domEvent.keyCode === 8) {
          // Backspace
          if (s.currentLine.length > 0) {
            s.currentLine = s.currentLine.slice(0, -1);
            term.write("\b \b");
          }
        } else if (domEvent.keyCode === 38) {
          // Up arrow
          if (s.histIdx < s.history.length - 1) {
            s.histIdx++;
            const prev = s.history[s.histIdx] ?? "";
            term.write("\b \b".repeat(s.currentLine.length));
            term.write(prev);
            s.currentLine = prev;
          }
        } else if (domEvent.keyCode === 40) {
          // Down arrow
          if (s.histIdx > 0) {
            s.histIdx--;
            const next = s.history[s.histIdx] ?? "";
            term.write("\b \b".repeat(s.currentLine.length));
            term.write(next);
            s.currentLine = next;
          }
        } else if (domEvent.keyCode === 9) {
          // Tab completion — domain commands first, then filesystem paths
          domEvent.preventDefault();
          const line = s.currentLine;
          const lower = line.toLowerCase();
          if (lower) {
            const knownCmds = [
              ...Object.keys(data.commandOutputs ?? {}),
              ...data.steps.map((st) => st.expectedCommand),
            ];
            const cmdMatches = [
              ...new Set(
                knownCmds.filter(
                  (c) => c.toLowerCase().startsWith(lower) && c.toLowerCase() !== lower,
                ),
              ),
            ];
            if (cmdMatches.length === 1) {
              const fill = cmdMatches[0]!.slice(line.length);
              s.currentLine += fill;
              term.write(fill);
            } else if (cmdMatches.length > 1) {
              term.writeln("");
              term.writeln(cmdMatches.map((c) => c.split(" ")[0]).filter(Boolean).join("  "));
              term.write(buildPromptString(machine, s.fs) + s.currentLine);
            } else {
              // Fall back: filesystem path completion on the last word
              const partial = s.currentLine.split(/\s+/).at(-1) ?? "";
              if (partial) {
                const curDir = getNode(s.fs.root, s.fs.cwd, os) as FSDir | null;
                if (curDir?.type === "dir") {
                  const matches = Object.keys(curDir.children).filter((n) =>
                    n.toLowerCase().startsWith(partial.toLowerCase()),
                  );
                  if (matches.length === 1) {
                    const completion = matches[0]!.slice(partial.length);
                    s.currentLine += completion;
                    term.write(completion);
                  }
                }
              }
            }
          }
        } else if (printable) {
          s.currentLine += key;
          term.write(key);
        }
      });
    },
    [buildPromptString, data.steps, allMachines, data.initialOutput], // eslint-disable-line
  );

  // Initialize all machine terminals only once the user starts the lab
  useEffect(() => {
    if (!labStarted) return;
    // Small RAF so the containers are definitely in the DOM after the conditional render flip
    requestAnimationFrame(() => {
      for (const machine of allMachines) {
        const container = containerDivsRef.current.get(machine.id);
        if (container && !machineStatesRef.current.has(machine.id)) {
          initMachineTerminal(machine, container);
        }
      }
    });
    return () => {
      machineStatesRef.current.forEach(({ term }) => term.dispose());
      machineStatesRef.current.clear();
    };
  }, [labStarted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fit the active terminal when switching machines
  useEffect(() => {
    requestAnimationFrame(() => {
      const s = machineStatesRef.current.get(activeMachineId);
      if (s) try { s.fit.fit(); } catch (_) {}
    });
  }, [activeMachineId]);

  // Global resize handler
  useEffect(() => {
    const onResize = () => {
      const s = machineStatesRef.current.get(activeMachineId);
      if (s) try { s.fit.fit(); } catch (_) {}
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeMachineId]);

  // Keep showHintRef and revealAvailableRef in sync so onKey closures read current values
  useEffect(() => { showHintRef.current = showHint; }, [showHint]);
  useEffect(() => { revealAvailableRef.current = revealAvailable; }, [revealAvailable]);

  // Save lab attempt when the lab completes
  useEffect(() => {
    if (!done) return;
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const score = Math.max(0, Math.round(100 - (hintsUsed / data.steps.length) * 30));
    saveLabAttempt(gameId, { score, timeStr, hintsUsed, completedAt: new Date().toISOString() });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // Countdown timer — starts when the lab starts
  useEffect(() => {
    if (!labStarted || done || timedOut) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      setElapsedSec(secs);
      if (data.timeLimitMinutes != null) {
        const remaining = data.timeLimitMinutes * 60 - secs;
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(tick);
          setTimedOut(true);
        }
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [labStarted, done, timedOut, data.timeLimitMinutes]);

  const handleRetry = () => {
    machineStatesRef.current.forEach(({ term }) => term.dispose());
    machineStatesRef.current.clear();
    currentStepRef.current = 0;
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setDone(false);
    setTimedOut(false);
    setShowHint(false);
    setRevealAvailable(false);
    setCmdRevealed(false);
    setHintsUsed(0);
    setElapsedSec(0);
    setTimeLeft(data.timeLimitMinutes != null ? data.timeLimitMinutes * 60 : null);
    setActiveMachineId(allMachines[0]?.id ?? "primary");
    setLabStarted(false);
  };

  const currentStepData = data.steps[currentStep];
  const stepMachineLabel = currentStepData?.machineId
    ? allMachines.find((m) => m.id === currentStepData.machineId)?.label
    : undefined;

  // ── Lab intro screen ──────────────────────────────────────────────────────
  if (!labStarted && !done) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 flex-1">{data.title}</span>
          {isMultiMachine && (
            <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">
              <Flame className="h-3 w-3 mr-1" />
              {allMachines.length} machines
            </Badge>
          )}
        </div>
        <div className="p-6 sm:p-8 space-y-6 bg-card">
          {/* Scenario */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario</p>
            <p className="text-sm leading-relaxed">{data.brief}</p>
          </div>

          {/* Machines (multi-machine only) */}
          {isMultiMachine && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lab environment — {allMachines.length} machines
              </p>
              <div className="flex flex-wrap gap-2">
                {allMachines.map((m) => {
                  const os = detectOS(m.prompt);
                  const osLabel =
                    os === "cisco" ? "Cisco IOS"
                    : os === "linux" ? "Linux"
                    : os === "domain" ? "Domain CLI"
                    : os === "powershell" ? "PowerShell"
                    : "Windows";
                  return (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted/30 text-sm"
                    >
                      <MachineIcon icon={m.icon} />
                      <span className="font-medium">{m.label}</span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {osLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objectives */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Objectives — {data.steps.length} steps
            </p>
            <ol className="space-y-1.5">
              {data.steps.map((step, i) => {
                const machineName = step.machineId
                  ? allMachines.find((m) => m.id === step.machineId)?.label
                  : undefined;
                return (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <span className="flex-shrink-0 h-5 w-5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-muted-foreground leading-snug">
                      {step.instruction}
                      {machineName && (
                        <span className="ml-1.5 text-[10px] text-blue-400 font-medium">
                          [{machineName}]
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Begin button */}
          <div className="pt-2 flex justify-center">
            <Button
              size="lg"
              className="px-10"
              onClick={() => setLabStarted(true)}
            >
              Begin Lab
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Timed-out screen ──────────────────────────────────────────────────────
  if (timedOut) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-card overflow-hidden">
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
          <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 flex-1">{data.title}</span>
          <span className="text-red-400 font-bold">TIME EXPIRED</span>
        </div>
        <div className="p-8 text-center space-y-4">
          <div className="text-5xl">⏰</div>
          <p className="text-xl font-semibold">Time's up</p>
          <p className="text-sm text-muted-foreground">
            You completed {completedSteps.size} of {data.steps.length} steps in {data.timeLimitMinutes} minutes.
          </p>
          <div className="flex gap-6 justify-center text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{completedSteps.size}/{data.steps.length}</p>
              <p className="text-xs text-muted-foreground">Steps done</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{hintsUsed}</p>
              <p className="text-xs text-muted-foreground">Hints used</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Review the step list, then retry when you're ready.
          </p>
          <Button onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ── Completion screen ─────────────────────────────────────────────────────
  if (done) {
    const mins = Math.floor(elapsedSec / 60);
    const secs = elapsedSec % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const score = Math.max(
      0,
      Math.round(100 - (hintsUsed / data.steps.length) * 30),
    );
    const best = getBestLabAttempt(gameId);
    const isNewBest = !best || score > best.score;
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-card overflow-hidden">
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2">{data.hostname} — {data.title}</span>
        </div>
        <div className="p-8 text-center space-y-5">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <div>
            <p className="text-xl font-semibold">Lab Complete</p>
            <p className="text-sm text-muted-foreground mt-1">
              All {data.steps.length} steps completed successfully.
            </p>
            {isNewBest && best && (
              <p className="text-xs text-emerald-500 font-medium mt-1">🏆 New personal best!</p>
            )}
            {!isNewBest && best && (
              <p className="text-xs text-muted-foreground mt-1">Previous best: {best.score}% · {best.timeStr}</p>
            )}
          </div>
          {/* Score card */}
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className={`text-2xl font-bold ${score >= 90 ? "text-emerald-500" : score >= 70 ? "text-yellow-500" : "text-red-500"}`}>
                {score}%
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Score</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold">{timeStr}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Time</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
              <p className={`text-2xl font-bold ${hintsUsed === 0 ? "text-emerald-500" : "text-yellow-500"}`}>
                {hintsUsed}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Hints</p>
            </div>
          </div>
          <GameRewardBanner reward={reward} />
          <div className="flex gap-2 justify-center flex-wrap">
            {flow?.inFlow ? (
              <Button onClick={flow.onPracticeComplete}>
                {flow.practiceCompleteLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Repeat lab
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active lab ────────────────────────────────────────────────────────────
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Title bar */}
      <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 flex-1">{data.title}</span>
        {isMultiMachine && (
          <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">
            <Flame className="h-3 w-3 mr-1" />
            {allMachines.length} machines
          </Badge>
        )}
        {timeLeft != null && (
          <Badge
            variant="outline"
            className={`text-xs tabular-nums font-mono border-zinc-600 ${timeLeft <= 60 ? "text-red-400 border-red-500/50 animate-pulse" : timeLeft <= 300 ? "text-yellow-400 border-yellow-500/50" : "text-zinc-300"}`}
          >
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </Badge>
        )}
      </div>

      {/* Network topology diagram — only shown when multi-machine */}
      {isMultiMachine && (
        <NetworkTopologyDiagram
          machines={allMachines}
          activeMachineId={activeMachineId}
          currentStepMachineId={currentStepData?.machineId}
          onSelect={setActiveMachineId}
        />
      )}

      {/* Machine tabs — only shown when multi-machine */}
      {isMultiMachine && (
        <div className="flex border-b border-zinc-700 bg-zinc-950 overflow-x-auto">
          {allMachines.map((machine) => {
            const active = machine.id === activeMachineId;
            const os = detectOS(machine.prompt);
            const osLabel =
              os === "cisco"
                ? "Cisco IOS"
                : os === "linux"
                ? "Linux"
                : os === "domain"
                ? "Domain CLI"
                : os === "powershell"
                ? "PowerShell"
                : "Windows";
            // Does the current pending step belong to this machine?
            const pendingHere =
              currentStepData?.machineId === machine.id ||
              (!currentStepData?.machineId && machine.id === allMachines[0]?.id);
            return (
              <button
                key={machine.id}
                onClick={() => setActiveMachineId(machine.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-xs border-r border-zinc-700 whitespace-nowrap transition-colors relative
                  ${active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"}
                `}
              >
                {pendingHere && !completedSteps.has(currentStep) && (
                  <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                )}
                <MachineIcon icon={machine.icon} />
                <span className="font-medium">{machine.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-zinc-700 text-zinc-300" : "bg-zinc-800 text-zinc-500"}`}
                >
                  {osLabel}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Terminal area — all machines rendered, only active one visible */}
        <div className="flex-1 min-w-0 bg-[#0c0c0c] relative">
          {allMachines.map((machine) => (
            <div
              key={machine.id}
              style={{ display: machine.id === activeMachineId ? "block" : "none" }}
            >
              <div
                ref={(el) => {
                  if (el) containerDivsRef.current.set(machine.id, el);
                }}
                className="w-full"
                style={{ height: 340 }}
              />
            </div>
          ))}
        </div>

        {/* Step sidebar */}
        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lab Steps — {completedSteps.size}/{data.steps.length}
            </p>
          </div>

          <div className="p-3 text-xs text-muted-foreground border-b border-border leading-snug">
            {data.brief}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {data.steps.map((step, i) => {
              const isDone = completedSteps.has(i);
              const isCur = i === currentStep && !done;
              const machineName = step.machineId
                ? allMachines.find((m) => m.id === step.machineId)?.label
                : undefined;
              return (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                    isDone
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : isCur
                      ? "bg-blue-500/10 border border-blue-500/30"
                      : "border border-transparent text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : isCur ? (
                      <CircleDot className="h-4 w-4 text-blue-500 mt-0.5 shrink-0 animate-pulse" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <span className={isDone ? "line-through text-muted-foreground" : ""}>
                        {step.instruction}
                      </span>
                      {machineName && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          <Monitor className="h-2.5 w-2.5" />
                          {machineName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStepData && !done && (
            <div className="border-t border-border p-3 space-y-2">
              {stepMachineLabel && (
                <p className="text-[10px] text-blue-400 font-medium flex items-center gap-1">
                  <Monitor className="h-3 w-3" />
                  Switch to: {stepMachineLabel}
                </p>
              )}
              <p className="text-xs font-medium">
                Step {currentStep + 1}: {currentStepData.instruction}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs h-7"
                onClick={() => { if (!showHint) setHintsUsed((h) => h + 1); setShowHint((v) => !v); }}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                {showHint ? "Hide hint" : "Show hint"}
              </Button>
              {showHint && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">
                  {currentStepData.hint ?? currentStepData.expectedCommand}
                </p>
              )}
              {revealAvailable && !cmdRevealed && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-7 border-yellow-500/40 text-yellow-600 hover:bg-yellow-500/10"
                  onClick={() => { setCmdRevealed(true); setHintsUsed((h) => h + 1); }}
                >
                  Reveal exact command
                </Button>
              )}
              {cmdRevealed && (
                <p className="text-xs bg-yellow-500/10 border border-yellow-500/30 rounded p-2 font-mono text-yellow-300 break-all select-all">
                  {currentStepData.expectedCommand}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
