"use client";

import { useState, type FormEvent } from "react";
import { submitApplication } from "@/features/programs/actions";

export function ApplicationForm({ programId }: { programId: string }) {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await submitApplication({ programId, displayName: String(form.get("displayName")), serviceConsentVersion: "2026-09", serviceConsent: form.get("consent") === "on" });
      setMessage("신청이 접수되었습니다. 참여 상태를 알려드릴게요.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "신청을 저장하지 못했습니다."); }
  }
  return <form className="application-form" onSubmit={submit}>
    <label htmlFor="displayName">이름</label><input id="displayName" name="displayName" required minLength={2} />
    <label className="check-row"><input type="checkbox" name="consent" required /> 프로그램 운영을 위한 개인정보 수집·이용에 동의합니다.</label>
    <button className="primary-action" type="submit">신청 완료</button>
    {message && <p role="status">{message}</p>}
  </form>;
}
