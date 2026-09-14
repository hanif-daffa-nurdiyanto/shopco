import Image from 'next/image'

type BreadcrumbsProps = { current?: string; items?: string[] }

const Breadcrumbs = ({
  current = 'T-shirts',
  items = ['Home', 'Shop', 'Men'],
}: BreadcrumbsProps) => (
  <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted md:text-base">
    {items.map((item) => (
      <span className="flex items-center gap-1" key={item}>
        <a href={item === 'Home' ? '/' : '#'}>{item}</a>
        <Image alt="" height={16} src="/images/figma/chevron-right.svg" width={16} />
      </span>
    ))}
    <span className="text-ink">{current}</span>
  </nav>
)

export { Breadcrumbs }
