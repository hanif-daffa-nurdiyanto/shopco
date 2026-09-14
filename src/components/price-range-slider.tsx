'use client'

import { useState } from 'react'

const PRICE_MIN = 0
const PRICE_MAX = 300
const PRICE_STEP = 10

type Props = {
  initialMaximum?: number
  initialMinimum?: number
}

const getLabelTransform = (percentage: number) => {
  if (percentage === 0) return 'translateX(0)'
  if (percentage === 100) return 'translateX(-100%)'
  return 'translateX(-50%)'
}

const clampPrice = (value: number) => Math.min(Math.max(value, PRICE_MIN), PRICE_MAX)

const PriceRangeSlider = ({ initialMaximum, initialMinimum }: Props) => {
  const selectedMinimum = clampPrice(initialMinimum ?? PRICE_MIN)
  const selectedMaximum = clampPrice(initialMaximum ?? PRICE_MAX)
  const initialLowerBound = Math.min(selectedMinimum, selectedMaximum, PRICE_MAX - PRICE_STEP)
  const initialUpperBound = Math.max(
    selectedMinimum,
    selectedMaximum,
    initialLowerBound + PRICE_STEP,
  )
  const [minimum, setMinimum] = useState(initialLowerBound)
  const [maximum, setMaximum] = useState(initialUpperBound)
  const minimumPercentage = ((minimum - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const maximumPercentage = ((maximum - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100
  const rangeInputClassName =
    'pointer-events-none absolute inset-x-0 top-0 h-6 w-full appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink [&::-moz-range-thumb]:active:cursor-grabbing [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:mt-[-8px] [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:active:cursor-grabbing'

  return (
    <div className="mt-5 px-1">
      <div className="relative h-16">
        <div className="absolute top-2.5 h-1 w-full rounded-full bg-surface" />
        <div
          className="absolute top-2.5 h-1 rounded-full bg-ink"
          style={{ left: `${minimumPercentage}%`, right: `${100 - maximumPercentage}%` }}
        />
        <input
          aria-label="Minimum price"
          className={rangeInputClassName}
          id="minimum-price"
          max={PRICE_MAX}
          min={PRICE_MIN}
          name="minPrice"
          onChange={(event) =>
            setMinimum(Math.min(Number(event.target.value), maximum - PRICE_STEP))
          }
          step={PRICE_STEP}
          style={{ zIndex: minimumPercentage > 90 ? 4 : 3 }}
          type="range"
          value={minimum}
        />
        <input
          aria-label="Maximum price"
          className={rangeInputClassName}
          id="maximum-price"
          max={PRICE_MAX}
          min={PRICE_MIN}
          name="maxPrice"
          onChange={(event) =>
            setMaximum(Math.max(Number(event.target.value), minimum + PRICE_STEP))
          }
          step={PRICE_STEP}
          style={{ zIndex: 4 }}
          type="range"
          value={maximum}
        />
        <output
          className="absolute top-9 text-sm font-medium"
          htmlFor="minimum-price"
          style={{ left: `${minimumPercentage}%`, transform: getLabelTransform(minimumPercentage) }}
        >
          ${minimum}
        </output>
        <output
          className="absolute top-9 text-sm font-medium"
          htmlFor="maximum-price"
          style={{ left: `${maximumPercentage}%`, transform: getLabelTransform(maximumPercentage) }}
        >
          ${maximum}
        </output>
      </div>
    </div>
  )
}

export { PriceRangeSlider }
