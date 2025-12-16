import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import WujieReact from "wujie-react";
import { bus } from "wujie";

interface MicroAppContainerProps {
  name: string;
  url: string;
  baseroute?: string;
  data?: Record<string, any>;
  className?: string;
}

/**
 * MicroApp Container Component
 * Uses wujie (无界) for micro-frontend integration
 */
export function MicroAppContainer({
  name,
  url,
  baseroute,
  data,
  className,
}: MicroAppContainerProps) {
  const location = useLocation();

  // Send route change to child app via wujie bus
  useEffect(() => {
    const subPath = baseroute ? location.pathname.replace(baseroute, "") : location.pathname;
    console.log("📍 Wujie route change:", { name, baseroute, subPath, fullPath: location.pathname });
    
    // Emit route change event to child app
    bus.$emit(`${name}-route-change`, {
      path: subPath || "/",
      fullPath: location.pathname,
    });
  }, [location.pathname, name, baseroute]);

  return (
    <div className={className} style={{ height: "100%", width: "100%" }}>
      <WujieReact
        name={name}
        url={url}
        sync={false}
        props={{
          baseroute,
          ...data,
        }}
        beforeLoad={(appWindow) => {
          console.log(`🔄 [${name}] beforeLoad`);
        }}
        beforeMount={(appWindow) => {
          console.log(`🔄 [${name}] beforeMount`);
        }}
        afterMount={(appWindow) => {
          console.log(`✅ [${name}] afterMount`);
          // Send initial route after mount
          const subPath = baseroute ? location.pathname.replace(baseroute, "") : location.pathname;
          bus.$emit(`${name}-route-change`, {
            path: subPath || "/",
            fullPath: location.pathname,
          });
        }}
        beforeUnmount={(appWindow) => {
          console.log(`🔄 [${name}] beforeUnmount`);
        }}
        afterUnmount={(appWindow) => {
          console.log(`🔄 [${name}] afterUnmount`);
        }}
      />
    </div>
  );
}

