import { useEffect } from "react";

const RouteTitle = ({ title, children }: { title: string; children: React.ReactNode }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return <>{children}</>;
};

export default RouteTitle;
