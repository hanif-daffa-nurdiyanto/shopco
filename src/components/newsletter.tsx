import Image from 'next/image'

type Props = {
  emailPlaceholder: string
  heading: string
  submitLabel: string
}

const Newsletter = ({ emailPlaceholder, heading, submitLabel }: Props) => (
  <section
    className="relative z-10 mx-auto flex max-w-site flex-col gap-8 rounded-[20px] bg-ink px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-16 md:py-9"
    id="newsletter"
  >
    <h2 className="font-display max-w-137.75 text-[32px] leading-9 font-bold uppercase md:text-[40px] md:leading-11.25">
      {heading}
    </h2>
    <form className="flex w-full flex-col gap-3.5 md:w-87.25">
      <label className="flex h-12 items-center gap-3 rounded-full bg-white px-4">
        <Image alt="" height={24} src="/images/figma/mail.svg" width={24} />
        <input
          aria-label="Email address"
          className="w-full bg-transparent text-ink outline-none"
          placeholder={emailPlaceholder}
          type="email"
        />
      </label>
      <button className="h-12 rounded-full bg-white font-medium text-ink" type="submit">
        {submitLabel}
      </button>
    </form>
  </section>
)

export { Newsletter }
