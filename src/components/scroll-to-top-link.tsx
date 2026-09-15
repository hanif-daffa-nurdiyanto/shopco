'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Link>

const ScrollToTopLink = ({ onClick, ...props }: Props) => (
  <Link
    {...props}
    onClick={(event) => {
      onClick?.(event)
      if (!event.defaultPrevented) window.scrollTo({ behavior: 'instant', left: 0, top: 0 })
    }}
    scroll
  />
)

export { ScrollToTopLink }
