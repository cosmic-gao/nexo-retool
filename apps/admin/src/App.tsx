import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Apps } from "./pages/Apps";
import { DynamicPage } from "./pages/DynamicPage";
import { bootstrap } from "./bootstrap";

export function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    bootstrap()
      .then(() => {
        setIsReady(true);
      })
      .catch((error) => {
        console.error("Platform initialization failed:", error);
        setIsReady(true);
      });
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading platform...</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="apps" element={<Apps />} />
          <Route path="app/:appId/*" element={<DynamicPage />} />
        </Route>
      </Routes>
    </TooltipProvider>
  );
}
