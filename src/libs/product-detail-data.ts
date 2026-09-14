import type { Product } from '@/types/product'
import type { ProductDetail, ProductReview } from '@/types/product-detail'

const root = '/images/figma'

const featuredProduct: ProductDetail = {
  id: 'one-life-graphic-t-shirt',
  name: 'One Life Graphic T-shirt',
  image: `${root}/detail-one-life-front.png`,
  gallery: [
    `${root}/detail-one-life-front.png`,
    `${root}/detail-one-life-back.png`,
    `${root}/detail-one-life-model.png`,
  ],
  price: 260,
  originalPrice: 300,
  discount: 40,
  rating: 4.5,
  description:
    'This graphic t-shirt is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.',
  details: [
    { label: 'Material', value: 'Soft, breathable premium cotton blend.' },
    { label: 'Care', value: 'Machine wash cold with similar colors.' },
  ],
  colors: ['#4f4631', '#314f4a', '#31344f'],
  sizes: ['Small', 'Medium', 'Large', 'X-Large'],
}

const productReviews: ProductReview[] = [
  {
    id: 'samantha',
    author: 'Samantha D.',
    rating: 4.5,
    date: 'August 14, 2023',
    content:
      "I absolutely love this t-shirt! The design is unique and the fabric feels so comfortable. As a fellow designer, I appreciate the attention to detail. It's become my favorite go-to shirt!",
  },
  {
    id: 'alex',
    author: 'Alex M.',
    rating: 5,
    date: 'August 15, 2023',
    content:
      'The t-shirt exceeded my expectations! The colors are vibrant and the print quality is top-notch. Being a UI/UX designer myself, I appreciate the quality and finish.',
  },
  {
    id: 'ethan',
    author: 'Ethan R.',
    rating: 4,
    date: 'August 16, 2023',
    content:
      'This t-shirt is a must-have for anyone who appreciates good design. The minimalistic yet stylish pattern caught my eye, and the fit is perfect.',
  },
  {
    id: 'olivia',
    author: 'Olivia P.',
    rating: 5,
    date: 'August 17, 2023',
    content:
      'As a UI/UX enthusiast, I value simplicity and functionality. This t-shirt not only represents those principles but also feels great to wear.',
  },
  {
    id: 'liam',
    author: 'Liam K.',
    rating: 4.5,
    date: 'August 18, 2023',
    content:
      "This t-shirt is a fusion of comfort and creativity. The fabric is soft, and the design speaks volumes about the designer's skill.",
  },
  {
    id: 'ava',
    author: 'Ava H.',
    rating: 4.5,
    date: 'August 19, 2023',
    content:
      "I'm not just wearing a t-shirt; I'm wearing a piece of design philosophy. The intricate details and thoughtful layout make this shirt a conversation starter.",
  },
]

const relatedProducts: Product[] = [
  {
    id: 'polo-contrast',
    image: `${root}/related-contrast-polo.png`,
    name: 'Polo with Contrast Trims',
    price: 212,
    originalPrice: 242,
    discount: 20,
    rating: 4,
  },
  {
    id: 'gradient-graphic',
    image: `${root}/related-gradient-tshirt.png`,
    name: 'Gradient Graphic T-shirt',
    price: 145,
    rating: 3.5,
  },
  {
    id: 'polo-tipping',
    image: `${root}/related-tipping-polo.png`,
    name: 'Polo with Tipping Details',
    price: 180,
    rating: 4.5,
  },
  {
    id: 'black-striped',
    image: `${root}/related-black-striped-tshirt.png`,
    name: 'Black Striped T-shirt',
    price: 120,
    originalPrice: 150,
    discount: 30,
    rating: 5,
  },
]

export { featuredProduct, productReviews, relatedProducts }
