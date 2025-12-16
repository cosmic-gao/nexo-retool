import { useRegistry, usePermission } from "@nexoc/core";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const statsData = [
  {
    label: "Total Revenue",
    value: "$1,250.00",
    change: "+12.5%",
    trend: "up",
    description: "Trending up this month",
    subtext: "Visitors for the last 6 months",
    color: "text-emerald-600",
  },
  {
    label: "New Customers",
    value: "1,234",
    change: "-20%",
    trend: "down",
    description: "Down 20% this period",
    subtext: "Acquisition needs attention",
    color: "text-red-500",
  },
  {
    label: "Active Accounts",
    value: "45,678",
    change: "+12.5%",
    trend: "up",
    description: "Strong user retention",
    subtext: "Engagement exceed targets",
    color: "text-emerald-600",
  },
  {
    label: "Growth Rate",
    value: "4.5%",
    change: "+4.5%",
    trend: "up",
    description: "Steady performance increase",
    subtext: "Meets growth projections",
    color: "text-emerald-600",
  },
];

const chartData = [
  { date: "Jun 24", value: 180 },
  { date: "Jun 25", value: 220 },
  { date: "Jun 26", value: 150 },
  { date: "Jun 27", value: 280 },
  { date: "Jun 28", value: 200 },
  { date: "Jun 29", value: 320 },
  { date: "Jun 30", value: 280 },
];

const tableData = [
  {
    id: 1,
    header: "Cover page",
    type: "Cover page",
    status: "In Process",
    target: 18,
    limit: 5,
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Table of contents",
    type: "Table of contents",
    status: "Done",
    target: 29,
    limit: 24,
    reviewer: "Eddie Lake",
  },
  {
    id: 3,
    header: "Executive summary",
    type: "Narrative",
    status: "Done",
    target: 10,
    limit: 13,
    reviewer: "Eddie Lake",
  },
];

const tabs = [
  "Outline",
  "Past Performance",
  "Key Personnel",
  "Focus Documents",
];

function SimpleAreaChart() {
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const minValue = Math.min(...chartData.map((d) => d.value));
  const range = maxValue - minValue;

  const width = 100;
  const height = 40;
  const padding = 2;

  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((d.value - minValue) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points.reduce((acc, point, i) => {
    if (i === 0) return `M ${point.x} ${point.y}`;
    const prev = points[i - 1];
    const cpx = (prev.x + point.x) / 2;
    return `${acc} Q ${cpx} ${prev.y} ${point.x} ${point.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(107, 114, 128)" stopOpacity="0.3" />
          <stop
            offset="100%"
            stopColor="rgb(107, 114, 128)"
            stopOpacity="0.05"
          />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGradient)" />
      <path
        d={pathD}
        fill="none"
        stroke="rgb(107, 114, 128)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function StatCard({ stat }: { stat: (typeof statsData)[0] }) {
  return (
    <Card className="p-5 border border-border bg-card">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{stat.label}</span>
        <div
          className={`flex items-center gap-1 text-xs font-medium ${stat.color}`}
        >
          {stat.trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {stat.change}
        </div>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-semibold tracking-tight">
          {stat.value}
        </span>
      </div>
      <div className="space-y-0.5">
        <p className={`text-xs font-medium ${stat.color}`}>
          {stat.description}
          {stat.trend === "up" ? (
            <TrendingUp className="inline h-3 w-3 ml-1" />
          ) : (
            <TrendingDown className="inline h-3 w-3 ml-1" />
          )}
        </p>
        <p className="text-xs text-muted-foreground">{stat.subtext}</p>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isComplete = status === "Done";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        isComplete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
      />
      {status}
    </span>
  );
}

export function Home() {
  const { apps } = useRegistry();
  const [activeTab, setActiveTab] = useState("Outline");
  const [timeRange, setTimeRange] = useState("Last 3 months");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={stat.label}
            className="animate-in stagger-1"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <StatCard stat={stat} />
          </div>
        ))}
      </div>

      <Card className="p-6 border border-border bg-card animate-in stagger-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Total Visitors</h3>
            <p className="text-sm text-muted-foreground">
              Total for the last 3 months
            </p>
          </div>
          <div className="flex gap-2">
            {["Last 3 months", "Last 30 days", "Last 7 days"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 w-full">
          <SimpleAreaChart />
        </div>

        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {chartData.map((d) => (
            <span key={d.date}>{d.date}</span>
          ))}
        </div>
      </Card>

      <Card className="border border-border bg-card animate-in stagger-3">
        <div className="flex items-center justify-between border-b border-border px-4">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "Past Performance" && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs">
                    3
                  </span>
                )}
                {tab === "Key Personnel" && (
                  <span className="ml-1.5 rounded bg-muted px-1.5 py-0.5 text-xs">
                    2
                  </span>
                )}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 py-2">
            <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
              <span className="h-4 w-4 border border-current rounded grid place-items-center text-[10px]">
                ☰
              </span>
              Customize Columns
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent">
              <Plus className="h-3.5 w-3.5" />
              Add Section
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Header
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Section Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Target
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Limit
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Reviewer
                </th>
                <th className="w-10 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border table-row-hover"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground cursor-grab">
                        ⋮⋮
                      </span>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{row.header}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-md border border-border px-2 py-0.5 text-xs">
                      {row.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {row.target}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {row.limit}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.reviewer}</td>
                  <td className="px-4 py-3">
                    <button className="p-1 rounded hover:bg-accent">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
