import Image from 'next/image'

import type { FooterContent } from '@/types/storefront-content'

import { Logo } from './logo'
import { Newsletter } from './newsletter'

const SiteFooter = ({ content }: { content: FooterContent }) => (
  <footer className="mt-20 md:mt-24">
    {content.showNewsletter && (
      <div className="relative px-4">
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-surface" />
        <div className="relative">
          <Newsletter
            emailPlaceholder={content.newsletterEmailPlaceholder}
            heading={content.newsletterHeading}
            submitLabel={content.newsletterSubmitLabel}
          />
        </div>
      </div>
    )}
    <div className="bg-surface px-4 pb-8 pt-10 md:pt-12">
      <div className="mx-auto grid max-w-site gap-10 lg:grid-cols-[248px_1fr] lg:gap-28">
        <div>
          <Logo text={content.logoText} />
          <p className="mt-6 text-sm leading-[22px] text-muted">{content.brandDescription}</p>
          <div className="mt-8 flex gap-3">
            {content.socialLinks.map((social) => (
              <a
                aria-label={social.label}
                className="flex size-7 items-center justify-center rounded-full border border-black/20 bg-white text-ink transition-colors duration-200 hover:border-ink hover:bg-ink hover:text-white focus-visible:border-ink focus-visible:bg-ink focus-visible:text-white focus-visible:outline-none"
                href={social.url}
                key={social.platform}
              >
                <span
                  aria-hidden="true"
                  className="block size-3.5 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
                  data-social-icon={social.platform}
                  style={{
                    WebkitMaskImage: `url('/images/figma/${social.platform}.svg')`,
                    maskImage: `url('/images/figma/${social.platform}.svg')`,
                  }}
                />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {content.linkGroups.map((group) => (
            <div key={group.heading}>
              <h3 className="font-medium tracking-[3px] uppercase">{group.heading}</h3>
              <ul className="mt-6 space-y-3 text-muted">
                {group.links.map((link) => (
                  <li key={`${link.label}-${link.url}`}>
                    <a
                      href={link.url}
                      rel={link.newTab ? 'noreferrer' : undefined}
                      target={link.newTab ? '_blank' : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-site flex-col items-center justify-between gap-4 border-t border-black/10 pt-5 md:flex-row">
        <p className="text-sm text-muted">{content.copyright}</p>
        <div className="flex gap-2">
          {content.paymentMethods.map((payment) => (
            <Image
              alt={payment.alt}
              height={30}
              key={payment.name}
              src={payment.image}
              width={47}
            />
          ))}
        </div>
      </div>
    </div>
  </footer>
)

export { SiteFooter }
