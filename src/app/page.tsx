import Link from "next/link";

import { AppShell } from "@/components/app-shell";

const facts = [
  ["기간", "4주 · 주 2회"],
  ["대상", "부산 40~69세"],
  ["방식", "그룹 수업 + 홈 루틴"],
] as const;

export default function Home() {
  return (
    <AppShell>
      <main>
        <section className="program-intro" aria-labelledby="program-title">
          <div className="program-intro__inner">
            <div className="program-intro__copy">
              <p className="eyebrow">부산에서 시작하는 회복 루틴</p>
              <h1 id="program-title">요가피디아</h1>
              <p className="program-name">부산 4060 움직임 회복 클래스박스</p>
              <p className="program-summary">
                허리, 어깨, 무릎의 일상적인 불편을 살피고 나에게 맞는
                움직임을 4주 동안 차근차근 이어갑니다.
              </p>
              <Link
                className="primary-action"
                href="/programs/busan-4060-movement-recovery"
              >
                프로그램 신청하기
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="program-visual" aria-hidden="true">
              <div className="program-visual__sun" />
              <div className="program-visual__line program-visual__line--one" />
              <div className="program-visual__line program-visual__line--two" />
              <p>BUSAN</p>
              <span>MOVE · RESTORE · CONTINUE</span>
            </div>
          </div>
        </section>

        <section className="program-facts" aria-label="프로그램 정보">
          <div className="program-facts__inner">
            {facts.map(([label, value]) => (
              <div className="fact" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="next-step" aria-labelledby="next-step-title">
          <div>
            <p className="eyebrow">첫 번째 클래스박스</p>
            <h2 id="next-step-title">몸의 변화를 기록하며 이어가는 수업</h2>
          </div>
          <p>
            수업 전후의 상태와 참여 기록을 바탕으로 나의 변화를 확인하고,
            프로그램이 끝난 뒤 다음 회복 루틴을 안내받습니다.
          </p>
        </section>
      </main>
    </AppShell>
  );
}
