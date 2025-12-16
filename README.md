# Nexo Platform

一个现代化的 APP 动态注册平台。用户可以开发完整的 Vue/React 项目，通过 JSON 配置文件声明需要注册到平台的菜单、路由和权限。

## 架构设计

```
用户 APP（完整的 Vue/React 项目）
  │
  ├─ nexo.manifest.json（JSON 规则声明）
  │   ├─ 菜单配置
  │   ├─ 路由配置
  │   ├─ 权限声明
  │   └─ 生命周期钩子
  │
平台解析引擎 (@nexo/core)
  │
  ├─ Manifest 解析器
  ├─ APP 加载器（支持本地/远程）
  ├─ 菜单注册中心
  ├─ 路由注册中心
  └─ 权限管理器
  │
平台 UI（统一壳 @nexo/web）
  │
  └─ 动态渲染菜单和页面
```

## 项目结构

```
nexo-retool/
├── apps/
│   └── web/                        # 平台主应用（统一壳）
├── packages/
│   ├── core/                       # 核心包（解析引擎）
│   │   └── nexo.schema.json        # 👈 JSON Schema 定义
│   └── ui/                         # UI 组件库
└── user-apps/                      # 用户 APP 目录
    ├── todo-app/                   # 完整的 React 项目
    │   ├── nexo.manifest.json      # 👈 JSON 配置
    │   ├── package.json
    │   ├── vite.config.ts
    │   └── src/
    │       ├── main.tsx
    │       ├── App.tsx
    │       └── components/
    ├── analytics-app/
    │   └── nexo.manifest.json
    └── settings-app/
        └── nexo.manifest.json
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动平台

```bash
pnpm dev:web
```

### 独立运行用户 APP

```bash
cd user-apps/todo-app
pnpm install
pnpm dev
```

## 创建用户 APP

### 1. 创建项目目录

```bash
mkdir user-apps/my-app
cd user-apps/my-app
pnpm init
```

### 2. 创建 Manifest 配置文件 (JSON)

```json
// user-apps/my-app/nexo.manifest.json
{
  "$schema": "../../packages/core/nexo.schema.json",
  "id": "my-app",
  "name": "我的应用",
  "version": "1.0.0",
  "description": "应用描述",
  "author": "Your Name",
  "icon": "box",
  "tags": ["示例"],
  "priority": 10,

  "basePath": "/app/my-app",
  "framework": "react",
  "entry": "./src/main.tsx",

  "assets": {
    "js": ["./dist/index.js"],
    "css": ["./dist/index.css"]
  },

  "permissions": [
    {
      "id": "my-app:read",
      "name": "查看",
      "description": "查看应用内容"
    },
    {
      "id": "my-app:write",
      "name": "编辑",
      "description": "编辑应用内容"
    }
  ],

  "menus": [
    {
      "id": "my-app",
      "label": "我的应用",
      "path": "/app/my-app",
      "icon": "box",
      "order": 10,
      "children": [
        {
          "id": "my-app-home",
          "label": "首页",
          "path": "/app/my-app/home",
          "icon": "home"
        },
        {
          "id": "my-app-settings",
          "label": "设置",
          "path": "/app/my-app/settings",
          "icon": "settings",
          "permissions": ["my-app:write"]
        }
      ]
    }
  ],

  "routes": [
    {
      "path": "/app/my-app",
      "entry": "./src/pages/Home.tsx",
      "meta": { "title": "首页" }
    },
    {
      "path": "/app/my-app/settings",
      "entry": "./src/pages/Settings.tsx",
      "meta": {
        "title": "设置",
        "permissions": ["my-app:write"]
      }
    }
  ],

  "lifecycle": {
    "bootstrap": "./src/bootstrap.ts",
    "mount": "./src/mount.ts",
    "unmount": "./src/unmount.ts"
  }
}
```

> 💡 **提示**: 添加 `$schema` 字段可以在支持的编辑器中获得智能提示和校验。

### 3. 创建 APP 入口

```typescript
// user-apps/my-app/src/main.tsx

import { createRoot, Root } from "react-dom/client";
import App from "./App";

let root: Root | null = null;

// 挂载应用
export function mount(container?: HTMLElement) {
  const target = container || document.getElementById("root");
  if (!target) return;
  
  root = createRoot(target);
  root.render(<App />);
}

// 卸载应用
export function unmount() {
  root?.unmount();
  root = null;
}

// 初始化
export function bootstrap() {
  console.log("APP 初始化");
}

// 独立运行时自动挂载
if (!window.__NEXO_PLATFORM__) {
  mount();
}

export default { bootstrap, mount, unmount };
```

## Manifest JSON Schema

配置文件支持 JSON Schema 校验，引用方式：

```json
{
  "$schema": "../../packages/core/nexo.schema.json",
  ...
}
```

### 配置字段参考

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | string | ✅ | APP 唯一标识（小写字母、数字、连字符）|
| name | string | ✅ | APP 名称 |
| version | string | ✅ | APP 版本（语义化版本）|
| description | string | | APP 描述 |
| icon | string | | 图标名称（lucide-react）|
| author | string | | APP 作者 |
| basePath | string | | APP 基础路径（以 / 开头）|
| framework | string | | 框架类型：react / vue / vanilla |
| entry | string | | 入口文件 |
| assets | object | | 构建产物 { js: [], css: [] } |
| menus | array | | 菜单配置 |
| routes | array | | 路由配置 |
| permissions | array | | 权限声明 |
| priority | number | | 加载优先级（数字越小越靠前）|
| lifecycle | object | | 生命周期钩子 |

### 菜单配置 (MenuItem)

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | string | ✅ | 菜单唯一标识 |
| label | string | ✅ | 菜单显示名称 |
| path | string | | 菜单路径 |
| icon | string | | 图标名称 |
| children | array | | 子菜单 |
| order | number | | 排序权重 |
| badge | string | | 菜单徽章 |
| permissions | array | | 所需权限 |

### 路由配置 (Route)

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| path | string | ✅ | 路由路径 |
| entry | string | | 入口文件（相对路径）|
| meta | object | | 路由元信息 |

### 权限配置 (Permission)

| 字段 | 类型 | 必填 | 描述 |
|------|------|------|------|
| id | string | ✅ | 权限标识 |
| name | string | ✅ | 权限名称 |
| description | string | | 权限描述 |

## 图标支持

Manifest 中的 `icon` 字段使用 [lucide-react](https://lucide.dev/icons/) 图标名称（kebab-case 格式）：

```json
"icon": "list-todo"      // ListTodo
"icon": "bar-chart-3"    // BarChart3
"icon": "settings"       // Settings
"icon": "user"           // User
```

## 权限系统

### 声明权限

在 Manifest 中声明 APP 所需的权限：

```json
"permissions": [
  {
    "id": "my-app:admin",
    "name": "管理员",
    "description": "完全管理权限"
  }
]
```

### 使用权限

在菜单和路由中使用权限控制：

```json
"menus": [
  {
    "id": "admin",
    "label": "管理",
    "path": "/admin",
    "permissions": ["my-app:admin"]
  }
],

"routes": [
  {
    "path": "/admin",
    "entry": "./src/pages/Admin.tsx",
    "meta": {
      "permissions": ["my-app:admin"]
    }
  }
]
```

## 技术栈

- **框架**: React 19 + TypeScript
- **构建**: Vite 6
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui + Radix UI
- **路由**: React Router v7
- **包管理**: pnpm workspace

## License

MIT
