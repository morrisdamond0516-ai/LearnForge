import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameRewardBanner } from "@/components/games/game-reward-banner";
import { useGameReward } from "@/hooks/use-game-reward";
import { useLabModuleFlow } from "@/components/games/lab-module-flow-context";
import type { TerminalWorkspaceContent } from "@/lib/educational-games/skill-game-types";

// ─── OS detection ──────────────────────────────────────────────────────────────
type OS = "windows" | "linux" | "cisco" | "powershell";

function detectOS(prompt: string): OS {
  const p = prompt.toLowerCase();
  if (p.startsWith("ps ") || p.includes("powershell")) return "powershell";
  if (p.includes("router") || p.includes("switch") || p.includes("firewall") || (p.endsWith("#") && !p.includes("$"))) return "cisco";
  if (p.includes("$") || p.includes("~") || p.startsWith("/")) return "linux";
  return "windows";
}

// ─── Virtual Filesystem ────────────────────────────────────────────────────────
type FSFile = { type: "file"; content: string };
type FSDir  = { type: "dir";  children: Record<string, FSNode> };
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
                    "README.md": { type: "file", content: "# Project\nSee docs for setup instructions." },
                    "app.py": { type: "file", content: "#!/usr/bin/env python3\nprint('Hello World')" },
                  },
                },
                "config.txt": { type: "file", content: "# Network Config\nINTERFACE=eth0\nIP=192.168.1.105\nGATEWAY=192.168.1.1\nDNS=8.8.8.8\n" },
                "setup.sh": { type: "file", content: "#!/bin/bash\necho 'Starting setup...'\napt-get update -y\n" },
                "error.log": { type: "file", content: `Jul 21 08:00:01 ${hostname} systemd[1]: Started nginx.service.\nJul 21 08:02:15 ${hostname} nginx[1235]: [error] bind() to 0.0.0.0:80 failed (98: Address already in use)\nJul 21 08:05:12 ${hostname} systemd[1]: nginx.service: Main process exited, code=exited, status=1/FAILURE` },
              },
            },
          },
        },
        etc: {
          type: "dir",
          children: {
            passwd: { type: "file", content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Student,,,:/home/student:/bin/bash` },
            hosts: { type: "file", content: `127.0.0.1   localhost\n127.0.1.1   ${hostname}\n192.168.1.1 gateway.corp.local\n192.168.1.10 server01.corp.local` },
            "resolv.conf": { type: "file", content: "nameserver 192.168.1.1\nnameserver 8.8.8.8\nsearch corp.local" },
            nginx: {
              type: "dir",
              children: {
                "nginx.conf": { type: "file", content: "worker_processes 1;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/sites-enabled/*;\n  server {\n    listen 80;\n    server_name localhost;\n    root /var/www/html;\n  }\n}" },
                "sites-enabled": { type: "dir", children: { default: { type: "file", content: "server {\n    listen 80 default_server;\n    root /var/www/html;\n    index index.html;\n}" } } },
              },
            },
            ssh: {
              type: "dir",
              children: {
                "sshd_config": { type: "file", content: "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\nX11Forwarding yes\nPrintMotd no\n" },
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
                syslog: { type: "file", content: `Jul 21 08:00:00 ${hostname} systemd[1]: Started session.\nJul 21 08:00:01 ${hostname} sshd[1000]: Server listening on 0.0.0.0 port 22.` },
                auth: { type: "file", content: `Jul 21 08:30:00 ${hostname} sudo: student : TTY=pts/0 ; PWD=/home/student ; COMMAND=/bin/systemctl restart nginx` },
                nginx: {
                  type: "dir",
                  children: {
                    "access.log": { type: "file", content: `192.168.1.105 - - [21/Jul/2026:08:00:01 +0000] "GET / HTTP/1.1" 200 612\n192.168.1.110 - - [21/Jul/2026:08:05:02 +0000] "GET /api/health HTTP/1.1" 200 2` },
                    "error.log": { type: "file", content: `2026/07/21 08:02:15 [error] 1235#1235: *1 open() "/var/www/html/favicon.ico" failed (2: No such file or directory)` },
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
                    "index.html": { type: "file", content: "<!DOCTYPE html>\n<html><body><h1>It works!</h1></body></html>" },
                  },
                },
              },
            },
          },
        },
        tmp: { type: "dir", children: {} },
        root: {
          type: "dir",
          children: {
            ".bashrc": { type: "file", content: "# ~/.bashrc\nexport PS1='\\u@\\h:\\w# '\nalias ll='ls -la'\nalias la='ls -A'\n" },
          },
        },
      },
    };
    // Ensure initial cwd exists in tree (for custom prompts like /etc/nginx)
    return { root, cwd };
  }

  // Windows
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
                      "network-notes.txt": { type: "file", content: "Gateway: 192.168.1.1\nDNS: 8.8.8.8\nSubnet: 255.255.255.0" },
                    },
                  },
                  Downloads: { type: "dir", children: {} },
                  "config.txt": { type: "file", content: "[Network]\nIP=192.168.1.105\nGateway=192.168.1.1\nDNS=8.8.8.8\nSubnet=255.255.255.0\n" },
                  "report.xlsx": { type: "file", content: "[Excel spreadsheet — open in Excel to view]" },
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
                  "auth.js": { type: "file", content: "// Authentication module\nconst user = req.body.user ?? null; // fix: was req.body.user.id\nmodule.exports = { authenticate };" },
                  "package.json": { type: "file", content: '{\n  "name": "app",\n  "version": "1.0.0",\n  "scripts": {\n    "test": "jest",\n    "lint": "eslint src/"\n  }\n}' },
                  "README.md": { type: "file", content: "# App\nSee CONTRIBUTING.md for dev setup." },
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

