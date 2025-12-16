import { useRegistry } from "@nexo/core";
import {
  Boxes,
  Plus,
  Menu,
  Route,
  Calendar,
  User,
  Tag,
  Power,
  RefreshCw,
  FolderOpen,
  Shield,
} from "lucide-react";

export function Apps() {
  const { apps, toggleApp } = useRegistry();

  const loadedApps = apps.filter((app) => app.status === "loaded");
  const pendingApps = apps.filter((app) => app.status === "pending");
  const errorApps = apps.filter((app) => app.status === "error");

  return (
    <div className="container mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">应用管理</h1>
          <p className="text-muted-foreground">
            管理从 user-apps 目录加载的用户应用
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium hover:bg-accent">
            <RefreshCw className="h-4 w-4" />
            重新加载
          </button>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            添加应用
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Boxes className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{loadedApps.length}</p>
              <p className="text-xs text-muted-foreground">已加载</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <RefreshCw className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingApps.length}</p>
              <p className="text-xs text-muted-foreground">待加载</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
              <Boxes className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{errorApps.length}</p>
              <p className="text-xs text-muted-foreground">加载失败</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{apps.length}</p>
              <p className="text-xs text-muted-foreground">总计</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apps List */}
      {apps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/50 bg-card/30 p-16">
          <div className="flex flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-medium">暂无用户应用</h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              在 user-apps 目录下创建你的应用，平台会自动发现并加载
            </p>
            <code className="rounded-lg bg-muted px-4 py-2 text-sm">
              user-apps/your-app/index.tsx
            </code>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {apps.map((app) => (
            <div
              key={app.manifest.id}
              className="animate-fade-in rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20">
                      {app.manifest.icon || (
                        <Boxes className="h-7 w-7 text-primary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">
                          {app.manifest.name}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            app.status === "loaded"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : app.status === "error"
                                ? "bg-rose-500/10 text-rose-500"
                                : app.status === "loading"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {app.status === "loaded"
                            ? "已加载"
                            : app.status === "error"
                              ? "错误"
                              : app.status === "loading"
                                ? "加载中"
                                : "待加载"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {app.manifest.description || "暂无描述"}
                      </p>
                    </div>
                  </div>

                  {app.status === "loaded" && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Power className="h-4 w-4 text-muted-foreground" />
                        <button
                          onClick={() => toggleApp(app.manifest.id, !app.active)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            app.active ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                              app.active ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="mt-6 grid gap-4 sm:grid-cols-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">版本:</span>
                    <span className="font-mono">{app.manifest.version}</span>
                  </div>
                  {app.manifest.author && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">作者:</span>
                      <span>{app.manifest.author}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">注册时间:</span>
                    <span>
                      {new Date(app.registeredAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  {app.manifest.priority !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">优先级:</span>
                      <span>{app.manifest.priority}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Menu className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">菜单配置</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {app.manifest.menus.length}
                    </p>
                    <p className="text-xs text-muted-foreground">个菜单项</p>
                    {app.manifest.menus.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {app.manifest.menus.slice(0, 3).map((menu) => (
                          <span
                            key={menu.id}
                            className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs"
                          >
                            {menu.label}
                          </span>
                        ))}
                        {app.manifest.menus.length > 3 && (
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                            +{app.manifest.menus.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Route className="h-4 w-4 text-cyan-500" />
                      <span className="text-sm font-medium">路由配置</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {app.manifest.routes.length}
                    </p>
                    <p className="text-xs text-muted-foreground">个路由</p>
                    {app.manifest.routes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {app.manifest.routes.slice(0, 3).map((route) => (
                          <span
                            key={route.path}
                            className="inline-flex items-center rounded-full border border-border px-2 py-0.5 font-mono text-xs"
                          >
                            {route.path.split("/").pop()}
                          </span>
                        ))}
                        {app.manifest.routes.length > 3 && (
                          <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                            +{app.manifest.routes.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">权限声明</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {app.manifest.permissions?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">个权限</p>
                    {app.manifest.permissions &&
                      app.manifest.permissions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {app.manifest.permissions.slice(0, 3).map((perm) => (
                            <span
                              key={perm.id}
                              className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs"
                            >
                              {perm.name}
                            </span>
                          ))}
                          {app.manifest.permissions.length > 3 && (
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                              +{app.manifest.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                  </div>
                </div>

                {/* Tags */}
                {app.manifest.tags && app.manifest.tags.length > 0 && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">标签:</span>
                    <div className="flex flex-wrap gap-1">
                      {app.manifest.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
