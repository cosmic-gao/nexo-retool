export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences</p>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Account</h3>
          <p className="text-sm text-muted-foreground">Manage your account settings</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">Configure notification preferences</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Privacy</h3>
          <p className="text-sm text-muted-foreground">Control your privacy settings</p>
        </div>
      </div>
    </div>
  );
}

