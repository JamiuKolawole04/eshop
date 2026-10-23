import { RequireAuth } from "@/shared/component/requireAuth";
import { DashboardShell } from "@/shared/component/sidebar/dashboard-shell";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <RequireAuth>
      <DashboardShell>{children}</DashboardShell>
    </RequireAuth>
  );
};

export default Layout;
