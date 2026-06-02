import { redirect } from 'next/navigation'

export default async function LearnInterviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/interview?topic=${encodeURIComponent(slug)}`)
}
