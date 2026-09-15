import Image from 'next/image'

import type { HomepageContent } from '@/types/storefront-content'

type Props = Pick<HomepageContent, 'dressStyles' | 'dressStylesHeading'>

const DressStyleSection = ({ dressStyles, dressStylesHeading }: Props) => (
  <section className="mx-auto max-w-site rounded-[20px] bg-surface px-6 py-10 md:rounded-[40px] md:px-16 md:py-[70px]">
    <h2 className="font-display text-center text-[32px] leading-9 font-bold uppercase md:text-5xl">
      {dressStylesHeading}
    </h2>
    <div className="mt-7 grid gap-4 md:mt-16 md:grid-cols-3">
      {dressStyles.map((style, index) => (
        <a
          className={`relative h-[190px] overflow-hidden rounded-[20px] bg-white ${index === 1 || index === 2 ? 'md:col-span-2' : ''}`}
          href={style.url}
          key={style.name}
        >
          <div
            className={`absolute inset-y-0 right-0 w-[62%] ${index === 1 || index === 2 ? 'md:w-[75%]' : ''}`}
          >
            <Image
              alt={`${style.name} style`}
              className="object-cover object-left"
              fill
              sizes="(max-width: 768px) 62vw, 40vw"
              src={style.image}
            />
          </div>
          <span className="absolute top-6 left-6 z-10 max-w-[38%] whitespace-nowrap text-2xl font-bold md:text-4xl">
            {style.name}
          </span>
        </a>
      ))}
    </div>
  </section>
)

export { DressStyleSection }
