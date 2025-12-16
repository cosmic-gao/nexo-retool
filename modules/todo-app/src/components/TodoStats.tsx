export function TodoStats() {
  const stats = [
    { label: "Completed this week", value: 12, color: "bg-emerald-500" },
    { label: "Pending", value: 5, color: "bg-amber-500" },
    { label: "Overdue", value: 2, color: "bg-rose-500" },
    { label: "Total tasks", value: 19, color: "bg-primary" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Task Statistics</h2>
        <p className="text-muted-foreground">View your task completion status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h3 className="font-semibold mb-4">Completion Trend</h3>
        <div className="flex h-32 items-end gap-2">
          {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/20 transition-all hover:bg-primary/40"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </div>
    </div>
  );
}
