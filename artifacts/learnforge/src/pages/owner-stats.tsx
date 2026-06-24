import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, Users, UserCheck, Activity, Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Summary = {
  days: number;
  since: string;
  totals: {
    pageviews: number;
    events: number;
    uniqueVisitors: number;
    signedInVisitors: number;
  };
  daily: { day: string; pageviews: number; visitors: number }[];
  topPaths: { path: string; views: number }[];
  topEvents: { type: string; count: number }[];
  recent: {
    eventType: string;
    path: string | null;
    signedIn: boolean;
    createdAt: string;
  }[];
};

const RANGES = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
];

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function prettyEvent(type: string): string {
  return type
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnerStats() {
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ["analytics-summary", days],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/summary?days=${days}`, {
        credentials: "include",
      });
      if (res.status === 403) throw new Error("forbidden");
      if (!res.ok) throw new Error("Failed to load analytics");
      return (await res.json()) as Summary;
    },
  });

  if (error instanceof Error && error.message === "forbidden") {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Owner access only
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is restricted to the site owner.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Couldn't load Site Stats
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong fetching your analytics. Please try again.
        </p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <BarChart3 className="h-6 w-6 text-primary" />
            Site Stats
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visitors and activity across your site. Only you can see this.
          </p>
        </div>
        <div className="flex gap-1.5">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              size="sm"
              variant={days === r.value ? "default" : "outline"}
              onClick={() => setDays(r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={<Eye className="h-5 w-5" />}
              label="Page views"
              value={data.totals.pageviews}
            />
            <StatTile
              icon={<Users className="h-5 w-5" />}
              label="Unique visitors"
              value={data.totals.uniqueVisitors}
            />
            <StatTile
              icon={<UserCheck className="h-5 w-5" />}
              label="Signed-in users"
              value={data.totals.signedInVisitors}
            />
            <StatTile
              icon={<Activity className="h-5 w-5" />}
              label="Total events"
              value={data.totals.events}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Daily traffic (last {data.days} days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.daily.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No activity recorded yet in this range.
                </p>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.daily}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(224 85% 52%)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(224 85% 52%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                        <linearGradient id="vis" x1="0" y1="0" x2="0" y2="1">
                          <stop
                            offset="5%"
                            stopColor="hsl(160 70% 42%)"
                            stopOpacity={0.35}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(160 70% 42%)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(220 14% 90%)"
                      />
                      <XAxis
                        dataKey="day"
                        tickFormatter={(d: string) => d.slice(5)}
                        fontSize={12}
                        stroke="hsl(220 12% 46%)"
                      />
                      <YAxis
                        allowDecimals={false}
                        fontSize={12}
                        stroke="hsl(220 12% 46%)"
                      />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="pageviews"
                        name="Page views"
                        stroke="hsl(224 85% 52%)"
                        fill="url(#pv)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        name="Visitors"
                        stroke="hsl(160 70% 42%)"
                        fill="url(#vis)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top pages</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topPaths.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.topPaths.map((p) => (
                      <li
                        key={p.path}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate font-mono text-foreground">
                          {p.path}
                        </span>
                        <span className="shrink-0 font-semibold text-muted-foreground">
                          {p.views.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top actions</CardTitle>
              </CardHeader>
              <CardContent>
                {data.topEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No tracked actions yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.topEvents.map((e) => (
                      <li
                        key={e.type}
                        className="flex items-center justify-between gap-3 text-sm"
                      >
                        <span className="truncate text-foreground">
                          {prettyEvent(e.type)}
                        </span>
                        <span className="shrink-0 font-semibold text-muted-foreground">
                          {e.count.toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {data.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <ul className="divide-y divide-card-border">
                  {data.recent.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {r.signedIn ? "user" : "visitor"}
                        </span>
                        <span className="truncate text-foreground">
                          {r.eventType === "pageview"
                            ? r.path || "(page)"
                            : prettyEvent(r.eventType)}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {timeAgo(r.createdAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
