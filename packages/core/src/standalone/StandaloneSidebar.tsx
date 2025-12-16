import React, { type ReactNode } from "react";
import { useStandalone } from "./use-standalone";
import type { MenuItemConfig } from "../types/app";

// Minimal styling using CSS-in-JS for portability
const styles = {
  sidebar: {
    width: "16rem",
    height: "100vh",
    backgroundColor: "hsl(0 0% 98%)",
    borderRight: "1px solid hsl(220 13% 91%)",
    display: "flex",
    flexDirection: "column" as const,
    position: "fixed" as const,
    left: 0,
    top: 0,
    zIndex: 40,
    transition: "transform 0.2s ease-in-out",
  },
  sidebarCollapsed: {
    transform: "translateX(-100%)",
  },
  header: {
    padding: "1rem",
    borderBottom: "1px solid hsl(220 13% 91%)",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  logo: {
    width: "2rem",
    height: "2rem",
    borderRadius: "0.5rem",
    backgroundColor: "hsl(240 5.9% 10%)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1rem",
    fontWeight: 600,
  },
  appName: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "hsl(240 5.3% 26.1%)",
  },
  content: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "0.5rem",
  },
  groupLabel: {
    padding: "0.5rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "hsl(240 3.8% 46.1%)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  menuList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.125rem",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.5rem 0.75rem",
    borderRadius: "0.375rem",
    fontSize: "0.875rem",
    color: "hsl(240 5.3% 26.1%)",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left" as const,
  },
  menuItemActive: {
    backgroundColor: "hsl(240 4.8% 95.9%)",
    fontWeight: 500,
  },
  menuItemHover: {
    backgroundColor: "hsl(240 4.8% 95.9%)",
  },
  menuIcon: {
    width: "1rem",
    height: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  footer: {
    padding: "1rem",
    borderTop: "1px solid hsl(220 13% 91%)",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  avatar: {
    width: "2rem",
    height: "2rem",
    borderRadius: "9999px",
    backgroundColor: "hsl(240 4.8% 95.9%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "hsl(240 5.3% 26.1%)",
    overflow: "hidden",
  },
  userName: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "hsl(240 5.3% 26.1%)",
  },
  userEmail: {
    fontSize: "0.75rem",
    color: "hsl(240 3.8% 46.1%)",
  },
  badge: {
    marginLeft: "auto",
    padding: "0.125rem 0.5rem",
    fontSize: "0.75rem",
    fontWeight: 500,
    backgroundColor: "hsl(240 4.8% 95.9%)",
    borderRadius: "9999px",
    color: "hsl(240 5.3% 26.1%)",
  },
  subMenu: {
    listStyle: "none",
    margin: 0,
    padding: "0.25rem 0 0.25rem 1.75rem",
    borderLeft: "1px solid hsl(220 13% 91%)",
    marginLeft: "0.75rem",
  },
};

// Render icon - handles React nodes, strings (emoji), and null
function renderIcon(icon: ReactNode): ReactNode {
  if (typeof icon === "string") {
    return <span style={{ fontSize: "1rem" }}>{icon}</span>;
  }
  if (React.isValidElement(icon)) {
    return icon;
  }
  return null;
}

interface MenuItemProps {
  menu: MenuItemConfig;
  isActive: boolean;
  onNavigate: (path: string) => void;
  currentPath: string;
}

function MenuItem({ menu, isActive, onNavigate, currentPath }: MenuItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(isActive);
  const hasChildren = menu.children && menu.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      onNavigate(menu.path);
    }
  };

  const itemStyle = {
    ...styles.menuItem,
    ...(isActive && !hasChildren ? styles.menuItemActive : {}),
    ...(isHovered ? styles.menuItemHover : {}),
  };

  return (
    <li>
      <button
        style={itemStyle}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span style={styles.menuIcon}>{renderIcon(menu.icon)}</span>
        <span style={{ flex: 1 }}>{menu.label}</span>
        {menu.badge && <span style={styles.badge}>{menu.badge}</span>}
        {hasChildren && (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </button>
      {hasChildren && isExpanded && (
        <ul style={styles.subMenu}>
          {menu.children!.map((child) => (
            <MenuItem
              key={child.id}
              menu={child}
              isActive={currentPath === child.path}
              onNavigate={onNavigate}
              currentPath={currentPath}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export interface StandaloneSidebarProps {
  /** User info for footer */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  /** Additional menu items to show at top */
  extraMenus?: MenuItemConfig[];
  /** Custom header content */
  header?: ReactNode;
  /** Custom footer content */
  footer?: ReactNode;
  /** Group label for app menus */
  menuGroupLabel?: string;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
}

export function StandaloneSidebar({
  user,
  extraMenus,
  header,
  footer,
  menuGroupLabel = "Pages",
  className,
  style,
}: StandaloneSidebarProps) {
  const { appName, appIcon, menus, navigate, currentPath, sidebarOpen } =
    useStandalone();

  const sidebarStyle = {
    ...styles.sidebar,
    ...(!sidebarOpen ? styles.sidebarCollapsed : {}),
    ...style,
  };

  return (
    <aside style={sidebarStyle} className={className}>
      {/* Header */}
      {header || (
        <div style={styles.header}>
          <div style={styles.logo}>
            {appIcon ? (
              typeof appIcon === "string" ? (
                appIcon
              ) : (
                appIcon
              )
            ) : (
              appName.charAt(0).toUpperCase()
            )}
          </div>
          <span style={styles.appName}>{appName}</span>
        </div>
      )}

      {/* Content */}
      <div style={styles.content}>
        {/* Extra menus */}
        {extraMenus && extraMenus.length > 0 && (
          <>
            <div style={styles.groupLabel}>Platform</div>
            <ul style={styles.menuList}>
              {extraMenus.map((menu) => (
                <MenuItem
                  key={menu.id}
                  menu={menu}
                  isActive={currentPath === menu.path}
                  onNavigate={navigate}
                  currentPath={currentPath}
                />
              ))}
            </ul>
          </>
        )}

        {/* App menus */}
        {menus.length > 0 && (
          <>
            <div style={styles.groupLabel}>{menuGroupLabel}</div>
            <ul style={styles.menuList}>
              {menus.map((menu) => (
                <MenuItem
                  key={menu.id}
                  menu={menu}
                  isActive={
                    currentPath === menu.path ||
                    currentPath.startsWith(menu.path + "/")
                  }
                  onNavigate={navigate}
                  currentPath={currentPath}
                />
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Footer */}
      {footer ||
        (user && (
          <div style={styles.footer}>
            <div style={styles.userInfo}>
              <div style={styles.avatar}>
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={styles.userName}>{user.name}</div>
                {user.email && <div style={styles.userEmail}>{user.email}</div>}
              </div>
            </div>
          </div>
        ))}
    </aside>
  );
}

