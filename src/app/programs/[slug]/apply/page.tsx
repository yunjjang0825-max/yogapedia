import { notFound } from "next/navigation";
import { getPublishedProgram } from "@/features/programs/queries";
import { ApplicationForm } from "./application-form";

export default async function ApplyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getPublishedProgram(slug);
  if (!program) notFound();
  return <main className="form-page"><p className="eyebrow">참여 신청</p><h1>{program.title}</h1><ApplicationForm programId={program.id} /></main>;
}
