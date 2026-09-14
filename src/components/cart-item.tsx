'use client'

import Image from 'next/image'

import type { ResolvedCartItem } from '@/types/cart'

type CartItemProps = {
  item: ResolvedCartItem
  onChangeQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  pending: boolean
}

const CartItem = ({ item, onChangeQuantity, onRemove, pending }: CartItemProps) => (
  <article className="flex gap-3.5 py-4 first:pt-0 last:pb-0 md:gap-4 md:py-6">
    <div className="relative size-24.75 shrink-0 overflow-hidden rounded-lg bg-card md:size-31">
      <Image alt={item.name} className="object-cover" fill sizes="124px" src={item.image} />
    </div>
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="truncate text-base font-bold md:text-xl">{item.name}</h2>
          <p className="mt-1 text-xs md:text-sm">
            Size: <span className="text-muted">{item.size ?? 'Standard'}</span>
          </p>
          <p className="text-xs md:text-sm">
            Color: <span className="text-muted">{item.color ?? 'Standard'}</span>
          </p>
        </div>
        <button
          aria-label={`Remove ${item.name}`}
          className="shrink-0"
          disabled={pending}
          onClick={() => onRemove(item.key)}
        >
          <Image alt="" height={24} src="/images/figma/trash.svg" width={24} />
        </button>
      </div>
      <div className="mt-auto flex items-end justify-between">
        <strong className="text-2xl">${item.price}</strong>
        <div className="flex h-7.75 w-26.25 items-center justify-between rounded-full bg-surface px-3.5 md:h-11 md:w-31.5 md:px-5">
          <button
            aria-label="Decrease quantity"
            disabled={pending || item.quantity === 1}
            onClick={() => onChangeQuantity(item.key, item.quantity - 1)}
          >
            <Image alt="" height={16} src="/images/figma/cart-minus.svg" width={16} />
          </button>
          <span className="text-sm">{item.quantity}</span>
          <button
            aria-label="Increase quantity"
            disabled={pending || (item.availableStock != null && item.quantity >= item.availableStock)}
            onClick={() => onChangeQuantity(item.key, item.quantity + 1)}
          >
            <Image alt="" height={16} src="/images/figma/cart-plus.svg" width={16} />
          </button>
        </div>
      </div>
    </div>
  </article>
)

export { CartItem }
