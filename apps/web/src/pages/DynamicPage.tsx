import { useParams } from "react-router-dom";
import { useRoutes } from "@nexo/core";
import { Card, CardContent } from "@nexo/ui";
import { FileQuestion } from "lucide-react";

export function DynamicPage() {
  const { appId, "*": path } = useParams();
  const routes = useRoutes();

  // 查找匹配的路由
  const fullPath = `/app/${appId}${path ? `/${path}` : ""}`;
  const matchedRoute = routes.find((route) => {
    // 简单的路径匹配
    return route.path === fullPath || route.path.startsWith(`/app/${appId}`);
  });

  if (!matchedRoute) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-16">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">页面未找到</h3>
            <p className="text-center text-sm text-muted-foreground">
              路径 <code className="rounded bg-muted px-2 py-1">{fullPath}</code>{" "}
              未匹配到任何已注册的路由
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Component = matchedRoute.component;
  const Layout = matchedRoute.layout;

  if (Layout) {
    return (
      <Layout>
        <Component />
      </Layout>
    );
  }

  return <Component />;
}

