import Link from "next/link";

import { LoginForm } from "./login-form";

const errors: Record<string, string> = {
  missing_code: "로그인 링크가 올바르지 않습니다. 새 링크를 요청해 주세요.",
  invalid_or_expired_link: "링크가 만료되었거나 이미 사용되었습니다. 새 링크를 요청해 주세요.",
  session_required: "계속하려면 이메일로 로그인해 주세요.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ? errors[params.error] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand" href="/">YOGAPEDIA</Link>
        <p className="eyebrow">클래스박스 멤버</p>
        <h1>이메일로 간편하게 시작하세요</h1>
        <p>비밀번호 없이 일회용 로그인 링크를 보내드립니다.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        <LoginForm next={params.next} />
      </section>
    </main>
  );
}
