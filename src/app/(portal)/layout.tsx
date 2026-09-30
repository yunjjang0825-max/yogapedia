import type { ReactNode } from "react";

import { AccountMenu } from "@/components/account-menu";
import { requireUser } from "@/lib/auth/roles";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireUser();
  return (
    <div className="portal-shell">
      <header className="portal-header">
        <strong>YOGAPEDIA</strong>
        <AccountMenu />
      </header>
      {children}
    </div>
  );
}
