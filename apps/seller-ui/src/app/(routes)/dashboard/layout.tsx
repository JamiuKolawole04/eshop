import { RequireAuth } from "@/shared/component/requireAuth";
import { SidebarWrapper } from "@/shared/component/sidebar/sidebar";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <RequireAuth>
      <div className="flex h-full bg-black min-h-screen">
        <aside className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800">
          <div className="sticky top-0">
            <SidebarWrapper />
          </div>
        </aside>

        <main className="flex-1">
          <div className="overflow-auto">{children}</div>
        </main>
      </div>
    </RequireAuth>
  );
};

export default Layout;
