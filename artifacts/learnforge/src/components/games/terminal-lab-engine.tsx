import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import {
  ArrowRight,
  Check,
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

type OS = "windows" | "linux" | "cisco" | "powershell";

function detectOS(prompt: string): OS {
  const p = prompt.toLowerCase();
  if (p.startsWith("ps ") || p.includes("powershell")) return "powershell";
  if (
    p.includes("router") ||
    p.includes("switch") ||
    p.includes("firewall") ||
    (p.endsWith("#") && !p.includes("$"))
  )
    return "cisco";
  if (p.includes("$") || p.includes("~") || p.startsWith("/")) return "linux";
  return "windows";
}

function getCommandOutput(cmd: string, hostname: string, os: OS): string {
  const c = cmd.trim();
  const cl = c.toLowerCase();
  const parts = cl.split(/\s+/);
  const base = parts[0] ?? "";

  if (cl === "cls" || cl === "clear") return "\x1b[2J\x1b[H";
  if (base === "echo") return c.slice(5);
  if (cl === "hostname") return hostname;
  if (cl === "whoami") return os === "windows" ? `${hostname}\\admin` : "student";
  if (cl === "ver" || cl === "version") return "Microsoft Windows [Version 10.0.19045.3803]";

  if (os === "windows" || os === "powershell") {
    if (base === "ipconfig") {
      if (cl.includes("/all"))
        return `Windows IP Configuration\n\n   Host Name . . . . . . . . . . . . : ${hostname}\n   Primary Dns Suffix  . . . . . . . : corp.local\n   Node Type . . . . . . . . . . . . : Hybrid\n   IP Routing Enabled. . . . . . . . : No\n\nEthernet adapter Ethernet0:\n\n   Connection-specific DNS Suffix  . : corp.local\n   Description . . . . . . . . . . . : Intel(R) 82574L Gigabit Network\n   Physical Address. . . . . . . . . : 00-0C-29-A1-B2-C3\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : \x1b[1;37m192.168.1.105\x1b[0m\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.1\n   DNS Servers . . . . . . . . . . . : 192.168.1.1\n                                       8.8.8.8`;
      if (cl.includes("/flushdns"))
        return "Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.";
      if (cl.includes("/release"))
        return "Windows IP Configuration\n\nEthernet adapter Ethernet0:\n   Media State . . . : Media disconnected";
      if (cl.includes("/renew"))
        return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   Connection-specific DNS Suffix  . : corp.local\n   IPv4 Address. . . . . . . . . . . : 192.168.1.107\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
      return `Windows IP Configuration\n\nEthernet adapter Ethernet0:\n\n   Connection-specific DNS Suffix  . : corp.local\n   IPv4 Address. . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1`;
    }
    if (base === "ping") {
      const target = parts[1] ?? "8.8.8.8";
      const ip = target.match(/^\d+\.\d+/) ? target : "142.250.80.46";
      return `\nPinging ${target} [${ip}] with 32 bytes of data:\nReply from ${ip}: bytes=32 time=14ms TTL=118\nReply from ${ip}: bytes=32 time=13ms TTL=118\nReply from ${ip}: bytes=32 time=12ms TTL=118\nReply from ${ip}: bytes=32 time=14ms TTL=118\n\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 \x1b[32m(0% loss)\x1b[0m\nApproximate round trip times in milli-seconds:\n    Minimum = 12ms, Maximum = 14ms, Average = 13ms`;
    }
    if (base === "tracert") {
      const t = parts[1] ?? "8.8.8.8";
      return `\nTracing route to ${t} over a maximum of 30 hops\n\n  1    <1 ms    <1 ms    <1 ms  192.168.1.1\n  2     8 ms     7 ms     8 ms  10.0.0.1\n  3    12 ms    11 ms    12 ms  72.14.215.165\n  4    13 ms    13 ms    13 ms  ${t}\n\nTrace complete.`;
    }
    if (base === "nslookup") {
      const t = parts[1] ?? "google.com";
      return `Server:  dns.corp.local\nAddress:  192.168.1.1\n\nNon-authoritative answer:\nName:    ${t}\nAddresses:  142.250.80.46\n          2607:f8b0:4004:c06::71`;
    }
    if (base === "netstat")
      return `Active Connections\n\n  Proto  Local Address          Foreign Address        State\n  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING\n  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:3389     0.0.0.0:0              LISTENING\n  TCP    192.168.1.105:54321    142.250.80.46:443      ESTABLISHED\n  TCP    192.168.1.105:54322    151.101.1.140:443      ESTABLISHED`;
    if (base === "systeminfo")
      return `Host Name:                 ${hostname.toUpperCase()}\nOS Name:                   Microsoft Windows 10 Pro\nOS Version:                10.0.19045 N/A Build 19045\nTotal Physical Memory:     8,192 MB\nAvailable Physical Memory: 5,432 MB\nDomain:                    corp.local\nNetwork Card(s):           1 NIC(s) Installed.\n  [01]: Intel(R) 82574L Gigabit\n        DHCP Enabled: Yes\n        IP: 192.168.1.105`;
    if (base === "tasklist")
      return `Image Name                     PID Session Name        Mem Usage\n========================= ======== ================ ============\nSystem Idle Process              0 Services                  8 K\nsvchost.exe                    844 Services              28,432 K\nexplorer.exe                  2560 Console              42,156 K\nchrome.exe                    3124 Console             234,432 K`;
    if (base === "taskkill")
      return `SUCCESS: The process "${parts.at(-1)}" has been terminated.`;
    if (cl.startsWith("net user")) {
      if (parts.length <= 2)
        return `User accounts for \\\\${hostname}\n\n-------------------------------------------------------------------------------\nAdministrator            Guest                    helpdesk\nThe command completed successfully.`;
      const u = parts[2] ?? "admin";
      return `User name                    ${u}\nFull Name                    ${u} User\nAccount active               Yes\nLast logon                   7/21/2026 8:30:00 AM\nLocal Group Memberships      *Users\nThe command completed successfully.`;
    }
    if (cl.startsWith("sc "))
      return `SERVICE_NAME: ${parts[2] ?? "wuauserv"}\n        STATE              : 4  RUNNING\n        WIN32_EXIT_CODE    : 0  (0x0)`;
    if (cl === "sfc /scannow")
      return `Beginning system scan. This process will take some time.\n\nVerification 100% complete.\n\n\x1b[32mWindows Resource Protection did not find any integrity violations.\x1b[0m`;
    if (cl.startsWith("chkdsk"))
      return `The type of the file system is NTFS.\n\nStage 1: Examining basic file system structure ...\n  395264 file records processed.\n\n\x1b[32mWindows has checked the file system and found no problems.\x1b[0m`;
    if (base === "dir")
      return ` Volume in drive C is Windows\n Volume Serial Number is 1234-5678\n\n Directory of C:\\Users\\Admin\n\n07/21/2026  08:30 AM    <DIR>          Desktop\n07/21/2026  08:30 AM    <DIR>          Documents\n07/15/2026  02:14 PM             4,267 report.xlsx\n07/20/2026  11:22 AM             1,024 config.txt\n               2 File(s)      5,291 bytes\n               4 Dir(s)  45,123,456,000 bytes free`;
    if (cl.startsWith("reg query"))
      return `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\n    ProgramFilesDir    REG_SZ    C:\\Program Files`;
    if (cl.startsWith("gpupdate"))
      return `Updating policy...\n\x1b[32mComputer Policy update has completed successfully.\x1b[0m\n\x1b[32mUser Policy update has completed successfully.\x1b[0m`;
    if (cl.startsWith("netsh wlan show"))
      return `Profiles on interface Wi-Fi:\n\n    All User Profile     : Corp-WiFi\n    All User Profile     : CorpGuest`;
    if (cl.startsWith("netsh advfirewall"))
      return `Domain Profile Settings:\n----------------------------------------------------------------------\nState                                 ON\nFirewall Policy                       BlockInbound,AllowOutbound`;
    if (cl.startsWith("get-process") || cl.startsWith("get-service") || cl.startsWith("test-net") || cl.startsWith("get-net"))
      return `PS output: command executed successfully.`;
    if (base === "cd" || base === "mkdir" || base === "md" || base === "del" || base === "copy" || base === "move") return "";
    if (base === "type") return `[Contents of ${parts[1] ?? "file.txt"}]`;
  }

  if (os === "linux") {
    if (base === "ls") {
      if (cl.includes("-la") || cl.includes("-al"))
        return `total 48\ndrwxr-xr-x  6 student student 4096 Jul 21 08:30 .\ndrwxr-xr-x 28 student student 4096 Jul 21 08:00 ..\n-rw-r--r--  1 student student  220 Jan 15 09:00 .bash_logout\n-rw-r--r--  1 student student 3526 Jan 15 09:00 .bashrc\ndrwxr-xr-x  2 student student 4096 Jul 21 08:30 \x1b[34mDesktop\x1b[0m\ndrwxr-xr-x  2 student student 4096 Jul 21 08:30 \x1b[34mDocuments\x1b[0m\n-rw-r--r--  1 student student 1234 Jul 21 08:15 config.txt\n-rwxr-xr-x  1 student student  512 Jul 21 08:20 \x1b[32msetup.sh\x1b[0m`;
      if (cl.includes("-l"))
        return `total 32\ndrwxr-xr-x 2 student student 4096 Jul 21 Desktop\ndrwxr-xr-x 2 student student 4096 Jul 21 Documents\n-rw-r--r-- 1 student student 1234 Jul 21 config.txt\n-rwxr-xr-x 1 student student  512 Jul 21 setup.sh`;
      return `\x1b[34mDesktop\x1b[0m  \x1b[34mDocuments\x1b[0m  \x1b[34mDownloads\x1b[0m  config.txt  \x1b[32msetup.sh\x1b[0m`;
    }
    if (base === "pwd") return `/home/student`;
    if (base === "cat") {
      const f = parts[1] ?? "";
      if (f.includes("passwd")) return `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nstudent:x:1000:1000:Student,,,:/home/student:/bin/bash`;
      if (f.includes("hosts")) return `127.0.0.1   localhost\n127.0.1.1   ${hostname}\n192.168.1.1 gateway.corp.local`;
      if (f.includes("os-release")) return `PRETTY_NAME="Ubuntu 22.04.3 LTS"\nNAME="Ubuntu"\nVERSION_ID="22.04"`;
      return `[Contents of ${f}]`;
    }
    if (base === "ping") {
      const t = parts.find((p) => !p.startsWith("-") && p !== "ping") ?? "8.8.8.8";
      return `PING ${t} (8.8.8.8) 56(84) bytes of data.\n64 bytes from ${t}: icmp_seq=1 ttl=118 time=12.3 ms\n64 bytes from ${t}: icmp_seq=2 ttl=118 time=13.1 ms\n64 bytes from ${t}: icmp_seq=3 ttl=118 time=12.8 ms\n64 bytes from ${t}: icmp_seq=4 ttl=118 time=13.5 ms\n\n--- ${t} ping statistics ---\n4 packets transmitted, 4 received, \x1b[32m0% packet loss\x1b[0m, time 3004ms\nrtt min/avg/max/mdev = 12.3/12.9/13.5/0.5 ms`;
    }
    if (base === "ifconfig")
      return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet \x1b[1;37m192.168.1.105\x1b[0m  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::20c:29ff:fea1:b2c3  prefixlen 64  scopeid 0x20<link>\n        ether 00:0c:29:a1:b2:c3  txqueuelen 1000  (Ethernet)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0`;
    if (cl.startsWith("ip addr") || cl === "ip a")
      return `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    inet \x1b[1;37m192.168.1.105/24\x1b[0m brd 192.168.1.255 scope global dynamic eth0\n    inet6 fe80::20c:29ff:fea1:b2c3/64 scope link`;
    if (cl.startsWith("ip route") || cl === "ip r")
      return `default via 192.168.1.1 dev eth0 proto dhcp metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.105`;
    if (cl.startsWith("systemctl")) {
      const action = parts[1] ?? "status";
      const svc = parts[2] ?? "nginx";
      if (action === "status")
        return `● ${svc}.service - ${svc} HTTP Server\n     Loaded: loaded (/lib/systemd/system/${svc}.service; enabled)\n     Active: \x1b[32mactive (running)\x1b[0m since Mon 2026-07-21 08:00:00 UTC; 30min ago\n   Main PID: 1235 (${svc})\n     Memory: 4.1M`;
      if (action === "start") return `\x1b[32m[  OK  ]\x1b[0m Started ${svc}.service.`;
      if (action === "stop") return `\x1b[33m[  OK  ]\x1b[0m Stopped ${svc}.service.`;
      if (action === "restart") return `\x1b[32m[  OK  ]\x1b[0m Restarted ${svc}.service.`;
      if (action === "enable")
        return `Created symlink /etc/systemd/system/multi-user.target.wants/${svc}.service → /lib/systemd/system/${svc}.service.`;
    }
    if (base === "ps") return `  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1456 pts/0    00:00:00 apache2\n 2345 pts/0    00:00:00 ps`;
    if (cl === "uname -a")
      return `Linux ${hostname} 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 2023 x86_64 GNU/Linux`;
    if (cl.startsWith("apt") || cl.startsWith("apt-get")) {
      if (cl.includes("update"))
        return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nGet:2 http://security.ubuntu.com/ubuntu jammy-security InRelease\nReading package lists... Done\n\x1b[32mAll packages are up to date.\x1b[0m`;
      if (cl.includes("install"))
        return `Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed.\n\x1b[32mSetting up ${parts[2] ?? "package"} ...\x1b[0m`;
    }
    if (base === "grep") return `matching line containing "${parts[1] ?? "pattern"}"`;
    if (base === "df") return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  37% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm`;
    if (base === "free")
      return `               total        used        free\nMem:         8117780     2134567     4325678\nSwap:        2097148           0     2097148`;
    if (base === "chmod" || base === "chown" || base === "mkdir" || base === "rm" || base === "cp" || base === "mv" || base === "touch") return "";
    if (cl.startsWith("ssh"))
      return `Welcome to Ubuntu 22.04 LTS\nLast login: Mon Jul 21 07:30:00 2026 from 192.168.1.105`;
  }

  if (os === "cisco") {
    if (cl === "enable" || cl === "en") return "";
    if (cl === "configure terminal" || cl === "conf t")
      return "Enter configuration commands, one per line.  End with CNTL/Z.";
    if (cl.startsWith("show ip interface brief") || cl.startsWith("sh ip int br"))
      return `Interface              IP-Address      OK? Method Status                Protocol\n\x1b[32mGigabitEthernet0/0     192.168.1.1     YES NVRAM  up                    up\x1b[0m\n\x1b[32mGigabitEthernet0/1     10.0.0.1        YES NVRAM  up                    up\x1b[0m\n\x1b[31mGigabitEthernet0/2     unassigned      YES NVRAM  administratively down down\x1b[0m`;
    if (cl.startsWith("show ip route") || cl.startsWith("sh ip ro"))
      return `Codes: C - connected, S - static, O - OSPF\n\nGateway of last resort is not set\n\n\x1b[32mC\x1b[0m        192.168.1.0/24 is directly connected, GigabitEthernet0/0\n\x1b[32mC\x1b[0m        10.0.0.0/24 is directly connected, GigabitEthernet0/1`;
    if (cl.startsWith("show run") || cl.startsWith("sh run"))
      return `Building configuration...\n\nCurrent configuration : 1234 bytes\n!\nhostname ${hostname}\n!\ninterface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown\n!\ninterface GigabitEthernet0/1\n ip address 10.0.0.1 255.255.255.0\n no shutdown\n!\nend`;
    if (cl.startsWith("show ver") || cl.startsWith("sh ver"))
      return `Cisco IOS Software, Version 15.4(3)M2\nCopyright (c) 1986-2015 by Cisco Systems, Inc.\n\n${hostname} uptime is 3 hours, 45 minutes\nCisco 2901 with 262144K bytes of memory.`;
    if (cl.startsWith("show int") || cl.startsWith("sh int"))
      return `GigabitEthernet0/0 is \x1b[32mup\x1b[0m, line protocol is \x1b[32mup\x1b[0m\n  Internet address is 192.168.1.1/24\n  MTU 1500 bytes, BW 1000000 Kbit/sec\n  Full Duplex, 1000Mbps, media type is RJ45`;
    if (cl.startsWith("show arp") || cl.startsWith("sh arp"))
      return `Protocol  Address          Age (min)  Hardware Addr   Type   Interface\nInternet  192.168.1.1             -   0000.0c11.1111  ARPA   GigabitEthernet0/0\nInternet  192.168.1.105           3   000c.29a1.b2c3  ARPA   GigabitEthernet0/0`;
    if (cl === "no shutdown")
      return `\x1b[32m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to up\x1b[0m\n\x1b[32m%LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet0/1, changed state to up\x1b[0m`;
    if (cl === "shutdown")
      return `\x1b[33m%LINK-5-CHANGED: Interface GigabitEthernet0/1, changed state to administratively down\x1b[0m`;
    if (cl === "write memory" || cl === "wr" || cl.startsWith("copy run"))
      return "Building configuration...\n\x1b[32m[OK]\x1b[0m";
    if (base === "ping") {
      const t = parts[1] ?? "192.168.1.1";
      return `Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ${t}, timeout is 2 seconds:\n!!!!!\n\x1b[32mSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms\x1b[0m`;
    }
    if (base === "interface" || base === "int") return "";
    if (cl.startsWith("ip address") || cl.startsWith("ip route")) return "";
    if (cl === "exit" || cl === "end") return "";
    if (cl === "reload") return "\nProceed with reload? [confirm]";
  }

  return `'${c}' is not recognized as an internal or external command.`;
}

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

  const currentStepRef = useRef(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const reward = useGameReward(gameId, done, 100);
  const flow = useLabModuleFlow();
  const os = detectOS(data.prompt);

  const writePrompt = (term: Terminal) => {
    term.write(`\r\n\x1b[32m${data.prompt}\x1b[0m`);
  };

  const initTerminal = () => {
    const container = containerRef.current;
    if (!container) return;

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
        black: "#0c0c0c",
        brightBlack: "#767676",
        red: "#c50f1f",
        brightRed: "#ff4f4f",
        green: "#13a10e",
        brightGreen: "#16c60c",
        yellow: "#c19c00",
        brightYellow: "#f9f1a5",
        blue: "#3b78ff",
        brightBlue: "#61afef",
        magenta: "#881798",
        brightMagenta: "#b4009e",
        cyan: "#3a96dd",
        brightCyan: "#61d6d6",
        white: "#cccccc",
        brightWhite: "#f2f2f2",
      },
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);

    requestAnimationFrame(() => {
      try {
        fit.fit();
      } catch (_) {}
    });

    termRef.current = term;
    fitRef.current = fit;

    const banner =
      os === "windows"
        ? `Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.`
        : os === "cisco"
          ? `\r\n${data.hostname}>\r\nCisco IOS Software, Version 15.4(3)M2\r\nType 'enable' to enter privileged mode.`
          : `Last login: Mon Jul 21 08:00:00 2026 from 192.168.1.200\nWelcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)`;

    banner.split("\n").forEach((line) => term.writeln(line));

    if (data.initialOutput) {
      term.writeln("");
      data.initialOutput.split("\n").forEach((line) => term.writeln(line));
    }

    writePrompt(term);

    let currentLine = "";
    let historyIndex = -1;
    const history: string[] = [];

    term.onKey(({ key, domEvent }) => {
      const printable =
        !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

      if (domEvent.keyCode === 13) {
        const cmd = currentLine.trim();
        term.writeln("");
        if (cmd) {
          history.unshift(cmd);
          historyIndex = -1;
          if (cmd.toLowerCase() === "cls" || cmd.toLowerCase() === "clear") {
            term.clear();
          } else {
            const output = getCommandOutput(cmd, data.hostname, os);
            if (output && output !== "\x1b[2J\x1b[H") {
              output.split("\n").forEach((line) => term.writeln(line));
            }
            const stepIdx = currentStepRef.current;
            const stepData = data.steps[stepIdx];
            if (stepData) {
              const expected = stepData.expectedCommand.trim().toLowerCase();
              const typed = cmd.trim().toLowerCase();
              const isCorrect =
                typed === expected || typed.startsWith(expected + " ");
              if (isCorrect) {
                term.writeln(
                  `\r\n\x1b[32m✓ Step ${stepIdx + 1} complete\x1b[0m`,
                );
                const next = stepIdx + 1;
                currentStepRef.current = next;
                setCurrentStep(next);
                setCompletedSteps((prev) => new Set([...prev, stepIdx]));
                setShowHint(false);
                if (next >= data.steps.length) {
                  term.writeln(
                    "\x1b[32;1m\r\n╔══════════════════════════════════╗\r\n║   Lab complete! All steps done.  ║\r\n╚══════════════════════════════════╝\x1b[0m",
                  );
                  setDone(true);
                  return;
                }
              }
            }
          }
          writePrompt(term);
          currentLine = "";
        } else {
          writePrompt(term);
          currentLine = "";
        }
      } else if (domEvent.keyCode === 8) {
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          term.write("\b \b");
        }
      } else if (domEvent.keyCode === 38) {
        if (historyIndex < history.length - 1) {
          historyIndex++;
          const prev = history[historyIndex] ?? "";
          term.write("\b \b".repeat(currentLine.length));
          term.write(prev);
          currentLine = prev;
        }
      } else if (domEvent.keyCode === 40) {
        if (historyIndex > 0) {
          historyIndex--;
          const next = history[historyIndex] ?? "";
          term.write("\b \b".repeat(currentLine.length));
          term.write(next);
          currentLine = next;
        }
      } else if (printable) {
        currentLine += key;
        term.write(key);
      }
    });
  };

  useEffect(() => {
    initTerminal();
    return () => {
      termRef.current?.dispose();
      termRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      try {
        fitRef.current?.fit();
      } catch (_) {}
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRetry = () => {
    termRef.current?.dispose();
    termRef.current = null;
    currentStepRef.current = 0;
    setCurrentStep(0);
    setCompletedSteps(new Set());
    setDone(false);
    setShowHint(false);
    requestAnimationFrame(() => {
      initTerminal();
    });
  };

  const currentStepData = data.steps[currentStep];

  if (done) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-card overflow-hidden">
        <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2">{data.hostname} — {data.title}</span>
        </div>
        <div className="p-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
          <p className="text-xl font-semibold">Lab Complete</p>
          <p className="text-sm text-muted-foreground">
            All {data.steps.length} steps completed successfully.
          </p>
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

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="bg-zinc-900 px-3 py-2 flex items-center gap-2 text-zinc-300 text-xs font-mono">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 flex-1">{data.hostname} — {data.title}</span>
        <Badge variant="outline" className="text-zinc-400 border-zinc-600 text-xs">
          {os === "cisco" ? "Cisco IOS" : os === "linux" ? "Linux Bash" : os === "powershell" ? "PowerShell" : "Windows CMD"}
        </Badge>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 min-w-0 bg-[#0c0c0c]">
          <div ref={containerRef} className="w-full" style={{ height: 320 }} />
        </div>

        <div className="lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card flex flex-col">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Lab Steps — {completedSteps.size}/{data.steps.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {data.steps.map((step, i) => {
              const isComplete = completedSteps.has(i);
              const isCurrent = i === currentStep && !done;
              return (
                <div
                  key={i}
                  className={`rounded-lg px-3 py-2 text-xs transition-colors ${
                    isComplete
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : isCurrent
                        ? "bg-blue-500/10 border border-blue-500/30"
                        : "border border-transparent text-muted-foreground"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : isCurrent ? (
                      <CircleDot className="h-4 w-4 text-blue-500 mt-0.5 shrink-0 animate-pulse" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                    )}
                    <span className={isComplete ? "line-through text-muted-foreground" : ""}>
                      {step.instruction}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {currentStepData && !done && (
            <div className="border-t border-border p-3 space-y-2">
              <p className="text-xs font-medium">
                Step {currentStep + 1}: {currentStepData.instruction}
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="w-full text-xs h-7"
                onClick={() => setShowHint((v) => !v)}
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                {showHint ? "Hide hint" : "Show hint"}
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
