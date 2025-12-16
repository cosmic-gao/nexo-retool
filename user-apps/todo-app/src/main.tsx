/**
 * Todo APP 入口文件
 * 
 * 这是一个完整的 React 应用入口
 */

import { StrictMode } from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

let root: Root | null = null;

/**
 * 挂载应用
 * 当作为独立应用运行时，直接挂载到 #root
 * 当被平台加载时，挂载到平台提供的容器
 */
export function mount(container?: HTMLElement) {
  const targetContainer = container || document.getElementById("root");
  if (!targetContainer) {
    console.error("Todo APP: 找不到挂载容器");
    return;
  }

  root = createRoot(targetContainer);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  console.log("📝 Todo APP 已挂载");
}

/**
 * 卸载应用
 */
export function unmount() {
  if (root) {
    root.unmount();
    root = null;
    console.log("📝 Todo APP 已卸载");
  }
}

/**
 * 初始化应用
 */
export function bootstrap() {
  console.log("📝 Todo APP 初始化");
}

// 如果是独立运行（不是被平台加载），自动挂载
if (!window.__NEXO_PLATFORM__) {
  mount();
}

// 导出生命周期函数供平台调用
export default {
  bootstrap,
  mount,
  unmount,
};

// 声明全局变量类型
declare global {
  interface Window {
    __NEXO_PLATFORM__?: boolean;
  }
}

