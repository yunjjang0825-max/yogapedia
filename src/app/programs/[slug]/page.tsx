import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedProgram } from "@/features/programs/queries";

export default async function ProgramPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getPublishedProgram(slug);
  if (!program) notFound();
  return (
    <main className="program-page">
      <nav><Link className="brand" href="/">YOGAPEDIA</Link></nav>
      <p className="eyebrow">{program.organization_name}</p>
      <h1>{program.title}</h1>
      <p className="program-lead">{program.description}</p>
      <dl className="program-facts">
        <div><dt>기간</dt><dd>{program.starts_on} - {program.ends_on}</dd></div>
        <div><dt>장소</dt><dd>{program.location}</dd></div>
        <div><dt>정원</dt><dd>{program.capacity}명</dd></div>
      </dl>
      <section className="notice-band"><h2>안내</h2><p>본 프로그램은 웰니스를 위한 활동이며 의료 진단이나 치료를 제공하지 않습니다.</p></section>
      <Link className="primary-action" href={`/programs/${slug}/apply`}>참여 신청하기</Link>
    </main>
  );
}
