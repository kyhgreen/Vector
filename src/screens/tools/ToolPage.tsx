import { Suspense } from 'react'
import { Navigate, useParams } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { getTool } from '../../tools/registry'

export default function ToolPage() {
  const { toolId = '' } = useParams()
  const tool = getTool(toolId)
  if (!tool) return <Navigate to="/tools" replace />
  return (
    <>
      <PageHeader title={tool.title} subtitle={tool.tagline} back="/tools" />
      <Suspense fallback={<p style={{ color: 'var(--text-muted)' }}>Loading...</p>}>
        <tool.Component />
      </Suspense>
    </>
  )
}
