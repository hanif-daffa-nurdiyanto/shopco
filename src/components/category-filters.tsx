'use client'

import Image from 'next/image'

import type { CategoryFilters as CategoryFilterValues } from '@/types/storefront-content'

import { PriceRangeSlider } from './price-range-slider'

const colors = [
  '#00C12B',
  '#F50606',
  '#F5DD06',
  '#F57906',
  '#06CAF5',
  '#063AF5',
  '#7D06F5',
  '#F506A4',
  '#FFFFFF',
  '#000000',
]
const sizes = ['S', 'M', 'L', 'XL', 'XXL']
const dressStyles = ['Casual', 'Formal', 'Party', 'Gym']

type Props = {
  action: string
  filters: CategoryFilterValues
  onApply?: () => void
}

const CategoryFilters = ({ action, filters, onApply }: Props) => (
  <aside className="rounded-[20px] border border-black/10 p-5">
    <form action={action} method="get" onSubmit={onApply}>
      <input name="sort" type="hidden" value={filters.sort} />
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Filters</h2>
        <Image alt="" height={24} src="/images/figma/filter.svg" width={24} />
      </div>
      <div className="my-5 border-t border-black/10" />
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Price</h3>
          <Image
            alt=""
            className="rotate-180"
            height={16}
            src="/images/figma/chevron-down.svg"
            width={16}
          />
        </div>
        <PriceRangeSlider
          initialMaximum={filters.maxPrice}
          initialMinimum={filters.minPrice}
        />
      </section>
      <div className="my-5 border-t border-black/10" />
      <fieldset>
        <legend className="text-xl font-bold">Colors</legend>
        <div className="mt-5 grid grid-cols-5 gap-3">
          {colors.map((color) => (
            <label
              aria-label={`Filter color ${color}`}
              className="relative flex size-9 cursor-pointer items-center justify-center rounded-full border border-black/10"
              key={color}
              style={{ backgroundColor: color }}
            >
              <input
                className="peer sr-only"
                defaultChecked={filters.colors.includes(color)}
                name="color"
                type="checkbox"
                value={color}
              />
              <span
                className={`hidden text-lg peer-checked:block ${color === '#FFFFFF' ? 'text-ink' : 'text-white'}`}
              >
                ✓
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="my-5 border-t border-black/10" />
      <fieldset>
        <legend className="text-xl font-bold">Size</legend>
        <div className="mt-5 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <label key={size}>
              <input
                className="peer sr-only"
                defaultChecked={filters.sizes.includes(size)}
                name="size"
                type="checkbox"
                value={size}
              />
              <span className="block cursor-pointer rounded-full bg-surface px-5 py-2.5 text-sm text-muted peer-checked:bg-ink peer-checked:text-white">
                {size}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="my-5 border-t border-black/10" />
      <section>
        <h3 className="text-xl font-bold">Dress Style</h3>
        <div className="mt-3">
          {dressStyles.map((style) => (
            <a
              className="flex w-full items-center justify-between py-2 text-left text-muted"
              href={`/category/${style.toLowerCase()}`}
              key={style}
            >
              <span>{style}</span>
              <Image alt="" height={16} src="/images/figma/chevron-right.svg" width={16} />
            </a>
          ))}
        </div>
      </section>
      <button className="mt-5 h-12 w-full rounded-full bg-ink font-medium text-white" type="submit">
        Apply Filter
      </button>
    </form>
  </aside>
)

export { CategoryFilters }
