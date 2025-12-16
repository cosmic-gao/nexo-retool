import { useEffect, useRef } from "react";
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

export function MicroAppContainer({
  name,
  url,
  baseroute,
  data,
  className,
}: MicroAppContainerProps) {
  const location = useLocation();
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) return;
    const subPath = baseroute ? location.pathname.replace(baseroute, "") : location.pathname;
    bus.$emit(`${name}-route-change`, { path: subPath || "/", fullPath: location.pathname });
  }, [location.pathname, name, baseroute]);

  const normalizedUrl = url.endsWith("/")
    ? `${url}index.html`
    : url.endsWith(".html")
      ? url
      : `${url}/index.html`;

  return (
    <div className={className} style={{ height: "100%", width: "100%" }}>
      <WujieReact
        name={name}
        url={normalizedUrl}
        sync={false}
        props={{ baseroute, ...data }}
        afterMount={() => {
          mountedRef.current = true;
          const subPath = baseroute ? location.pathname.replace(baseroute, "") : location.pathname;
          bus.$emit(`${name}-route-change`, { path: subPath || "/", fullPath: location.pathname });
        }}
        afterUnmount={() => {
          mountedRef.current = false;
        }}
      />
    </div>
  );
}
