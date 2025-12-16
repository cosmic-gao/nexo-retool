export default function Security() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Manage your security settings</p>
      </div>
      
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Password</h3>
          <p className="text-sm text-muted-foreground">Change your password</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Two-Factor Authentication</h3>
          <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
        </div>
        
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-medium">Sessions</h3>
          <p className="text-sm text-muted-foreground">Manage active sessions</p>
        </div>
      </div>
    </div>
  );
}

