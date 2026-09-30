"use client";

import { useState, type FormEvent } from "react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next = "/portal" }: { next?: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", next);
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callback.toString() },
    });

    setMessage(
      error
        ? "로그인 링크를 보내지 못했습니다. 잠시 후 다시 시도해 주세요."
        : "이메일로 보낸 로그인 링크를 확인해 주세요.",
    );
    setPending(false);
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label htmlFor="email">이메일</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="name@example.com"
      />
      <button className="primary-action" type="submit" disabled={pending}>
        {pending ? "보내는 중" : "로그인 링크 받기"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
