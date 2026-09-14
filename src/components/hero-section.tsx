import Image from 'next/image'

import type { HomepageContent } from '@/types/storefront-content'

const HeroSection = ({ hero }: { hero: HomepageContent['hero'] }) => (
  <section className="overflow-hidden bg-hero">
    <div className="mx-auto grid min-h-[663px] max-w-site md:grid-cols-2">
      <div className="z-10 px-4 pt-10 md:px-0 md:pt-[90px]">
        <h1 className="font-display max-w-[577px] text-[36px] leading-[34px] font-bold uppercase md:text-[64px] md:leading-[64px]">
          {hero.heading}
        </h1>
        <p className="mt-5 max-w-[545px] text-sm leading-5 text-muted md:mt-8 md:text-base md:leading-[22px]">
          {hero.description}
        </p>
        <a
          className="mt-6 flex h-[52px] w-full items-center justify-center rounded-full bg-ink text-white md:mt-8 md:w-[210px]"
          href={hero.ctaUrl}
        >
          {hero.ctaLabel}
        </a>
        <div className="mx-auto mt-5 flex max-w-[350px] flex-wrap justify-center gap-y-4 md:mx-0 md:mt-12 md:max-w-none md:flex-nowrap md:justify-start">
          {hero.statistics.map((statistic, index) => (
            <div
              className={`px-5 ${index === 1 ? 'border-l border-black/10' : ''}`}
              key={statistic.label}
            >
              <strong className="block text-2xl leading-none md:text-[40px]">
                {statistic.value}
              </strong>
              <span className="text-xs text-muted md:text-base">{statistic.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="relative min-h-[448px]">
        <Image
          alt="Fashionable couple wearing Shop.co clothing"
          className="object-cover object-[53%_8%] md:object-[49%_7%]"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          src={hero.image}
        />
        <Image
          alt=""
          className="absolute top-12 right-5 size-20"
          height={80}
          src="/images/figma/sparkle-large.svg"
          width={80}
        />
        <Image
          alt=""
          className="absolute top-44 left-4 size-11"
          height={44}
          src="/images/figma/sparkle-small.svg"
          width={44}
        />
      </div>
    </div>
  </section>
)

export { HeroSection }
