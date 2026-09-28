import { RequireAuth } from "@/shared/component/requireAuth";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return <RequireAuth>{children}</RequireAuth>;
};

export default Layout;
