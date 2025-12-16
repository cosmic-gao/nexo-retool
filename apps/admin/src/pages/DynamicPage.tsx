import { useParams, useLocation } from "react-router-dom";
import { useRegistry } from "@nexo/core";
import { Card, CardContent } from "@/components/ui/card";
import { FileQuestion } from "lucide-react";
import { MicroAppContainer } from "@/components/MicroAppContainer";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export function DynamicPage() {
  const { appId } = useParams();
  const location = useLocation();
  const { apps } = useRegistry();

  const module = apps.find((app) => app.manifest.basePath === `/app/${appId}`);

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
              Module <code className="rounded bg-muted px-2 py-1">{appId}</code> is not registered
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

  const moduleId = module.manifest.id;
  const basePath = module.manifest.basePath;
  const moduleUrl = `${API_BASE}${basePath}/`;

  return (
    <div className="h-full w-full">
      <MicroAppContainer
        name={moduleId}
        url={moduleUrl}
        baseroute={basePath}
        data={{ route: location.pathname, platform: "nexo" }}
        className="h-full w-full"
      />
    </div>
  );
}
