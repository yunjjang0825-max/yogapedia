import { requireRole } from "@/lib/auth/roles";

export default async function AdminPage() {
  await requireRole(["admin"]);
  return (
    <main className="portal-page">
      <p className="eyebrow">요가피디아 운영</p>
      <h1>클래스박스 관리</h1>
      <p>버전, 기관, 안전 규칙과 운영 상태를 관리합니다.</p>
    </main>
  );
}
