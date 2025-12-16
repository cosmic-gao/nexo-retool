import { useParams, useLocation } from "react-router-dom";
import { useRegistry } from "@nexo/core";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion, Loader2 } from "lucide-react";
import { MicroAppContainer } from "@/components/MicroAppContainer";

// API base URL for module assets
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function DynamicPage() {
  const { appId } = useParams();
  const location = useLocation();
  const { apps } = useRegistry();

  // Find the module by basePath (e.g., /app/todo matches basePath "/app/todo")
  const module = apps.find((app) => {
    const basePath = app.manifest.basePath;
    // Check if basePath matches /app/{appId}
    return basePath === `/app/${appId}`;
  });

  // Debug log
  console.log("🔍 DynamicPage:", {
    appId,
    fullPath: location.pathname,
    module: module?.manifest.name,
    totalApps: apps.length,
  });

  if (!module) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-16">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Module Not Found</h3>
            <p className="text-center text-sm text-muted-foreground">
              Module{" "}
              <code className="rounded bg-muted px-2 py-1">{appId}</code> is not
              registered
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Available modules:</p>
              <ul className="mt-2 list-disc pl-4">
                {apps.map((app) => (
                  <li key={app.manifest.id}>{app.manifest.id}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Construct the wujie app URL using the actual module ID (e.g., "todo-app")
  // In development, modules run on their own dev servers
  // In production, they are served from the server
  const moduleId = module.manifest.id;
  const moduleUrl = `${API_BASE}/modules/${moduleId}/`;

  return (
    <div className="h-full w-full">
      <MicroAppContainer
        name={moduleId}
        url={moduleUrl}
        baseroute={module.manifest.basePath}
        data={{
          route: location.pathname,
          platform: "nexo",
        }}
        className="h-full w-full"
      />
    </div>
  );
}
