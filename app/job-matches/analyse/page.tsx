import { Suspense } from 'react'
import AnalyseClient from './analyse-client'

export default async function AnalysePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>
}) {
  const { ids } = await searchParams
  const jobIds = ids ? ids.split(',').filter(Boolean).slice(0, 5) : []

  return (
    <Suspense fallback={null}>
      <AnalyseClient jobIds={jobIds} />
    </Suspense>
  )
}
