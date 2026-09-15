import Image from 'next/image'

import { ScrollToTopLink } from './scroll-to-top-link'

type Props = {
  basePath: string
  page: number
  queryString: string
  totalPages: number
}

const getPageHref = (basePath: string, queryString: string, page: number) => {
  const params = new URLSearchParams(queryString)
  params.set('page', String(page))
  return `${basePath}?${params.toString()}`
}

const Pagination = ({ basePath, page, queryString, totalPages }: Props) => {
  if (totalPages <= 1) return null

  const visiblePages = Array.from(
    new Set([1, Math.max(1, page - 1), page, Math.min(totalPages, page + 1), totalPages]),
  ).sort((left, right) => left - right)

  return (
    <nav
      aria-label="Product pages"
      className="flex items-center justify-between border-t border-black/10 pt-5"
    >
      <ScrollToTopLink
        aria-disabled={page <= 1}
        className="flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-40"
        href={getPageHref(basePath, queryString, Math.max(1, page - 1))}
      >
        <Image alt="" height={16} src="/images/figma/arrow-left.svg" width={16} />
        Previous
      </ScrollToTopLink>
      <div className="flex items-center text-sm text-muted">
        {visiblePages.map((pageNumber, index) => (
          <span className="flex items-center" key={pageNumber}>
            {index > 0 && pageNumber - visiblePages[index - 1] > 1 && (
              <span className="flex size-9 items-center justify-center">...</span>
            )}
            <ScrollToTopLink
              aria-current={pageNumber === page ? 'page' : undefined}
              className="flex size-9 items-center justify-center rounded-lg aria-current:bg-surface aria-current:text-ink"
              href={getPageHref(basePath, queryString, pageNumber)}
            >
              {pageNumber}
            </ScrollToTopLink>
          </span>
        ))}
      </div>
      <ScrollToTopLink
        aria-disabled={page >= totalPages}
        className="flex h-9 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm font-medium aria-disabled:pointer-events-none aria-disabled:opacity-40"
        href={getPageHref(basePath, queryString, Math.min(totalPages, page + 1))}
      >
        Next
        <Image alt="" height={16} src="/images/figma/arrow-right.svg" width={16} />
      </ScrollToTopLink>
    </nav>
  )
}

export { Pagination }
