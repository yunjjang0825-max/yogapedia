import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="요가피디아 홈">
          YOGAPEDIA
        </Link>
        <Link className="text-action" href="/login">
          로그인
        </Link>
      </header>
      {children}
      <footer className="site-footer">
        <span>YOGAPEDIA</span>
        <span>부산에서 검증하는 회복 웰니스</span>
      </footer>
    </div>
  );
}