// Path helpers
function isWin(os: OS): boolean {
  return os === "windows" || os === "powershell";
}
const WIN_SEP = "\\";
const LIN_SEP = "/";
function sep(os: OS) { return isWin(os) ? WIN_SEP : LIN_SEP; }

function splitPath(path: string, os: OS): string[] {
  return path.split(isWin(os) ? /[/\\]/ : /\//).filter(Boolean);
}

function resolvePath(cwd: string, target: string, os: OS): string {
  if (!target || target === ".") return cwd;
  const win = isWin(os);
  // Absolute
  if (!win && target.startsWith("/")) return normPath(target, os);
  if (win && /^[A-Za-z]:\\/.test(target)) return normPath(target, os);
  // Home shortcut
  const home = win ? "C:\\Users\\Admin" : "/home/student";
  if (target === "~") return home;
  if (target.startsWith("~/") || target.startsWith("~\\")) return normPath(home + sep(os) + target.slice(2), os);
  // Relative
  const parts = splitPath(cwd, os);
  for (const p of target.split(isWin(os) ? /[/\\]/ : /\//)) {
    if (p === "..") { if (parts.length > 0) parts.pop(); }
    else if (p !== ".") parts.push(p);
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
  if (!isWin(os)) return cwd === "/home/student" ? "~" : cwd.replace("/home/student", "~");
  return cwd;
}

// ─── Network / system command output ──────────────────────────────────────────
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
        return `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${hostname}\n   Primary Dns Suffix  . . . . . . . : corp.local\n   Node Type . . . . . . . . . . . . : Hybrid\n\nEthernet adapter Ethernet0:\n\n   Description . . . . . . . . . . . : Intel(R) 82574L Gigabit Network\n   Physical Address. . . . . . . . . : 00-0C-29-A1-B2-C3\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : \x1b[1;37m192.168.1.105\x1b[0m\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.1\n                                       8.8.8.8`;
      if (cl.includes("/flushdns")) return "Windows IP Configuration\n\n\x1b[32mSuccessfully flushed the DNS Resolver Cache.\x1b[0m";
      if (cl.includes("/release")) return "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   Media State . . . : Media disconnected";
      if (cl.includes("/renew")) return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : 192.168.1.107\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
      return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
    }
    if (base === "ping") {
      const t = parts[1] ?? "8.8.8.8"; const ip = t.match(/^\d/) ? t : "142.250.80.46";
      return `\nPinging ${t} [${ip}] with 32 bytes of data:\nReply from ${ip}: bytes=32 time=14ms TTL=118\nReply from ${ip}: bytes=32 time=13ms TTL=118\nReply from ${ip}: bytes=32 time=12ms TTL=118\nReply from ${ip}: bytes=32 time=14ms TTL=118\n\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 \x1b[32m(0% loss)\x1b[0m\nApproximate round trip times in milli-seconds:\n    Minimum = 12ms, Maximum = 14ms, Average = 13ms`;
    }
    if (base === "tracert") { const t = parts[1] ?? "8.8.8.8"; return `\nTracing route to ${t} over a maximum of 30 hops\n\n  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2     8 ms     7 ms     8 ms  10.0.0.1\n  3    12 ms    11 ms    12 ms  ${t}\n\nTrace complete.`; }
    if (base === "nslookup") { const t = parts[1] ?? "google.com"; return `Server:  dns.corp.local\nAddress:  192.168.1.1\n\nNon-authoritative answer:\nName:    ${t}\nAddresses:  142.250.80.46`; }
    if (base === "netstat") return `Active Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING\n  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:3389     0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:54321    142.250.80.46:443      ESTABLISHED`;
    if (base === "systeminfo") return `Host Name:                 ${hostname.toUpperCase()}\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nTotal Physical Memory:     8,192 MB\nDomain:                    corp.local\nNetwork Card(s):           1 NIC(s) Installed.\n  [01]: Intel(R) 82574L Gigabit\n        DHCP Enabled: Yes\n        IP: 192.168.1.105`;
    if (base === "tasklist") return `Image Name                     PID Session Name        Mem Usage\n========================= ======== ================ ============\nSystem Idle Process              0 Services                  8 K\nsvchost.exe                    844 Services              28,432 K\nexplorer.exe                  2560 Console              42,156 K\nchrome.exe                    3124 Console             234,432 K`;
    if (base === "taskkill") return `SUCCESS: The process "${parts.at(-1)}" has been terminated.`;
    if (cl.startsWith("net user")) { if (parts.length <= 2) return `User accounts for \\\\${hostname}\n\n-------------------------------------------------------------------------------\nAdministrator            Guest                    helpdesk\nThe command completed successfully.`; const u = parts[2] ?? "admin"; return `User name                    ${u}\nAccount active               Yes\nLocal Group Memberships      *Users\nThe command completed successfully.`; }
    if (cl.startsWith("net localgroup")) return `Alias name     Administrators\nComment        Administrators have complete and unrestricted access\n\nMembers\n-------------------------------------------------------------------------------\nAdmin\nThe command completed successfully.`;
    if (cl.startsWith("sc ")) return `SERVICE_NAME: ${parts[2] ?? "wuauserv"}\n        STATE              : 4  RUNNING\n        WIN32_EXIT_CODE    : 0  (0x0)`;
    if (cl === "sfc /scannow") return `Beginning system scan. This process will take some time.\n\nVerification 100% complete.\n\n\x1b[32mWindows Resource Protection did not find any integrity violations.\x1b[0m`;
    if (cl.startsWith("chkdsk")) return `\x1b[32mWindows has checked the file system and found no problems.\x1b[0m`;
    if (cl === "ver") return "Microsoft Windows [Version 10.0.19045.3803]";
    if (cl.startsWith("reg query")) return `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\n    ProgramFilesDir    REG_SZ    C:\\Program Files`;
    if (cl.startsWith("gpupdate")) return `Updating policy...\n\x1b[32mComputer Policy update has completed successfully.\x1b[0m`;
    if (cl.startsWith("netsh wlan show")) return `Profiles on interface Wi-Fi:\n    All User Profile     : Corp-WiFi\n    All User Profile     : CorpGuest`;
    if (cl.startsWith("netsh advfirewall")) return `Domain Profile Settings:\n----------------------------------------------------------------------\nState                                 ON\nFirewall Policy                       BlockInbound,AllowOutbound`;
    if (base === "npm") {
      if (cl.includes("install")) return `\nadded 342 packages in 12s\n\n\x1b[32m342 packages are up to date.\x1b[0m`;
      if (cl.includes("test")) return `\n> jest\n\nPASS  src/__tests__/auth.test.js\n  ✓ should return null for missing user (3 ms)\n  ✓ should authenticate valid session (5 ms)\n\nTest Suites: 1 passed, 1 total\nTests:       2 passed, 2 total\n\x1b[32mAll tests passed.\x1b[0m`;
      if (cl.includes("lint")) return `\n> eslint src/\n\n\x1b[32mNo ESLint warnings or errors found.\x1b[0m`;
      if (cl.includes("run build")) return `\n> webpack --mode production\n\nAssets built successfully.\n\x1b[32mBuild complete.\x1b[0m`;
    }
    if (cl.startsWith("git ")) {
      if (cl === "git status") return `On branch fix/login-crash\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   auth.js\n`;
      if (cl.startsWith("git add")) return "";
      if (cl.startsWith("git commit")) return `[fix/login-crash 9f3a1c2] ${cl.includes("-m") ? c.replace(/.*-m\s*["']?/, "").replace(/["'].*/, "") : "update"}\n 1 file changed, 3 insertions(+), 1 deletion(-)`;
      if (cl === "git log --oneline") return `9f3a1c2 fix login null crash\na1b2c3d initial commit\n4e5f6g0 add auth module`;
      if (cl.startsWith("git push")) return `Enumerating objects: 5, done.\nCounting objects: 100% (5/5), done.\nCompressing objects: 100% (3/3), done.\nTo https://github.com/corp/app.git\n   a1b2c3d..9f3a1c2  fix/login-crash -> fix/login-crash\n\x1b[32mBranch pushed successfully.\x1b[0m`;
      if (cl.startsWith("git pull")) return `remote: Enumerating objects: 3, done.\nFrom https://github.com/corp/app\n * branch            main -> FETCH_HEAD\n\x1b[32mAlready up to date.\x1b[0m`;
    }
    if (cl.startsWith("get-") || cl.startsWith("set-") || cl.startsWith("test-") || cl.startsWith("new-")) return `PS: command executed.\nCommandType: Cmdlet`;
  }

  if (os === "linux") {
    if (base === "ping") {
      const t = parts.find((p) => !p.startsWith("-") && p !== "ping") ?? "8.8.8.8";
      return `PING ${t} (8.8.8.8) 56(84) bytes of data.\n64 bytes from ${t}: icmp_seq=1 ttl=118 time=12.3 ms\n64 bytes from ${t}: icmp_seq=2 ttl=118 time=13.1 ms\n64 bytes from ${t}: icmp_seq=3 ttl=118 time=12.8 ms\n64 bytes from ${t}: icmp_seq=4 ttl=118 time=13.5 ms\n\n--- ${t} ping statistics ---\n4 packets transmitted, 4 received, \x1b[32m0% packet loss\x1b[0m\nrtt min/avg/max/mdev = 12.3/12.9/13.5/0.5 ms`;
    }
    if (base === "ifconfig") return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet \x1b[1;37m192.168.1.105\x1b[0m  netmask 255.255.255.0  broadcast 192.168.1.255\n        ether 00:0c:29:a1:b2:c3  txqueuelen 1000\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`;
    if (cl.startsWith("ip addr") || cl === "ip a") return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet \x1b[1;37m192.168.1.105/24\x1b[0m brd 192.168.1.255 scope global dynamic eth0\n    inet6 fe80::20c:29ff:fea1:b2c3/64 scope link`;
    if (cl.startsWith("ip route") || cl === "ip r") return `default via 192.168.1.1 dev eth0 proto dhcp metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.105`;
    if (cl.startsWith("ss ") || cl.startsWith("netstat ")) return `Netid   State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port\ntcp     LISTEN   0        511         0.0.0.0:80          0.0.0.0:*\ntcp     LISTEN   0        511         0.0.0.0:443         0.0.0.0:*\ntcp     LISTEN   0        128         0.0.0.0:22          0.0.0.0:*\ntcp     ESTAB    0        0     192.168.1.105:22    192.168.1.200:54321`;
    if (cl.startsWith("systemctl")) {
      const action = parts[1] ?? "status"; const svc = parts[2] ?? "nginx";
      if (action === "status") return `● ${svc}.service - ${svc}\n     Loaded: loaded (/lib/systemd/system/${svc}.service; enabled)\n     Active: \x1b[32mactive (running)\x1b[0m since Mon 2026-07-21 08:00:00 UTC; 30min ago\n   Main PID: 1235 (${svc})\n     Memory: 4.1M`;
      if (action === "start") return `\x1b[32m[  OK  ]\x1b[0m Started ${svc}.service.`;
      if (action === "stop") return `\x1b[33m[  OK  ]\x1b[0m Stopped ${svc}.service.`;
      if (action === "restart") return `\x1b[32m[  OK  ]\x1b[0m Restarted ${svc}.service.`;
      if (action === "enable") return `Created symlink /etc/systemd/system/multi-user.target.wants/${svc}.service → /lib/systemd/system/${svc}.service.`;
    }
    if (base === "ps") return `  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1456 pts/0    00:00:00 nginx\n 2345 pts/0    00:00:00 ps`;
    if (cl === "uname -a") return `Linux ${hostname} 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux`;
    if (cl.startsWith("apt") || cl.startsWith("apt-get")) {
      if (cl.includes("update")) return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nReading package lists... Done\n\x1b[32mAll packages are up to date.\x1b[0m`;
      if (cl.includes("install")) return `Reading package lists... Done\n0 upgraded, 1 newly installed.\n\x1b[32mSetting up ${parts[2] ?? "package"} ...\x1b[0m`;
    }
    if (base === "grep") return `matching line containing "${parts[1] ?? "pattern"}"`;
    if (base === "df") return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  37% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm`;
    if (base === "free") return `               total        used        free\nMem:         8117780     2134567     4325678\nSwap:        2097148           0     2097148`;
    if (base === "chmod" || base === "chown") return "";
    if (cl === "curl localhost" || cl === "curl http://localhost") return `\x1b[32m<!DOCTYPE html>\n<html><body><h1>It works!</h1></body></html>\x1b[0m`;
    if (base === "curl") return `  % Total    % Received % Xferd  Average Speed   Time\n  0     0    0     0    0     0      0      0\n\x1b[32m{ "status": "ok" }\x1b[0m`;
    if (base === "wget") return `--2026-07-21 08:30:00-- ${parts[1] ?? "http://example.com/"}\nResolving... 93.184.216.34\nConnecting... connected.\n\x1b[32mHTTP request sent, awaiting response... 200 OK\x1b[0m\nLength: 1256 [text/html]\nSaving to: 'index.html'\nindex.html saved.`;
    if (base === "kill") return "";
    if (base === "useradd") return "";
    if (base === "passwd") return "New password: ****\nRetype new password: ****\n\x1b[32mpasswd: password updated successfully\x1b[0m";
    if (cl.startsWith("ssh ")) return `Welcome to Ubuntu 22.04 LTS\nLast login: Mon Jul 21 07:30:00 2026`;
    if (base === "tar") return `\x1b[32mArchive extracted successfully.\x1b[0m`;
    if (cl === "history") return `  1  ls -la\n  2  cd /etc/nginx\n  3  cat nginx.conf\n  4  systemctl restart nginx\n  5  ss -tuln\n  6  history`;
    if (cl === "clear" || cl === "cls") return "\x1b[2J\x1b[H";
  }

  if (os === "cisco") {
    if (cl === "enable" || cl === "en") return "";
    if (cl === "configure terminal" || cl === "conf t") return "Enter configuration commands, one per line.  End with CNTL/Z.";
    if (cl.startsWith("show ip interface brief") || cl.startsWith("sh ip int br")) return `Interface              IP-Address      OK? Method Status                Protocol\n\x1b[32mGigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up\x1b[0m\n\x1b[32mGigabitEthernet0/1     10.0.0.1        YES NVRAM  up                    up\x1b[0m\n\x1b[31mGigabitEthernet0/2     unassigned      YES NVRAM  administratively down down\x1b[0m`;
    if (cl.startsWith("show ip route") || cl.startsWith("sh ip ro")) return `Codes: C - connected, S - static\n\n\x1b[32mC        192.168.1.0/24 is directly connected, GigabitEthernet0/0\nC        10.0.0.0/24 is directly connected, GigabitEthernet0/1\x1b[0m`;
    if (cl.startsWith("show run") || cl.startsWith("sh run")) return `Building configuration...\n\nhostname ${hostname}\n!\ninterface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\n!\nend`;
    if (cl.startsWith("show ver") || cl.startsWith("sh ver")) return `Cisco IOS Software, Version 15.4(3)M2\n${hostname} uptime is 3 hours, 45 minutes`;
    if (cl.startsWith("show int") || cl.startsWith("sh int")) return `GigabitEthernet0/0 is \x1b[32mup\x1b[0m, line protocol is \x1b[32mup\x1b[0m\n  Internet address is 192.168.1.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec`;
    if (cl.startsWith("show arp") || cl.startsWith("sh arp")) return `Protocol  Address    Age  Hardware Addr   Type   Interface\nInternet  192.168.1.105   3   000c.29a1.b2c3  ARPA   GigabitEthernet0/0`;
    if (cl === "no shutdown") return `\x1b[32m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up\x1b[0m`;
    if (cl === "shutdown") return `\x1b[33m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down\x1b[0m`;
    if (cl === "write memory" || cl === "wr" || cl.startsWith("copy run")) return "Building configuration...\n\x1b[32m[OK]\x1b[0m";
    if (base === "ping") { const t = parts[1] ?? "192.168.1.1"; return `Sending 5, 100-byte ICMP Echos to ${t}:\n!!!!!\n\x1b[32mSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms\x1b[0m`; }
    if (base === "interface" || base === "int") return "";
    if (cl.startsWith("ip address") || cl.startsWith("ip route")) return "";
    if (cl === "exit" || cl === "end") return "";
    if (cl === "reload") return "\nProceed with reload? [confirm]";
  }

  return `'${c}' is not recognized as a command, operable program or batch file.`;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function TerminalLabEngine({
  gameId,
  data,
}: {
  gameId: string;
  data: TerminalWorkspaceContent;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const fsRef = useRef<VirtualFS | null>(null);

  const currentStepRef = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const reward = useGameReward(gameId, done, 100);
  const flow = useLabModuleFlow();
  const os = detectOS(data.prompt);

  const buildPromptString = (fs: VirtualFS): string => {
    if (os === "cisco") return `\r\n\x1b[36m${data.prompt}\x1b[0m`;
    if (os === "linux") {
      const short = cwdShort(fs.cwd, os);
      return `\r\n\x1b[32mstudent@${data.hostname}:${short}$\x1b[0m `;
    }
    return `\r\n\x1b[37m${fs.cwd}>\x1b[0m `;
  };

  const handleFSCommand = (cmd: string, fs: VirtualFS): { output: string; newFS: VirtualFS } => {
    const c = cmd.trim();
    const cl = c.toLowerCase();
    const parts = c.split(/\s+/);
    const clparts = cl.split(/\s+/);
    const base = clparts[0] ?? "";

    // pwd
    if (cl === "pwd" || cl === "cd." ) return { output: fs.cwd, newFS: fs };

    // ls / dir
    if (base === "ls" || base === "dir") {
      const targetArg = parts.slice(1).find(p => !p.startsWith("-"));
      const targetPath = targetArg ? resolvePath(fs.cwd, targetArg, os) : fs.cwd;
      const node = getNode(fs.root, targetPath, os);
      if (!node) return { output: `\x1b[31mls: cannot access '${targetArg}': No such file or directory\x1b[0m`, newFS: fs };
      if (node.type === "file") return { output: targetArg ?? "", newFS: fs };
      const items = Object.entries(node.children);
      if (os === "linux") {
        if (cl.includes("-la") || cl.includes("-al")) {
          const lines = [`total ${items.length * 4}`];
          lines.push("drwxr-xr-x  2 student student 4096 Jul 21 08:30 .");
          lines.push("drwxr-xr-x 28 student student 4096 Jul 21 08:00 ..");
          for (const [name, child] of items) {
            const d = child.type === "dir";
            const perms = d ? "drwxr-xr-x" : (name.endsWith(".sh") ? "-rwxr-xr-x" : "-rw-r--r--");
            lines.push(`${perms}  1 student student 4096 Jul 21 08:30 ${d ? `\x1b[34m${name}\x1b[0m` : name}`);
          }
          return { output: lines.join("\n"), newFS: fs };
        }
        const out = items.map(([n, c]) => c.type === "dir" ? `\x1b[34m${n}\x1b[0m` : n).join("  ");
        return { output: out, newFS: fs };
      }
      // Windows dir
      const lines = [` Volume in drive C is Windows\n Directory of ${targetPath}\n`];
      for (const [n, c] of items) lines.push(`07/21/2026  08:30 AM    ${c.type === "dir" ? "<DIR>         " : "         "}   ${n}`);
      lines.push(`\n               ${items.filter(([, c]) => c.type === "file").length} File(s)\n               ${items.filter(([, c]) => c.type === "dir").length} Dir(s)  45,123,456,000 bytes free`);
      return { output: lines.join("\n"), newFS: fs };
    }

    // cd
    if (base === "cd") {
      const target = parts.slice(1).join(" ");
      if (!target) {
        const home = isWin(os) ? "C:\\Users\\Admin" : "/home/student";
        return { output: "", newFS: { ...fs, cwd: home } };
      }
      const newPath = resolvePath(fs.cwd, target, os);
      const node = getNode(fs.root, newPath, os);
      if (!node) return { output: `\x1b[31m${isWin(os) ? "The system cannot find the path specified." : `bash: cd: ${target}: No such file or directory`}\x1b[0m`, newFS: fs };
      if (node.type !== "dir") return { output: `\x1b[31m${isWin(os) ? "Not a directory." : `bash: cd: ${target}: Not a directory`}\x1b[0m`, newFS: fs };
      return { output: "", newFS: { ...fs, cwd: newPath } };
    }

    // cat / type
    if (base === "cat" || base === "type") {
      const target = parts.slice(1).join(" ");
      if (!target) return { output: `\x1b[31mcatch: missing operand\x1b[0m`, newFS: fs };
      const targetPath = resolvePath(fs.cwd, target, os);
      const node = getNode(fs.root, targetPath, os);
      if (!node) return { output: `\x1b[31m${isWin(os) ? "The system cannot find the file specified." : `cat: ${target}: No such file or directory`}\x1b[0m`, newFS: fs };
      if (node.type === "dir") return { output: `\x1b[31m${isWin(os) ? "Access is denied." : `cat: ${target}: Is a directory`}\x1b[0m`, newFS: fs };
      return { output: node.content, newFS: fs };
    }

    // mkdir / md
    if (base === "mkdir" || base === "md") {
      const name = parts.slice(1).join(" ");
      if (!name) return { output: "\x1b[31mmkdir: missing operand\x1b[0m", newFS: fs };
      const parent = getNode(fs.root, fs.cwd, os);
      if (!parent || parent.type !== "dir") return { output: "\x1b[31mNot a directory.\x1b[0m", newFS: fs };
      const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root));
      const parentNew = getNode(newRoot, fs.cwd, os) as FSDir;
      parentNew.children[name] = { type: "dir", children: {} };
      return { output: "", newFS: { ...fs, root: newRoot } };
    }

    // touch (Linux) / echo > (Windows)
    if (base === "touch") {
      const name = parts[1] ?? "";
      if (!name) return { output: "", newFS: fs };
      const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root));
      const parent = getNode(newRoot, fs.cwd, os) as FSDir;
      if (parent?.type === "dir" && !parent.children[name]) parent.children[name] = { type: "file", content: "" };
      return { output: "", newFS: { ...fs, root: newRoot } };
    }

    // rm / rmdir / del
    if (base === "rm" || base === "del" || base === "rmdir") {
      const target = parts.slice(1).find(p => !p.startsWith("-")) ?? "";
      if (!target) return { output: "\x1b[31mrm: missing operand\x1b[0m", newFS: fs };
      const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root));
      const parent = getNode(newRoot, fs.cwd, os) as FSDir;
      if (parent?.type === "dir" && parent.children[target]) {
        delete parent.children[target];
        return { output: "", newFS: { ...fs, root: newRoot } };
      }
      return { output: `\x1b[31mrm: ${target}: No such file or directory\x1b[0m`, newFS: fs };
    }

    // mv / rename
    if (base === "mv" || base === "rename" || base === "ren") {
      const src = parts[1] ?? ""; const dst = parts[2] ?? "";
      if (!src || !dst) return { output: `\x1b[31mmv: missing operand\x1b[0m`, newFS: fs };
      const newRoot: FSDir = JSON.parse(JSON.stringify(fs.root));
      const parent = getNode(newRoot, fs.cwd, os) as FSDir;
      if (parent?.type === "dir" && parent.children[src]) {
        parent.children[dst] = parent.children[src]!;
        delete parent.children[src];
        return { output: "", newFS: { ...fs, root: newRoot } };
      }
      return { output: `\x1b[31mmv: ${src}: No such file or directory\x1b[0m`, newFS: fs };
    }

    return { output: "__NOT_FS__", newFS: fs };
  };

  const initTerminal = () => {
    const container = containerRef.current;
    if (!container) return;

    const initialCwd = extractInitialCwd(data.prompt, os);
    const fs = buildDefaultFS(os, data.hostname, initialCwd);
    fsRef.current = fs;

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
        black: "#0c0c0c",  brightBlack: "#767676",
        red: "#c50f1f",    brightRed: "#ff4f4f",
        green: "#13a10e",  brightGreen: "#16c60c",
        yellow: "#c19c00", brightYellow: "#f9f1a5",
        blue: "#3b78ff",   brightBlue: "#61afef",
        magenta: "#881798",brightMagenta: "#b4009e",
        cyan: "#3a96dd",   brightCyan: "#61d6d6",
        white: "#cccccc",  brightWhite: "#f2f2f2",
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    requestAnimationFrame(() => { try { fit.fit(); } catch (_) {} });
    termRef.current = term;
    fitRef.current = fit;

    const banner = os === "windows"
      ? `Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.`
      : os === "cisco"
        ? `\r\n${data.hostname}>\r\nCisco IOS Software, Version 15.4(3)M2`
        : `Last login: Mon Jul 21 08:00:00 2026\nWelcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)`;
    banner.split("\n").forEach((l) => term.writeln(l));

    if (data.initialOutput) {
      term.writeln("");
      data.initialOutput.split("\n").forEach((l) => term.writeln(l));
    }

    term.write(buildPromptString(fsRef.current));

    let currentLine = "";
    const history: string[] = [];
    let histIdx = -1;

    term.onKey(({ key, domEvent }) => {
      const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;
      const curFs = fsRef.current!;

      if (domEvent.keyCode === 13) { // Enter
        const cmd = currentLine.trim();
        term.writeln("");
        if (cmd) {
          history.unshift(cmd);
          histIdx = -1;

          const lower = cmd.toLowerCase();
          if (lower === "cls" || lower === "clear") {
            term.clear();
            term.write(buildPromptString(fsRef.current!));
            currentLine = "";
            return;
          }

          // Try filesystem commands first
          const { output: fsOut, newFS } = handleFSCommand(cmd, curFs);
          if (fsOut !== "__NOT_FS__") {
            fsRef.current = newFS;
            if (fsOut) fsOut.split("\n").forEach((l) => term.writeln(l));
          } else {
            const out = getCommandOutput(cmd, data.hostname, os);
            if (out && out !== "\x1b[2J\x1b[H") out.split("\n").forEach((l) => term.writeln(l));
          }

          // Step validation
          const stepIdx = currentStepRef.current;
          const stepData = data.steps[stepIdx];
          if (stepData) {
            const expected = stepData.expectedCommand.trim().toLowerCase();
            const typed = cmd.trim().toLowerCase();
            if (typed === expected || typed.startsWith(expected + " ")) {
              term.writeln(`\r\n\x1b[32m✓ Step ${stepIdx + 1} complete\x1b[0m`);
              const next = stepIdx + 1;
              currentStepRef.current = next;
              setCurrentStep(next);
              setCompletedSteps((prev) => new Set([...prev, stepIdx]));
              setShowHint(false);
              if (next >= data.steps.length) {
                term.writeln("\x1b[32;1m\r\n╔══════════════════════════════════╗\r\n║   Lab complete! All steps done.  ║\r\n╚══════════════════════════════════╝\x1b[0m");
                setDone(true);
                return;
              }
            }
          }
        }
        term.write(buildPromptString(fsRef.current!));
        currentLine = "";
      } else if (domEvent.keyCode === 8) {
        if (currentLine.length > 0) { currentLine = currentLine.slice(0, -1); term.write("\b \b"); }
      } else if (domEvent.keyCode === 38) {
        if (histIdx < history.length - 1) { histIdx++; const prev = history[histIdx] ?? ""; term.write("\b \b".repeat(currentLine.length)); term.write(prev); currentLine = prev; }
      } else if (domEvent.keyCode === 40) {
        if (histIdx > 0) { histIdx--; const next = history[histIdx] ?? ""; term.write("\b \b".repeat(currentLine.length)); term.write(next); currentLine = next; }
      } else if (domEvent.keyCode === 9) {
        // Tab completion
        domEvent.preventDefault();
        const partial = currentLine.split(/\s+/).at(-1) ?? "";
        if (partial && fsRef.current) {
          const curDir = getNode(fsRef.current.root, fsRef.current.cwd, os) as FSDir | null;
          if (curDir?.type === "dir") {
            const matches = Object.keys(curDir.children).filter(n => n.toLowerCase().startsWith(partial.toLowerCase()));
            if (matches.length === 1) {
              const completion = matches[0]!.slice(partial.length);
              currentLine += completion;
              term.write(completion);
            }
          }
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });
  };

  useEffect(() => {
    initTerminal();
    return () => { termRef.current?.dispose(); termRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onResize = () => { try { fitRef.current?.fit(); } catch (_) {} };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleRetry = () => {
    termRef.current?.dispose();
    termRef.current = null;
    currentStepRef.current = 0;
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setDone(false);
    setShowHint(false);
    requestAnimationFrame(initTerminal);
  };

  const currentStepData = data.steps[currentStep];

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-card overflow-hidden">
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
          <span className="h-3 w-3 rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-yellow-500" /><span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2">{data.hostname} — {data.title}</span>
        </div>
        <div className="p-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <p className="text-xl font-semibold">Lab Complete</p>
          <p className="text-sm text-muted-foreground">All {data.steps.length} steps completed successfully.</p>
          <GameRewardBanner reward={reward} />
          <div className="flex gap-2 justify-center flex-wrap">
            {flow?.inFlow ? (
              <Button onClick={flow.onPracticeComplete}>{flow.practiceCompleteLabel}<ArrowRight className="ml-2 h-4 w-4" /></Button>
            ) : null}
            <Button variant="outline" onClick={handleRetry}><RotateCcw className="mr-2 h-4 w-4" />Repeat lab</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
        <span className="h-3 w-3 rounded-full bg-red-500" /><span className="h-3 w-3 rounded-full bg-yellow-500" /><span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 flex-1">{data.hostname} — {data.title}</span>
        <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">
          {os === "cisco" ? "Cisco IOS" : os === "linux" ? "Linux Bash" : os === "powershell" ? "PowerShell" : "Windows CMD"}
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 min-w-0 bg-[#0c0c0c]">
          <div ref={containerRef} className="w-full" style={{ height: 340 }} />
        </div>

        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lab Steps — {completedSteps.size}/{data.steps.length}
            </p>
          </div>

          <div className="p-2 text-xs text-muted-foreground border-b border-border leading-snug px-3 py-2">
            {data.brief}
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {data.steps.map((step, i) => {
              const done_ = completedSteps.has(i);
              const cur = i === currentStep && !done;
              return (
                <div key={i} className={`rounded-lg px-3 py-2 text-xs transition-colors ${done_ ? "bg-emerald-500/10 border border-emerald-500/20" : cur ? "bg-blue-500/10 border border-blue-500/30" : "border border-transparent text-muted-foreground"}`}>
                  <div className="flex items-start gap-2">
                    {done_ ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> : cur ? <CircleDot className="h-4 w-4 text-blue-500 mt-0.5 shrink-0 animate-pulse" /> : <Circle className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />}
                    <span className={done_ ? "line-through text-muted-foreground" : ""}>{step.instruction}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStepData && !done && (
            <div className="border-t border-border p-3 space-y-2">
              <p className="text-xs font-medium">Step {currentStep + 1}: {currentStepData.instruction}</p>
              <Button size="sm" variant="ghost" className="w-full text-xs h-7" onClick={() => setShowHint((v) => !v)}>
                <HelpCircle className="h-3 w-3 mr-1" />{showHint ? "Hide hint" : "Show hint"}
              </Button>
              {showHint && (
                <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 font-mono">
                  {currentStepData.hint ?? currentStepData.expectedCommand}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
