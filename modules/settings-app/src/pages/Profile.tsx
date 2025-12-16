export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>
      
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted" />
          <div>
            <h3 className="font-medium">Admin User</h3>
            <p className="text-sm text-muted-foreground">admin@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}

