import { createRoot, Root } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { type AppManifestConfig } from "@nexoc/core";
import { AppSidebar } from "./components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "./components/ui/breadcrumb";
import { Separator } from "./components/ui/separator";

const isInWujie = !!(window as any).__POWERED_BY_WUJIE__;

function RouteSync({ appId }: { appId: string }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInWujie) return;

    const wujie = (window as any).$wujie;
    if (!wujie?.bus) return;

    const handleRouteChange = (data: { path: string }) => {
      if (data.path) {
        navigate(data.path);
      }
    };

    wujie.bus.$on(`${appId}-route-change`, handleRouteChange);
    return () => wujie.bus.$off(`${appId}-route-change`, handleRouteChange);
  }, [navigate, appId]);

  return null;
}

// Standalone Layout with shadcn sidebar
function StandaloneLayout({ manifest }: { manifest: AppManifestConfig }) {
  return (
    <SidebarProvider>
      <AppSidebar 
        appName={manifest.name}
        appIcon={manifest.icon}
        pages={manifest.pages}
        user={{
          name: "Guest User",
          email: "guest@example.com",
          avatar: "",
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>{manifest.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Generate routes from manifest pages
function generateRoutes(
  manifest: AppManifestConfig,
  pageComponents: Record<string, React.ComponentType>
) {
  const routes: React.ReactNode[] = [];
  
  if (manifest.pages) {
    for (const page of manifest.pages) {
      const Component = page.component ? pageComponents[page.component] : null;
      if (Component) {
        routes.push(
          <Route key={page.id} path={page.path} element={<Component />} />
        );
      }
      
      // Handle nested pages
      if (page.children) {
        for (const child of page.children) {
          const ChildComponent = child.component ? pageComponents[child.component] : null;
          if (ChildComponent) {
            routes.push(
              <Route key={child.id} path={child.path} element={<ChildComponent />} />
            );
          }
        }
      }
    }
  }
  
  // Add fallback route
  if (manifest.pages && manifest.pages.length > 0) {
    routes.push(
      <Route key="fallback" path="*" element={<Navigate to={manifest.pages[0].path} replace />} />
    );
  }
  
  return routes;
}

export interface BootstrapConfig {
  manifest: AppManifestConfig;
  pages: Record<string, React.ComponentType>;
}

export function bootstrap({ manifest, pages }: BootstrapConfig) {
  const isStandaloneEnabled = manifest.standalone?.enabled && !isInWujie;
  const appId = manifest.id.replace(/[^a-zA-Z0-9]/g, "-");

  // Embedded mode app (when running inside wujie or standalone disabled)
  function EmbeddedApp() {
    const routes = generateRoutes(manifest, pages);
    return (
      <BrowserRouter>
        <RouteSync appId={appId} />
        <div className="min-h-screen p-6">
          <Routes>
            {routes}
          </Routes>
        </div>
      </BrowserRouter>
    );
  }

  // Standalone mode app (with full sidebar layout)
  function StandaloneApp() {
    return (
      <BrowserRouter>
        <Routes>
          <Route element={<StandaloneLayout manifest={manifest} />}>
            {generateRoutes(manifest, pages)}
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }

  // Choose which app to render based on mode
  const App = isStandaloneEnabled ? StandaloneApp : EmbeddedApp;

  let root: Root | null = null;

  function mount() {
    const container = document.getElementById("root");
    if (container && !root) {
      root = createRoot(container);
      root.render(<App />);
    }
  }

  function unmount() {
    if (root) {
      root.unmount();
      root = null;
    }
  }

  if (isInWujie) {
    (window as any).__WUJIE_MOUNT = mount;
    (window as any).__WUJIE_UNMOUNT = unmount;
  } else {
    mount();
  }
}

