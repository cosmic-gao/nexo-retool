import React, { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useStandalone } from "./use-standalone";
import { StandaloneSidebar, type StandaloneSidebarProps } from "./StandaloneSidebar";

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
  },
  main: {
    flex: 1,
    marginLeft: "16rem",
    transition: "margin-left 0.2s ease-in-out",
    minHeight: "100vh",
    backgroundColor: "hsl(0 0% 100%)",
  },
  mainCollapsed: {
    marginLeft: 0,
  },
  header: {
    height: "4rem",
    borderBottom: "1px solid hsl(220 13% 91%)",
    display: "flex",
    alignItems: "center",
    padding: "0 1.5rem",
    gap: "1rem",
    backgroundColor: "hsl(0 0% 100%)",
    position: "sticky" as const,
    top: 0,
    zIndex: 30,
  },
  toggleButton: {
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.375rem",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "hsl(240 5.3% 26.1%)",
    transition: "background-color 0.15s ease",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "hsl(240 3.8% 46.1%)",
  },
  breadcrumbSeparator: {
    color: "hsl(220 13% 91%)",
  },
  breadcrumbCurrent: {
    color: "hsl(240 5.3% 26.1%)",
    fontWeight: 500,
  },
  content: {
    padding: "1.5rem",
  },
};

export interface StandaloneLayoutProps {
  /** Sidebar props */
  sidebarProps?: StandaloneSidebarProps;
  /** Custom header content */
  header?: ReactNode;
  /** Show breadcrumb */
  showBreadcrumb?: boolean;
  /** Custom breadcrumb items */
  breadcrumbItems?: { label: string; path?: string }[];
  /** Content padding */
  contentPadding?: string | number;
  /** Children (if not using Outlet) */
  children?: ReactNode;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function StandaloneLayout({
  sidebarProps,
  header,
  showBreadcrumb = true,
  breadcrumbItems,
  contentPadding,
  children,
  className,
  style,
}: StandaloneLayoutProps) {
  const { appName, sidebarOpen, toggleSidebar, currentPath, menus } =
    useStandalone();

  // Generate breadcrumb from current path
  const generateBreadcrumb = () => {
    if (breadcrumbItems) return breadcrumbItems;

    const items: { label: string; path?: string }[] = [{ label: appName }];

    // Find current menu item
    const findMenuItem = (
      items: typeof menus,
      path: string
    ): { label: string; path?: string } | null => {
      for (const item of items) {
        if (item.path === path) {
          return { label: item.label };
        }
        if (item.children) {
          const found = findMenuItem(item.children, path);
          if (found) return found;
        }
      }
      return null;
    };

    const currentItem = findMenuItem(menus, currentPath);
    if (currentItem) {
      items.push(currentItem);
    }

    return items;
  };

  const breadcrumb = generateBreadcrumb();

  const mainStyle = {
    ...styles.main,
    ...(!sidebarOpen ? styles.mainCollapsed : {}),
    ...style,
  };

  const contentStyle = {
    ...styles.content,
    ...(contentPadding !== undefined ? { padding: contentPadding } : {}),
  };

  return (
    <div style={styles.wrapper} className={className}>
      <StandaloneSidebar {...sidebarProps} />
      <main style={mainStyle}>
        {/* Header */}
        {header || (
          <header style={styles.header}>
            <button
              style={styles.toggleButton}
              onClick={toggleSidebar}
              title="Toggle Sidebar"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "hsl(240 4.8% 95.9%)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>

            {showBreadcrumb && (
              <nav style={styles.breadcrumb}>
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span style={styles.breadcrumbSeparator}>/</span>
                    )}
                    <span
                      style={
                        index === breadcrumb.length - 1
                          ? styles.breadcrumbCurrent
                          : undefined
                      }
                    >
                      {item.label}
                    </span>
                  </React.Fragment>
                ))}
              </nav>
            )}
          </header>
        )}

        {/* Content */}
        <div style={contentStyle}>{children || <Outlet />}</div>
      </main>
    </div>
  );
}

