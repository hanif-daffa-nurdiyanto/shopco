'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

const LivePreviewListener = ({ serverURL }: { serverURL: string }) => {
  const router = useRouter()

  return <RefreshRouteOnSave refresh={router.refresh} serverURL={serverURL} />
}

export { LivePreviewListener }
