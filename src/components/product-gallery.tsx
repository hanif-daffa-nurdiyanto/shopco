'use client'

import Image from 'next/image'
import { useState } from 'react'

const ProductGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [activeImage, setActiveImage] = useState(images[0])

  return (
    <div className="grid gap-3 md:grid-cols-[152px_1fr] md:gap-3.5">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-card md:order-2 md:aspect-auto md:min-h-132.5">
        <Image
          alt={name}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 445px"
          src={activeImage}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
        {images.map((image, index) => (
          <button
            aria-label={`View product image ${index + 1}`}
            className={`relative aspect-square overflow-hidden rounded-[20px] bg-card ${activeImage === image ? 'ring-1 ring-ink' : ''}`}
            key={image}
            onClick={() => setActiveImage(image)}
          >
            <Image alt="" className="object-cover" fill sizes="152px" src={image} />
          </button>
        ))}
      </div>
    </div>
  )
}

export { ProductGallery }
