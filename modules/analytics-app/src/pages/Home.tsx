export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">View your data insights</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Views</h3>
          <p className="text-2xl font-bold">12,345</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold">1,234</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
          <p className="text-2xl font-bold">3.2%</p>
        </div>
      </div>
    </div>
  );
}

