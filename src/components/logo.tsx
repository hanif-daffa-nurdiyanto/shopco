import Link from 'next/link'

const Logo = ({ text = 'SHOP.CO' }: { text?: string }) => (
  <Link className="font-display text-[25px] leading-none font-bold md:text-[32px]" href="/">
    {text}
  </Link>
)

export { Logo }
