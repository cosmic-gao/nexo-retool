import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@nexo/ui";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Apps } from "./pages/Apps";
import { DynamicPage } from "./pages/DynamicPage";
import { bootstrap } from "./bootstrap";

export function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化平台并加载所有用户 APP
    bootstrap()
      .then(() => {
        setIsReady(true);
      })
      .catch((error) => {
        console.error("平台初始化失败:", error);
        setIsReady(true); // 即使失败也显示界面
      });
  }, []);

  if (!isReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">正在加载平台...</p>
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
