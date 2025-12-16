export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure your todo app</p>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">Configure notification preferences</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">Customize appearance</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Data</h3>
          <p className="text-sm text-muted-foreground">Export or import your tasks</p>
        </div>
      </div>
    </div>
  );
}

